// Required Dependancies
const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

// Helper Functions
const { getUserByEmail } = require('./helper')

// Express app Initialization
const app = express();
const PORT = 8080;

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
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

// Function to generate URLs for a user
function urlsForUser(id) {
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
}

// Function to generate random ID string, used in USER_ID & SHORT URL generation
function generateRandomString() {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    randomString += charset[randomIndex];
  }
  return randomString;
}

// START server
const server = app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});

// route to json URL database - for debugging
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Route for homepage - redirects to login or usable homepage
app.get("/", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login"); // Redirect to login page if user is not logged in
    return;
  }
  res.redirect("/urls"); // Redirect to URLs page if user is logged in
});

// Route to URLs homepage - if logged in
app.get("/urls", (req, res) => {
  const user = users[req.session.user_id]; // Gets user object from session
  if (!user) { // Error if user isnt logged in
    res.status(403).send("<h1>403 Forbidden.</h1> <p>Please log in or register to view this page.</p>");
    return;
  }

  const userUrls = urlsForUser(user.id); // gets URLs for the logged-in user

  const templateVars = {
    user,
    urls: userUrls // Pass the userUrls object to the template
  };
  res.render("urls_index", templateVars);
});

// Route to create new short URL 
app.post("/urls", (req, res) => {
  const user = users[req.session.user_id]; // Gets user Object from session
  const shortURL = generateRandomString(); // Generate a random short URL
  const longURL = req.body.longURL; // Get the long URL from the request body
  urlDatabase[shortURL] = { longURL: longURL, userID: user.id }; // Save the short URL and its corresponding long URL and userID to the database
  res.redirect(`/urls/${shortURL}`); // Redirect to the newly created short URL's page
});

// Route to display form for creating a new TINY_url
app.get("/urls/new", (req, res) => {
  const user = users[req.session.user_id]; // Gets user Object from session
  if (!user) {
    res.redirect("/login"); // Redirect to /login if user is not logged in
  } else {
    const templateVars = {
      user
    };
    res.render("urls_new", templateVars);
  }
});

// Route to display or edit a URL
app.get("/urls/:id", (req, res) => {
  const user = users[req.session.user_id];
  const shortURL = req.params.id;
  const url = urlDatabase[shortURL];
  
  if (shortURL.length > 6) { // Check if the length of the shortURL is longer than 6 characters
    res.status(404).send("<h1>404 Not Found.</h1> <p>Error: URL does not exist.</p>");
    return;
  }
  if (!user) { // Error if user isnt logged in
    res.status(403).send("<h1>403 Forbidden.</h1> <p>Please log in or register to view this page.</p>");
    return;
  }
  if (!url || url.userID !== user.id) { // Check if URL ID belongs to logged in user
    res.status(404).send("<h1>404 Not Found.</h1> <p>Error: URL not found or does not belong to the current user.</p>");
    return;
  }
  
  const templateVars = { 
    shortURL,
    longURL: url,
    user,
    id: shortURL
  };
  res.render("urls_show", templateVars); // Render URL page
});

//Edit or follow LONG_URL
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const newLongURL = req.body.longURL;
  const user = users[req.session.user_id];

  if (!urlDatabase[shortURL]) { // Check if the URL exists
    res.status(404).send("<h1>404 Not Found.</h1><p>Error: URL not found.</p>");
    return;
  }
  if (!user) { // Error if user isnt logged in
    res.status(401).send("<h1>401 Unauthorized.</h1><p>Error: You must be logged in to edit this URL.</p>");
    return;
  }
  if (urlDatabase[shortURL].userID !== user.id) { // Check if the user owns the URL
    res.status(407).send("<h1>407 Forbidden.</h1><p>Error: You are not authorized to delete this URL.</p>Error: You are not authorized to edit this URL.");
    return;
  }

  urlDatabase[shortURL].longURL = newLongURL;// Update the longURL
  res.redirect("/urls");
});

// Route to redirect to long URL page
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id; // Extract the shortURL from the request parameters
  const longURL = urlDatabase[shortURL]; // Get the longURL associated with the shortURL from the urlDatabase

  if (!longURL) { // If the short URL does not exist in the database, send a relevant error message
    res.status(404).send("<h1>404 Not Found.</h1><p>The requested URL does not exist.</p>");
    return;
  } else {
    res.redirect(longURL.longURL); // Redirect to the longURL
  }
});


//Route to delete URL from database - requires login and ownership
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  const user = users[req.session.user_id];

  if (!urlDatabase[shortURL]) {  // Check if the URL exists
    res.status(404).send("<h1>404 Not Found.</h1><p>Error: URL not found.</p>");
    return;
  }
  if (!user) { // Error if user isnt logged in
    res.status(401).send("<h1>401 Unauthorized.</h1><p>Error: You must be logged in to delete this URL.</p>");
    return;
  }
  if (urlDatabase[shortURL].userID !== user.id) { // Check if the user owns the URL
    res.status(403).send("<h1>403 Forbidden.</h1><p>Error: You are not authorized to delete this URL.</p>");
    return;
  }

  // Delete the URL from database
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//Route to Render login page
app.get("/login", (req, res) => {
  const user = users[req.session.user_id]; // Gets user Object from session
  if (user) {
    res.redirect("/urls"); // Redirect to /urls if user is already logged in
  } else {
    res.render("login", { user }); // otherwise render login template
  }
});

//Login route to authentiate user
app.post("/login", (req, res) => {
  const { email, password } = req.body; // Extract email and password from request body
  const user = getUserByEmail(email, users); // Look up the user object using the email

  if (!email || !password) { // Check if email or password fields are empty
    res.status(400).send("<h1>400 Bad Request Error.</h1><p>Email and password cannot be empty</p>");
    return;
  }
  if (!user) { // If a user with provided email is not found, return a response with a 403 status code
    res.status(403).send("<h1>403 Forbidden.</h1><p>Email not found</p>");
    return;
  }
  if (!bcrypt.compareSync(password, user.password)) {  // If the HASHED password does not match, return a response with a 403 status code
    res.status(407).send("<h1>407 Forbidden.</h1><p>Incorrect Email or Password</p>");
    return;
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});

// Logout route to clear session and redirect to login page
app.post("/logout", (req, res) => {
  req.session = null; // Clears session
  res.redirect("/login"); // Redirect back to the /login page
});

// Route to render the registration page
app.get("/register", (req, res) => {
  const user = users[req.session.user_id]; // Gets user Object from session
  if (user) {
    res.redirect("/urls"); // Redirect to /urls if user is already logged in
  } else {
    res.render("register", { user });
  }
});

//Registration route to create a new user and store credentials in database
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) { // check if email or password feilds are empty
    res.status(400).send("<h1>400 Bad Request Error.</h1><p>Email and password cannot be empty</p>");
    return;
  }
  
  if (getUserByEmail(email, users)) { //check if email already exists
    res.status(400).send("<h1>400 Bad Request Error.</h1><p>Email and password cannot be empty</p>Email already exists");
    return;
  }
  // hash the password and create a new user
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userId = generateRandomString();
  const newUser = {
    id: userId,
    email,
    password: hashedPassword
  };

  users[userId] = newUser;
  req.session.user_id = userId;
  res.redirect("/urls");
});

// Export server module
module.exports = server;
