
var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bcrypt = require('bcrypt');

var cookieSession = require('cookie-session');

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['hi-this-is-secret'],
  maxAge:24*60*1000

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

function generateRandomString() {
var ramdom = 6; //length of the string
var text = "";
var possible = "123e4567-e89b-12d3-a456-426655440000";
for (var i = 0; i < 6; i++) {
text += possible.charAt(Math.floor(Math.random() * 7));
}
return text;
}

var emailExist = function(email) {
  for (var keys in users) {

    if (users[keys].email === email ){
      return users[keys].id;
    }
  }
  return false;
  }

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

app.get("/urls", (req, res) => {
if(!req.session.user_id) {
  res.send("<html><body>You are not logged in <a href='/login'>Login</a> </body></html>\n");
   return;

}

  const urlsUser = urlsForUser(req.session.user_id);
  if(!urlsUser){
    res.send("<html><body><a href='/urls_new'>Create a new short URL</a> </body></html>\n");
    return;
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
  if(!req.session.user_id){
   res.send("<html><body>You are not logged in <a href='/login'>Login</a> </body></html>\n");
   return;
 }
 const short = req.params.shortURL;
 if(!urlDatabase[short] ){
   res.status(400).send("this shortURL does not exist");
   return;
 }

 if(urlDatabase[short].userID === req.session.user_id){
 let templateVars = {
                      shortURL: short, longURL: urlDatabase[short].longURL,
                      user:users[req.session.user_id]
                    };



 res.render("urls_show", templateVars);
} else
res.status(403).send("you have no access to modify this url");
});

app.post("/urls", (req, res) => {
 const shortURL = generateRandomString();
 const longURL = req.body.longURL;


urlDatabase[shortURL] = {"longURL":longURL, "userID": req.session.user_id };

 res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {

  const short = req.params.shortURL;
  if(!urlDatabase[short] ){
   res.status(400).send("this shortURL does not exist");
   return;
 }
 const longURL =  urlDatabase[short].longURL;
 if(longURL){
   res.redirect(longURL);
 }
 else {
  res.status(400).send("the URL dosent exist");
 }

});

app.post("/urls/:shortURL/delete", (req, res) =>{
  const short = req.params.shortURL;
 if(req.session.user_id === urlDatabase[short].userID){
  delete urlDatabase[short];
 res.redirect("/urls");
} else {
   res.status(403).send("You have no access to delete this url");
}
});

app.post("/urls/:shortURL", (req,res) => {
  const short = req.params.shortURL;
  if(req.session.user_id === urlDatabase[short].userID){

     urlDatabase[short].longURL= req.body.longURL;
     res.redirect("/urls/");
      return;
   }else{
     res.status(403).send("You have no access to delete this url");
     }
});


app.post("/logout",  (req, res) =>{

  req.session = null;
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


 if(emailExist (req.body.email)){
 res.status(403).send("Email already registered");
return;
 }

  const newId =generateRandomString();
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);


  const newUser = { 'id' :  newId,
                  'email' : req.body.email,
                  'password': hashedPassword }


   users[newId] = newUser;
   req.session.user_id = newId;
   res.redirect("/urls");
});

app.get("/login", (req, res) =>{
  let templateVars = { urls: urlDatabase, user:users[req.session.user_id]};
 res.render("login" , templateVars);
});



app.post("/login",  (req, res) =>{
  let userFound;
 const userId = emailExist(req.body.email);

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
app.listen(PORT, () => {
 console.log(`Example app listening on port ${PORT}!`);
});















