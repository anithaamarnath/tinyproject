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


var urlDatabase = {
 "b2xVn2": "http://www.lighthouselabs.ca",
 "9sm5xK": "http://www.google.com"
};
//------------------------------------------
function generateRandomString() {
var ramdom = 6; //length of the string
var text = "";
var possible = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
for (var i = 0; i < 6; i++) {
text += possible.charAt(Math.floor(Math.random() * 7));
}
return text;
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
 let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
 res.render("urls_index", templateVars);
});

//Display page
app.get("/urls/new", (req, res) => {
 let templateVars = { username: req.cookies["username"] };
 res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
 let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]
                     ,username: req.cookies["username"]};
 res.render("urls_show", templateVars);
});


// Adds new shortURL:longURL pair given longURL
app.post("/urls", (req, res) => {
 console.log(req.body);  // Log the POST request body to the console
 const shortURL = generateRandomString();
 const longURL = req.body.longURL;
 urlDatabase[shortURL] = longURL; //Add new pair of key:value to urlDatabase
 console.log(urlDatabase);
 res.redirect("/u/:" + shortURL);
});

//redirects to longURL given a ShortURL
app.get("/u/:shortURL", (req, res) => {

 //console.log(req.params);

 shortURL = req.params.shortURL;
 //console.log(shortURL);

 const longURL =  urlDatabase[shortURL];
 if(longURL){
   res.redirect(longURL);
 }
 else{
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
 urlDatabase[req.params.shortURL] = req.body.longURL;
 console.log(urlDatabase);
 res.redirect(`/urls/${req.params.shortURL}`);

});

app.post("/login",  (req, res) =>{
 //sets a cookie object{username: "username"}
 res.cookie("username",req.body.username);
 res.redirect("/urls");
});
app.post("/logout",  (req, res) =>{
 //sets a cookie object{username: "username"}
 res.clearCookie("username",req.body.username);
 res.redirect("/urls");
});




