const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

function generateRandomString() {
  const min = 100000;
  const max = 999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

// CONFIG for rendering EJS templates
app.set('view engine', 'ejs');

// MIDDLEWARE
// transform Buffer into string
app.use(express.urlencoded({ extended: true }));

// ROUTE
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.post('/urls', (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send('Ok'); // Respond with 'Ok' (we will replace this)
});

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

// :id - variable part of the URL ex. /urls/b2xVn2
app.get('/urls/:id', (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render('urls_show', templateVars);
});

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
