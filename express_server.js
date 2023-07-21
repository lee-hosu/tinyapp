const express = require('express');
const app = express();
const PORT = 8080; // default port 8080

const urlDatabase = {
  b2xVn2: 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com',
};

// CONFIG for rendering EJS templates
app.set('view engine', 'ejs');

//ROUTE
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

//LISTEN
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
