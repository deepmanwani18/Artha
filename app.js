//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/artha", { useNewUrlParser: true });
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  fname: String,
  lname: String,
  email: String,
  password: String,
  gender: String,
  hobbies: [],
  state: String,
  city: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
  res.redirect('/loggedin');
});

app.get('/home', function (req, res) {
  res.render('home');
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/loggedin", function (req, res) {
  if (req.isAuthenticated()) {
    User.find()
      .then(users => res.render("loggedin", { users }))
      .catch(err => console.log(err));
  } else {
    res.redirect("/home");
  }
});

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

app.get('/remove/:id', function (req, res) {
  User.remove({ _id: req.params.id })
    .then(user => res.redirect('/loggedin'))
    .catch(err => console.log(err))
});

app.post("/register", function (req, res) {
  User.register({ username: req.body.username }, req.body.password, function (err, user) {
    if (err) {
      console.log(err.message);
      res.render("register");

    } else {
      user.fname = req.body.fname;
      user.lname = req.body.lname;
      user.gender = req.body.gender;
      user.hobbies = req.body.hobbies;
      user.state = req.body.state;
      user.city = req.body.city;
      user.save();
      passport.authenticate("local")(req, res, function () {
        res.redirect("/loggedin");
      });
    }
  });

});

app.post('/login', passport.authenticate('local', {
  failurīeRedirect: '/login',
  successRedirect: '/loggedin',
}), function (req, res) {
  res.redirect('/loggedin');
});
app.listen(3000, function () {
  console.log("Server started on port 3000.");
});
