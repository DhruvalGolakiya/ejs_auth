const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
var passport = require("passport");
const session = require("express-session");
var crypto = require("crypto");
const { name } = require("ejs");
var bcrypt = require("bcrypt");
const UserData =  require('./models/data_model')
const mongoose = require('mongoose')
const MongoStore = require('connect-mongo')
var LocalStrategy = require("passport-local").Strategy;
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));


mongoose.connect(
   "mongodb+srv://Dhruval:DhruvalMDDK257@cluster0.eus4ytk.mongodb.net/test"
 );
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});



const initializePassport = require("./passwordAuth");
initializePassport(
  passport,
  (name) => UserData.findOne((user)=> user.name === name)
  // (id) => UserData.find((user) => user.id === id)
);
app.use(
  session({
    secret: "some secret",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl:
        "mongodb+srv://Dhruval:DhruvalMDDK257@cluster0.eus4ytk.mongodb.net/test",
    }),
  })
);
app.use(passport.session());
app.use(passport.initialize());

function validPassword(password, hash) {
  var hashVerify = crypto
    .pbkdf2Sync(password, "122", 10000, 64, "sha512")
    .toString("hex");
  hash = hashVerify;
  return hash;
}

// GENERATE HASH PASSWORD

function genPassword(password) {
  // var salt = crypto.randomBytes(32).toString("hex");
  var genHash = crypto
    .pbkdf2Sync(password, "122", 10000, 64, "sha512")
    .toString("hex");

  return {
    password: genHash,
  };
}


app.post("/register",checkNotAuthenticated, async (req, res, next) => {
  //   const saltHash = genPassword(req.body.password);
  console.log(req.body.password);
  const hashedpassword = await bcrypt.hash(req.body.password, 10);

  const newUser = new UserData({
    name: req.body.name,
    password: hashedpassword,
  });

  newUser.save();
  console.log(newUser);
  // console.log(users.find((user) => user.name === "dhruval"));
  res.redirect("/login/admin");
});

// POST REQ FOR LOGIN USER

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    successRedirect: "/",
  })
);

app.get("/login/admin",checkNotAuthenticated, (req, res) => {
  res.render("index", {
    user: "Admin",
  });
});

app.get("/", checkAuthenticated,(req, res) => {
  res.render("HomePage", {
    name: "Hi",
  });
});
app.get("/register", checkNotAuthenticated,(req, res) => {
  res.render("register", {});
});

// app.get("/login/Customer", (res, req) => {
//   req.render("index", {
//     user: "Customer",
//   });
// });

app.get("/login",checkNotAuthenticated, (req, res) => {
  res.render("LoginPage");
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/register");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

app.listen(3000, () => {
  console.log("server started on port 3000");
});
