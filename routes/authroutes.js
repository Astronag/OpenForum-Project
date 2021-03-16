const express = require("express");
const authCtrl = require("../controllers/authControllers");
const passport = require("passport");
const router = express.Router();
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const config = require("../config");
const Post = require("../models/post");
const mongoose = require("mongoose");
const User = require("../models/user");

var userProfile;

router.get("/error", (req, res) => res.send("error logging in"));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});
passport.use(
  new GoogleStrategy(
    {
      clientID:
        "789965715216-2sbi4nk44kbaabtsqt7vlddgklieksq9.apps.googleusercontent.com",
      clientSecret: "Jtdl2O8dBSJnTUrJ9I6UEBhf",
      callbackURL: "https://openforumsocial.herokuapp.com/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      userProfile = profile;
      return done(null, userProfile);
    }
  )
);
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router
  .route("/auth/google/callback")
  .get(
    passport.authenticate("google", { failureRedirect: "/error" }),
    async function (req, res) {
      let usertofind = await User.findOne({
        email: userProfile["emails"][0]["value"],
      });
      var user = {
        id: userProfile["id"],
        name: userProfile["displayName"],
        signintype: "Google",
        email: userProfile["emails"][0]["value"],
        password: "Google",
      };
      if (!usertofind) {
        
        var userdata = new User(user);

        userdata.save((err, result) => {
          if (err) {
            return res.status(400).json({
              error: err,
            });
          }
        });}

        const token = jwt.sign(
          {
            _id: user.id,
          },
          config.jwtSecret
        );

        res.cookie("t", token, {
          expire: new Date() + 9999,
        });

        return res.json({
          token,
          user: { _id: user.id, name: user.name, email: user.email },
        });
      
    }
  );

router.get("/logout", (req, res) => {
  res.clearCookie("t");
  return res.status("200").json({
    message: "signed out",
  });
});

router.route("/auth/signin").post(authCtrl.signin);
router.route("/auth/signout").get(authCtrl.signout);

module.exports = router;
