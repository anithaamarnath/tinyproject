
var express = require("express");
var app = express();
var PORT = 8080; // default port 8080



// set the view engine to ejs
app.set("view engine", "ejs");

//set the body handler
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//set the cookie handler
var cookieParser = require('cookie-parser');
app.use(cookieParser());




// Data to store the user name and email

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}


const urlDatabase = {

  "b6UTxQ": { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  "i3BoGr": { longURL: "https://www.google.ca", userID: "aJ48lW" }
};
//------------------------------------------
function generateRandomString() {
var ramdom = 6; //length of the string
var text = "";
var possible = "123e4567-e89b-12d3-a456-426655440000";
for (var i = 0; i < 6; i++) {
text += possible.charAt(Math.floor(Math.random() * 7));
}
return text;
}
//--------------------------------------------------------
var emailexist = function(email) {
  for (var keys in users) {

    if (users[keys].email === email ){
      return users[keys].id;
    }
  }

      return false;

  }



 //-----------------------------------------------------
 var urlsForUser = function (userID) {
 if(!userID){
  return false;
 }
 const urlsForUser = {};
 for (let key in urlDatabase){
   if (urlDatabase[key].userID === userID){
     urlsForUser[key] = urlDatabase[key];
   }
 }
 return urlsForUser;
}


//---------------------------------------------------------

app.get("/", (req, res) => {
 res.send("Hello!");
});

app.listen(PORT, () => {
 console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
 res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
 res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const urlsUser = urlsForUser(req.cookies.user_id);
  if(!urlsUser){
   //user hasnt create any url yet
   //res.send("<html><body><a href='/urls/new'>Create a new short URL</a> </body></html>\n");
   console.log("hi");
   //return;
 }
 let templateVars = { urls: urlsUser, user: users[req.cookies.user_id] };
 res.render("urls_index", templateVars);
});


//Display page----------------
app.get("/urls/new", (req, res) => {

 if(!req.cookies.user_id){
  //n\console.log(req.cookies.user_id);
  res.redirect("/login",);
  return;
 }
 let templateVars = { user:  users[req.cookies.user_id] };
 res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
 let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]
                     ,user:users[req.cookies.user_id]};
 res.render("urls_show", templateVars);
});


// Adds new shortURL:longURL pair given longURL
app.post("/urls", (req, res) => {
 //console.log(req.body);  // Log the POST request body to the console
 const shortURL = generateRandomString();
 const longURL = req.body.longURL;

urlDatabase[shortURL] = {"longURL":longURL, "userID": req.cookies.user_id };//Add new pair of key:value to urlDatabase
 //console.log(urlDatabase[shortURL]);
 res.redirect("/urls");
});

//redirects to longURL given a ShortURL
app.get("/u/:shortURL", (req, res) => {

 //console.log(req.params)dt

 shortURL = req.params.shortURL;
 //console.log(shortURL);

 const longURL =  urlDatabase[shortURL];
 if(longURL){
   res.redirect(longURL);
 }
 else {
  res.status(400).send("the shortURL dosent exist");
 }

});

// deletes a a per key: property from urlDatabase given the shortURL

app.post("/urls/:shortURL/delete", (req, res) =>{
 //console.log("got into delete route");
 //console.log(req.params.shortURL);
 delete urlDatabase[req.params.shortURL];
 res.redirect("/urls");
});

//Update the longURL in the urlDatabase given the shortURL and the new longURL
app.post("/urls/:shortURL", (req,res) => {
 //console.log(req.params);
 //console.log(req.body);
 urlDatabase[req.params.shortURL].longURL = req.body.longURL;
 //console.log(urlDatabase);
 res.redirect(`/urls/${req.params.shortURL}`);

});


app.post("/logout",  (req, res) =>{
 //sets a cookie object{username: "username"}
 res.clearCookie("user_id");
 res.redirect("/urls");
});

// create a get form to register
app.get("/register", (req,res)=>{
  let templateVars = { urls: urlDatabase, user:users[req.cookies.user_id] };


  res.render("register" ,templateVars);
  //console.log("register");



});

//create a post form to register
app.post("/register", (req,res)=>{
  if(!req.body.email || !req.body.password){
   res.status(403).send("Invalid email or password");
   return;
 }
 if(emailexist (req.body.email)){
 res.status(403).send("Email already registered");
return;
 }

  const userid =generateRandomString();
  const user = { 'id' :  userid, 'email' : req.body.email, 'password':req.body.password}

  users[userid] = user;
  res.cookie("user_id",userid);
  res.redirect("/urls");
  //console.log(users[userid]);



});

//---------------------------


app.get("/login", (req, res) =>{
  let templateVars = { urls: urlDatabase, user:users[req.cookies.user_id] };
 res.render("login" , templateVars);
});

//--------------------------------------------------

app.post("/login",  (req, res) =>{

 const userId = emailexist(req.body.email);

 if(userId){
   if (userId === req.cookies.user_id){
     res.send("You are already loged in");
     return;
   }

   if(users[userId].password === req.body.password){
     res.cookie("user_id",userId);
     res.redirect("/urls");
   }
   else {
     // the password is not correct
     res.status(400).send("Incorrect Password");
   }
 }
 else {
   res.status(400).send("User not registered");
 }



});















