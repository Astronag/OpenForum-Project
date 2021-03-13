const express = require("express");
const authCtrl = require("../controllers/authControllers");
const app=express()
const passport=require('passport')
const router = express.Router();
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const config=require('../config')
const User = require("../models/user");
var userProfile;



router.get('/success', (req, res) => {res.send(userProfile)

    const userdetails={
    "name":req.user.displayName,
    "email":req.user.emails[0].value
}
const user=new User(userdetails)

try {
    await user.save();
      return res.status(200).json({
        message: "Successfully signed up!",
      });
    } catch (err) {
      return res.status(400).json({
        error: err,
      });
    }

});
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
    console.log(res.json())
    res.redirect('/success');
})
router.route("/auth/signin").post(authCtrl.signin);
router.route("/auth/signout").get(authCtrl.signout);

module.exports = router;
