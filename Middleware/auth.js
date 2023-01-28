const jwt = require("jsonwebtoken");

const HttpError = require("./../models/http-error");

// authentication middleware
// pulls off token from authorization header
// decodes token using jwt verify and jwt secret key
// adds userData property containing userId to req object
module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") return next(); // bypasses browser OPTION request convention
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) throw new Error("Authentication failed.");

    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    req.userData = {
      userId: decodedToken.userId,
    };
    next();
  } catch (error) {
    return next(new HttpError("Authentication failed.", 403));
  }
};
