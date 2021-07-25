const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config()



exports.requireSignIn = (req, res, next) => {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      const user = jwt.verify(token, process.env.JWT_KEY);
      req.user = user;
    } else {
      return res.status(400).json({ message: "Authorization required" });
    }
    next();
    //jwt.decode()
  };
  exports.adminMiddleware = (req, res, next) => {
    if (req.user.role !== "admin") { 
        return res.status(400).json({ message: "You are not an Admin!! access denied" });
      
    }
    next();
  };
  exports.userMiddleware = (req, res, next) => {
    if (req.user.role !== "user") { 
        return res.status(400).json({ message: "You are not a User!! access denied" });
      
    }
    next();
  };