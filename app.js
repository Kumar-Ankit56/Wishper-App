//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
var _ = require("lodash");
const mongoose = require("mongoose");
require("dotenv").config();
var session = require('express-session')
const passport=require('passport')
const passportLocalMongoose=require('passport-local-mongoose')
var cookieParser = require('cookie-parser')

const app = express();
app.use(cookieParser())

app.set("view engine", "ejs");

var posts = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


//setup session
app.use(session({
  secret: 'Ourfullstringsecret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true }
}))


//Intialise passport
app.use(passport.initialize());


//use session through passport
app.use(passport.session());


//Conntect database with mongoose
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((con) => {
    //console.log(con.connections);
    console.log("Successfull");
  })
  .catch((e) => {
    console.log(e);
  });

//Creating New Schema for Item
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

//This will help to hasing and salting the sesitive area
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);


// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/secrets", function(req, res){
  if (req.isAuthenticated()){
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});


app.post("/register", function (req, res) {
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });
});

app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });
});

app.listen(process.env.PORT, function () {
  console.log(`Server started on port ${process.env.PORT}`);
});
