const User = require("../models/user");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const config = require("../config");

const signin = async (req, res) => {
  try {
    let user = await User.findOne({
      email: req.body.email,
    });

    if (!user)
      return res.status("401").json({
        error: "User not found",
      });

    if (!user.authenticate(req.body.password)) {
      return res.status("401").send({
        error: "Email and password don't match.",
      });
    }

    const token = jwt.sign(
      {
        _id: user._id,
      },
      config.jwtSecret
    );

    res.cookie("t", token, {
      expire: new Date() + 9999,
    });

    return res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.log(err);
    return res.status("401").json({
      error: "Could not sign in",
    });
  }
};

const signout = (req, res) => {
  res.clearCookie("t");
  return res.status("200").json({
    message: "signed out",
  });
};

const requireSignin = async(req,res)=>{
  
    var accessToken =req.headers['Authorization'];
    accessToken=accessToken.replace(/^Bearer\s+/, "");
    const { userId, exp } = await jwt.verify(accessToken, config.jwtSecret);
    // Check if token has expired
    if (exp < Date.now().valueOf() / 1000) { 
     return res.status(401).json({ error: "JWT token has expired, please login to obtain a new one" });
    } 
    req.user = await User.findById(userId); 
    if(req.user)
      next();
    else 
      res.status(400).json("error auth") 
   
}

const hasAuthorization = (req, res, next) => {
  const authorized = req.profile && req.auth && req.profile._id == req.auth._id;
  const googleauthorized = req.session.user;
  if (authorized == 0 && googleauthorized == 0) {
    return res.status("403").json({
      error: "User is not authorized",
    });
  }
  next();
};

module.exports = {
  signin,
  signout,
  requireSignin,
  hasAuthorization,
};
