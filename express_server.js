
var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bcrypt = require('bcrypt');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['hi this is secret'],

}));


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
  const urlsUser = urlsForUser(req.session.user_id);
  if(!urlsUser){

 }
 let templateVars = { urls: urlsUser, user: users[req.session.user_id] };
 res.render("urls_index", templateVars);
});



app.get("/urls/new", (req, res) => {
  if(!req.session.user_id){
  res.redirect("/login",);
  return;
 }
 let templateVars = { user:  users[req.session.user_id] };
 res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
 let templateVars = {
                      shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL,
                      user:users[req.session.user_id]
                    };
  console.log("test ",templateVars);
 res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
 const shortURL = generateRandomString();
 const longURL = req.body.longURL;


urlDatabase[shortURL] = {"longURL":longURL, "userID": req.session.user_id };

 res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {

 shortURL = req.params.shortURL;
 const longURL =  urlDatabase[shortURL].longURL;
 if(longURL){
   res.redirect(longURL);
 }
 else {
  res.status(400).send("the shortURL dosent exist");
 }

});

app.post("/urls/:shortURL/delete", (req, res) =>{
  delete urlDatabase[req.params.shortURL];
 res.redirect("/urls");
});

app.post("/urls/:shortURL", (req,res) => {

 urlDatabase[req.params.shortURL].longURL= req.body.longURL;
 res.redirect(`/urls/${req.params.shortURL}`);
});


app.post("/logout",  (req, res) =>{

  req.session.user_id = null;
  res.redirect("/urls");
});

app.get("/register", (req,res)=>{
  let templateVars = { urls: urlDatabase, user:users[req.session.user_id] };
  res.render("register" ,templateVars);
});

app.post("/register", (req,res)=>{

  if(!req.body.email || !req.body.password){
   res.status(403).send("Invalid email or password");
   return;
 }


 if(emailexist (req.body.email)){
 res.status(403).send("Email already registered");
return;
 }

  const newId =generateRandomString();
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);


  const newUser = { 'id' :  newId,
                  'email' : req.body.email,
                  'password': hashedPassword }
  req.session.user_id = newId;

   users[newId] = newUser;
   res.redirect("/urls");
});

app.get("/login", (req, res) =>{
  let templateVars = { urls: urlDatabase, user:users[req.session.user_id]};
 res.render("login" , templateVars);
});



app.post("/login",  (req, res) =>{
  let userFound;
 const userId = emailexist(req.body.email);

 if(userId){
   if (userId === req.session.user_id){
     res.send("You are already loged in");
     return;
   }

   if (bcrypt.compareSync(req.body.password, users[userId].password) ) {
    req.session.user_id = userId;
    res.redirect("/urls");
   }
   else {

     res.status(400).send("Incorrect Password");
   }
 }
 else {
   res.status(400).send("User not registered");
 }
});















