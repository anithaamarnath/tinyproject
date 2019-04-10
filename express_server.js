var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

app.set("view engine", "ejs")
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/hello", (req, res) => {
  //res.send("<html><body>Hello <b>World</b></body></html>\n");
  let templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  //console.log(res.params.shortURL);
  res.render("urls_show", templateVars);
});
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




function generateRandomString(random) {

var text = "";
var possible = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
for (var i = 0; i < 6; i++) {
 text += possible.charAt(Math.floor(Math.random() * 7));
}
return text;
}
generateRandomString(6);