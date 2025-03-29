/////// app.js

const path = require("node:path");
const { Pool } = require("pg");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const LocalStrategy = require('passport-local').Strategy;
require("dotenv").config();

const pool = new Pool({
  host: "localhost", // or wherever the db is hosted
  user: "postgres",
  database: "top_users",
  password: "12345678",
  port: 5432 // The default port
});

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.render("index", { user: req.user });
});


app.get("/sign-up", (req, res) => res.render("sign-up-form"));

app.post("/sign-up", async (req, res, next) => {
  try {
   const hashedPassword = await bcrypt.hash(req.body.password, 10);
   await pool.query("insert into users (username, password) values ($1, $2)", [req.body.username, hashedPassword]);
   res.redirect("/");
  } catch (error) {
     console.error(error);
     next(error);
    }
 });
 

app.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/"
  })
);

app.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});




// We need to add three functions , the first function is : Setting up the local strategy
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
      const user = rows[0];

      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        // passwords do not match!
        return done(null, false, { message: "Incorrect password" })
      }
      return done(null, user);
    } catch(err) {
      return done(err);
    }
  })
);
//This function is what will be called when we use the passport.authenticate() function later. Basically, it takes a username and password, tries to find the user in our DB, and then makes sure that the user’s password matches the given password. If all of that works out (there’s a user in the DB, and the passwords match) then it authenticates our user and moves on! We will not be calling this function directly, so you won’t have to supply the done function. This function acts a bit like a middleware and will be called for us when we ask passport to do the authentication later

//function two and three : session and serialization
// To make sure our user is logged in, and to allow them to stay logged in as they move around our app, passport internally calls a function from express-session that uses some data to create a cookie called connect.sid which is stored in the user’s browser.

//The reason they require us to define these functions is so that we can make sure that whatever bit of data it’s looking for actually exists in our Database! passport.serializeUser takes a callback which contains the information we wish to store in the session data. passport.deserializeUser is called when retrieving a session, where it will extract the data we “serialized” in it then ultimately attach something to the .user property of the request object (req.user) for use in the rest of the request.

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    const user = rows[0];

    done(null, user);
  } catch(err) {
    done(err);
  }
});



app.listen(3000, () => console.log("app listening on port 3000!"));
