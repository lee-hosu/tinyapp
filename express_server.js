const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080
const {
  generateRandomString,
  getUserByEmail,
  addNewUser,
} = require('./helpers');

const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

const users = {
  abcd: {
    id: 'abcd',
    email: 'a@a.com',
    password: '1234',
  },
  efgh: {
    id: 'efgh',
    email: 'b@b.com',
    password: '1234',
  },
};

// CONFIG for rendering EJS templates
app.set('view engine', 'ejs');

// MIDDLEWARE
// transform Buffer into string
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ROUTE
// READ
app.get('/urls/new', (req, res) => {
  const user = users[req.cookies['userId']];
  const templateVars = { user, urls: urlDatabase };
  res.render('urls_new', templateVars);
});

app.get('/urls', (req, res) => {
  const user = users[req.cookies['userId']];
  const templateVars = { user, urls: urlDatabase };
  res.render('urls_index', templateVars);
});

// :id - variable part of the URL ex. /urls/b2xVn2
app.get('/urls/:id', (req, res) => {
  const user = users[req.cookies['userId']];
  const templateVars = {
    user,
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render('urls_show', templateVars);
});

// redirect to long URL
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// CREATE
// Form submit - post request
app.post('/urls', (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const randomString = generateRandomString(6);
  urlDatabase[randomString] = req.body['longURL'];
  console.log(urlDatabase);
  res.redirect(`/urls/${randomString}`);
  // res.send('Ok'); // Respond with 'Ok' (we will replace this)
});

// Edit URL
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[id] = newLongURL;
  res.redirect('/urls');
});

// Delete URL
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  for (let key in urlDatabase) {
    if (key === id) {
      delete urlDatabase[key];
    }
  }
  res.redirect('/urls');
});

// Login
app.get('/login', (req, res) => {
  const user = users[req.cookies['userId']];
  const templateVars = { user, urls: urlDatabase };
  res.render('urls_login', templateVars);
});
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const foundUser = getUserByEmail(email, users);
  if (!email || !password) {
    res.status(400).send('You must provide an email AND a password');
  }
  // Did not find a user
  if (!foundUser) {
    return res.status(400).send('No user with that email');
  }

  // If the password is incorrect
  if (foundUser.password !== password) {
    return res.status(400).send('You got the wrong password');
  }

  res.cookie('userId', foundUser.id);
  res.redirect('/urls');
});

//Logout
app.post('/logout', (req, res) => {
  res.clearCookie('userId');
  res.redirect('/urls');
});

// User Registration
app.get('/register', (req, res) => {
  const user = users[req.cookies['userId']];
  const templateVars = {
    user,
  };
  res.render('url_register', templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // if user does NOT put in a password or email
  if (!email || !password) {
    res.status(400).send('You must provide an email AND a password');
  }

  // if user email already exist
  if (getUserByEmail(email, users)) {
    return res.status(400).send(`You've already registered`);
  }

  const updateUsers = addNewUser(email, password, users);
  res.cookie('userId', updateUsers);
  console.log('new email registered:', users);
  res.redirect('/urls');
});

// EXAMPLE CODE
app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

// LISTEN
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
