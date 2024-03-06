// app dependancies
const express = require("express");
const cookieParser = require('cookie-parser');
//server dependancies
const app = express();
const PORT = 8080;

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

// sample url database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
// sample users database
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// ID string generator, used in USER_ID & SHORT URL generation
function generateRandomString() {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    randomString += charset[randomIndex];
  }
  return randomString;
}
//DRY code function to see if email exists in database
function getUserByEmail(email) { 
  for (const userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return null;
}

app.listen(PORT, () => {
  console.log(`Example appl listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Unused Homepage
app.get("/", (req,res) => {
  res.send("Hello");
});

//True app Homepage
app.get("/urls", (req, res) => {
  const user = users[req.cookies.user_id]; // Lookup the user object using the user_id cookie value
  const userURLs = {}; // Initialize an empty object to store URLs associated with the current user
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === req.cookies.user_id) { // Check if the URL belongs to the current user
      userURLs[shortURL] = urlDatabase[shortURL].longURL; // Add the URL to the user's URLs object
    }
  }
  const templateVars = {
    user,
    urls: userURLs // Pass the user's URLs object to the template
    // ... any other vars
  };
  res.render("urls_index", templateVars);
});

//Homepage redirect handler
app.post("/urls", (req, res) => {
  const user = users[req.cookies.user_id]; // Lookup the user object using the user_id cookie value
  if (!user) {
    res.status(403).send("You must be logged in to shorten URLs."); // Respond with 403 status code if user is not logged in
  } else {
    const shortURL = generateRandomString(); // Generate a random short URL
    const longURL = req.body.longURL; // Get the long URL from the request body
    urlDatabase[shortURL] = { longURL: longURL, userID: user.id }; // Save the short URL and its corresponding long URL and userID to the database
    res.redirect(`/urls/${shortURL}`); // Redirect to the newly created short URL's page
  }
});

//Creating a new TINY_url
app.get("/urls/new", (req, res) => {
  const user = users[req.cookies.user_id]; // Lookup the user object using the user_id cookie value
  if (!user) {
    res.redirect("/login"); // Redirect to /login if user is not logged in
  } else {
    const templateVars = {
      user
    };
    res.render("urls_new", templateVars);
  }
});

//URL page by TINY_URL_ID
app.get("/urls/:id", (req, res) => {
  const user = users[req.cookies.user_id]; // Lookup the user object using the user_id cookie value
  const shortURL = req.params.id;
  const url = urlDatabase[shortURL];
  if (!url || url.userID !== req.cookies.user_id) { // Check if the URL exists and belongs to the current user
    res.status(404).send("Error: URL not found or does not belong to the current user.");
    return;
  }
  const templateVars = { 
    shortURL, 
    longURL: url.longURL,
    user,
    id: shortURL // Pass the shortURL as id to the template
  };
  res.render("urls_show", templateVars);
});

//Redirect to URL from TINY_URL_ID
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id; // Extract the shortURL from the request parameters
  const longURL = urlDatabase[shortURL]; // Get the longURL associated with the shortURL from the urlDatabase

  if (!longURL) {
    // If the short URL does not exist in the database, send a relevant error message
    res.status(404).send("<h1>404 Not Found</h1><p>The requested URL does not exist.</p>");
  } else {
    res.redirect(longURL.longURL); // Redirect to the longURL
  }
});

//delete URL from database
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id; // Extract the shortURL from the request parameters
  const user = users[req.cookies.user_id]; // Lookup the user object using the user_id cookie value
  if (!urlDatabase[shortURL]) { // Check if the URL exists
    res.status(404).send("Error: URL not found.");
    return;
  }
  if (!user) { // Check if the user is logged in
    res.status(401).send("Error: You must be logged in to delete this URL.");
    return;
  }
  if (urlDatabase[shortURL].userID !== user.id) { // Check if the user owns the URL
    res.status(403).send("Error: You are not authorized to delete this URL.");
    return;
  }
  delete urlDatabase[shortURL]; // Delete the URL
  res.redirect("/urls");
});

//Edit or follow LONG_URL
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const newLongURL = req.body.longURL;
  const user = users[req.cookies.user_id]; // Lookup the user object using the user_id cookie value
  if (!urlDatabase[shortURL]) { // Check if the URL exists
    res.status(404).send("Error: URL not found.");
    return;
  }
  if (!user) { // Check if the user is logged in
    res.status(401).send("Error: You must be logged in to edit this URL.");
    return;
  }
  if (urlDatabase[shortURL].userID !== user.id) { // Check if the user owns the URL
    res.status(403).send("Error: You are not authorized to edit this URL.");
    return;
  }
  urlDatabase[shortURL].longURL = newLongURL; // Update the longURL
  res.redirect("/urls");
});

//Login redirect handler
app.post("/login", (req, res) => {
  const { email, password } = req.body; // Extract email and password from request body
  const user = getUserByEmail(email); // Look up the user object using the email

  if (!email || !password) { // Check if email or password fields are empty
    res.status(400).send("Email and password cannot be empty");
    return;
  }
  if (!user) { // If a user with that email cannot be found, return a response with a 403 status code
    res.status(403).send("Email not found");
    return;
  }
  if (user.password !== password) { // If the passwords do not match, return a response with a 403 status code
    res.status(403).send("Incorrect Email or Password");
    return;
  }
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

//clear user_id cookies upon logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id'); // Set cookie named 'user_id' with the submitted value
  res.redirect("/login"); // Redirect back to the /login page
});

//render register page
app.get("/register", (req, res) => {
  const user = users[req.cookies.user_id]; // Lookup the user object using the user_id cookie value
  if (user) {
    res.redirect("/urls"); // Redirect to /urls if user is already logged in
  } else {
    res.render("register", { user });
  }
});
//Register redirect handler
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) { // check if email or password feilds are empty
    res.status(400).send("Email and password cannot be empty");
    return;
  }
  
  if (getUserByEmail(email)) { //check if email already exists at login
    res.status(400).send("Email already exists");
    return;
  }
  const userId = generateRandomString();
  const newUser = {
    id: userId,
    email,
    password
  };

  users[userId] = newUser;
  res.cookie("user_id", userId);
  res.redirect("/urls");
});

//render login page
app.get("/login", (req, res) => {
  const user = users[req.cookies.user_id]; // Lookup the user object using the user_id cookie value
  if (user) {
    res.redirect("/urls"); // Redirect to /urls if user is already logged in
  } else {
    res.render("login", { user }); // Pass the user variable to the login template
  }
});