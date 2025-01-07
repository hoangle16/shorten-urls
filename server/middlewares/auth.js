const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    const verified = jwt.verify(token, jwtSecret);
    req.user = verified;
    next();
  } catch (err) {
    console.log("auth", err);

    res.status(401).send("Access denied. Invalid token.");
  }
};

const optionalAuthenticateToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (token) {
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        req.user = null;
      } else {
        req.user = decoded;
      }
      next();
    });
  } else {
    req.user = null;
    next();
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).send("Access Denied. Insufficient permissions");
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuthenticateToken,
  authorizeRoles,
};
