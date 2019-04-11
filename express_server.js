var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser') //set cookie

app.set("view engine", "ejs")
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser())




var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//res.render("urls_index", templateVars);
function generateRandomString(random) {

var text = "";
var possible = "123e4567-e89b-12d3-a456-426655440000";
for (var i = 0; i < 6; i++) {
 text += possible.charAt(Math.floor(Math.random() * 7));
}
return text;
}
//generateRandomString(6);

app.get("/hello", (req, res) => {
  //res.send("<html><body>Hello <b>World</b></body></html>\n");
  let templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

//cookies
app.post("/login", (req,res)=>{

 res.cookie("username", req.body.username); // set cookie to the user name


res.redirect("urls");
});


  //console.log(cookieParser());

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL] ,
    username: req.cookies["username"]};
  //console.log(res.params.shortURL);
  res.render("urls_show", templateVars);
});

app.post("/u", (req, res) => {
  console.log(req.body);
  const shortURL = generateRandomString(6);
  const longURL = req.body.longURL;
  res.redirect("/u" + shortURL)

                           // Log the POST request body to the console
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

//update the long url
app.post("/urls/:shortURL" , (req,res)=> {

 urlDatabase[req.params.shortURL] = req.body.longURL;

 res.redirect(`/urls/${req.params.shortURL}`);


})
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];

    if(longURL){
  res.redirect(longURL);
 }   else {
  res.status(400).send("the shortURL dosent exist");
  }
  res.redirect(longURL);

  res.status(301).redirect(longURL);
});



app.post("/urls/:shortURL/delete", (req,res)=> {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");

});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});





