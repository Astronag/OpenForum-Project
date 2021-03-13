const express = require("express");
const authCtrl = require("../controllers/authControllers");
const app=express()
const passport=require('passport')
const router = express.Router();
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const config=require('../config')
const User = require("../models/user");
var logout = require('express-passport-logout');

var userProfile;



router.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});
passport.use(new GoogleStrategy({
    clientID: "789965715216-2sbi4nk44kbaabtsqt7vlddgklieksq9.apps.googleusercontent.com",
    clientSecret: "Jtdl2O8dBSJnTUrJ9I6UEBhf",
    callbackURL: "https://openforumsocial.herokuapp.com/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      userProfile=profile;
      return done(null, userProfile);
  }
));
router.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
router.route('/auth/google/callback').get(passport.authenticate('google', { failureRedirect: '/error' }),function(req,res){
    req.session.user=userProfile
    res.json(userProfile)
    
})

router.get('/logout',passport.authenticate('google', { scope : ['profile', 'email'] }), (req, res) =>{ 
   req.session.destroy()
   res.json(req.session.user)
});

router.route("/auth/signin").post(authCtrl.signin);
router.route("/auth/signout").get(authCtrl.signout);


module.exports = router;
