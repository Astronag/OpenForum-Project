const express = require("express");
const authCtrl = require("../controllers/authControllers");
const app=express()
const passport=require('passport')
const router = express.Router();
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const config=require('../config')
var userProfile;



router.get('/success', (req, res) => res.send(userProfile));
router.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});
passport.use(new GoogleStrategy({
    clientID: config.clientid,
    clientSecret: config.clientsecret,
    callbackURL: "/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      userProfile=profile;
      return done(null, userProfile);
  }
));
router.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
router.route('/auth/google/callback').get(passport.authenticate('google', { failureRedirect: '/error' }),function(req,res){
    console.log(res.json())
    res.redirect('/success');
})
router.route("/auth/signin").post(authCtrl.signin);
router.route("/auth/signout").get(authCtrl.signout);

module.exports = router;
