const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur',
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
  },
};

function generateRandomString(length) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let randomString = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    randomString += characters.charAt(randomIndex);
  }
  return randomString;
}

// CONFIG for rendering EJS templates
app.set('view engine', 'ejs');

// MIDDLEWARE
// transform Buffer into string
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ROUTE
// READ
app.get('/urls/new', (req, res) => {
  const templateVars = { username: req.cookies['username'], urls: urlDatabase };
  res.render('urls_new', templateVars);
});

app.get('/urls', (req, res) => {
  const templateVars = { username: req.cookies['username'], urls: urlDatabase };
  res.render('urls_index', templateVars);
});

// :id - variable part of the URL ex. /urls/b2xVn2
app.get('/urls/:id', (req, res) => {
  const templateVars = {
    username: req.cookies['username'],
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

app.get('/register', (req, res) => {
  res.render('url_register');
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

// Login & Logout
app.post('/login', (req, res) => {
  const newUser = req.body.username;
  console.log(newUser);
  res.cookie('username', `${newUser}`);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

// User Registration
app.post('/register', (req, res) => {
  const randomString = generateRandomString(6);
  users[randomString] = {
    id: randomString,
    email: req.body.email,
    password: req.body.password,
  };
  res.cookie('user_id', randomString);
  console.log(users);
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
