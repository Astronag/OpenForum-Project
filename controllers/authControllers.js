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

const requireSignin = async(req,res,next)=>{
  
    var accessToken =req.headers.authorization
    console.log(accessToken)
    if(accessToken!=undefined){
    accessToken=accessToken.replace(/^Bearer\s+/, "");
    console.log(accessToken)
    const userId = await jwt.verify(accessToken, config.jwtSecret);
    // Check if token has expired
   
    req.user = await User.findById(userId); 
    if(req.user){
    
      next();
    }
    else
       res.status(401).send("Not authorized")
  }
    else 
     next()
   
}

const hasAuthorization = (req, res, next) => {
  const authorized = req.profile && req.user && req.profile._id == req.user._id;
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
