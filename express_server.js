const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = '';
  for (let i = 0; i < 6; i++) { // Generating a string of length 6
    const randomIndex = Math.floor(Math.random() * charset.length);
    randomString += charset[randomIndex];
  }
  return randomString;
}

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(); // Generate a random short URL
  const longURL = req.body.longURL; // Get the long URL from the request body
  urlDatabase[shortURL] = longURL; // Save the short URL and its corresponding long URL to the database
  res.redirect(`/urls/${shortURL}`); // Redirect to the newly created short URL's page
});


app.get("/", (req,res) => {
  res.send("Hello");
});

app.listen(PORT, () => {
  console.log(`Example appl listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b> World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
    // ... any other vars
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    // other variables as needed
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { 
    id, 
    longURL,
    username: req.cookies["username"] // Pass the username here
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id; // Extract the shortURL from the request parameters
  const longURL = urlDatabase[shortURL]; // Get the longURL associated with the shortURL from the urlDatabase
    res.redirect(longURL); // Redirect to the longURL
  
});

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id; // Extract the shortURL from the request parameters
    delete urlDatabase[shortURL]; // Remove the URL resource using the delete operator
    res.redirect("/urls"); // Redirect the client back to the urls_index page
 
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[id] = newLongURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { username } = req.body; // Extract username from request body
  res.cookie('username', username); // Set cookie named 'username' with the submitted value
  res.redirect("/urls"); // Redirect back to the /urls page
});

app.post("/logout", (req, res) => {
  res.clearCookie('username'); // Set cookie named 'username' with the submitted value
  res.redirect("/urls"); // Redirect back to the /urls page
});

