const express = require('express');
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080; // default port 8080
const {
  generateRandomString,
  getUserByEmail,
  addNewUser,
} = require('./helpers');

const urlDatabase = {
  b6UTxQ: {
    longURL: 'https://www.tsn.ca',
    userID: 'abcd',
  },
  i3BoGr: {
    longURL: 'https://www.google.ca',
    userID: 'abcd',
  },
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

const cookieSessionConfig = {
  name: 'myCookieSession',
  keys: ['this-is-secret'],
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};

// CONFIG for rendering EJS templates
app.set('view engine', 'ejs');

// MIDDLEWARE
// transform Buffer into string
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(cookieSession(cookieSessionConfig));

// ROUTE
app.get('/urls/new', (req, res) => {
  const user = req.session.userId;
  if (!user) {
    res.redirect('/login');
  } else {
    const templateVars = { user, urls: urlDatabase };
    res.render('urls_new', templateVars);
  }
});

// :id - variable part of the URL ex. /urls/b2xVn2
app.get('/urls/:id', (req, res) => {
  const user = req.session.userId;
  const templateVars = {
    user,
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
  };

  if (!user) {
    res.send('Please Login or Register');
  } else if (req.session.userId !== urlDatabase[req.params.id].userID) {
    res.send('You do not have an access');
  } else {
    // handle short url ids that do not exist

    if (templateVars.longURL === undefined) {
      res.send('Short URL Does not exist');
    } else {
      res.render('urls_show', templateVars);
    }
  }
});

// redirect to long URL
app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

// URLs
app.get('/urls', (req, res) => {
  const user = req.session.userId;
  console.log('user in the GET', req.session.userId);
  let urlsForUser = function (id) {
    let filteredObj = {};
    for (const key in urlDatabase) {
      let filtered = urlDatabase[key];
      if (filtered.userID === id) {
        filteredObj[key] = filtered;
      }
    }
    return filteredObj;
  };

  const templateVars = { user, urls: urlsForUser(user) };
  if (!user) {
    res.send('Please Login or Register first');
  } else {
    console.log('urlsForUser', urlsForUser(user));
    res.render('urls_index', templateVars);
  }
});

// Form submit - post request
app.post('/urls', (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  let user = req.session.userId;
  // const logInUser = users[req.session.userId];
  console.log('user = ', user);
  if (!user) {
    res.send(`Cannot shorten URLs - Please log in`);
  } else {
    const randomString = generateRandomString(6);
    urlDatabase[randomString] = {
      longURL: req.body['longURL'],
      userID: user,
    };
    console.log(urlDatabase);
    console.log(req.body['longURL']);
    res.redirect(`/urls/${randomString}`);
  }
});

// Edit URL
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[id].longURL = newLongURL;
  res.redirect('/urls');
});

// Delete URL
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  const user = req.session.userId;

  if (!user) {
    res.status(403).send('Please login or Register');
  } else if (!urlDatabase[id]) {
    return res.status(404).send('Short URL does not exist');
  } else if (urlDatabase[id].userID !== user) {
    return res.status(403).send('You do not own this URL');
  }

  for (let key in urlDatabase) {
    if (key === id) {
      delete urlDatabase[key];
    }
  }

  res.redirect('/urls');
});

// Login
app.get('/login', (req, res) => {
  const user = req.session.userId;
  if (user) {
    res.redirect('/urls');
  } else {
    const templateVars = { user, urls: urlDatabase };
    res.render('urls_login', templateVars);
  }
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
  if (!bcrypt.compareSync(password, foundUser.password)) {
    return res.status(400).send('You got the wrong password');
  }

  // res.cookie('userId', foundUser.id);
  req.session.userId = foundUser.id;
  console.log(req.session);
  res.redirect('/urls');
});

// Logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// User Registration
app.get('/register', (req, res) => {
  const user = req.session.userId;
  console.log('/register - user', user);
  if (user) {
    res.redirect('urls');
  } else {
    const templateVars = {
      user,
    };
    res.render('url_register', templateVars);
  }
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  // if user does NOT put in a password or email
  if (!email || !password) {
    res.status(400).send('You must provide an email AND a password');
  }

  // if user email already exist
  if (getUserByEmail(email, users)) {
    return res.status(400).send(`You've already registered`);
  }

  const updateUsers = addNewUser(email, hashedPassword, users);
  req.session.userId = updateUsers;
  console.log('new email registered:', users);
  res.redirect('/urls');
});

// LISTEN
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
