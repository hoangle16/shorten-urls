const jwt = require("jsonwebtoken");
const { isTokenBlacklisted } = require("../helpers/utils");
const jwtSecret = process.env.JWT_SECRET;

const authenticateToken = async (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  if (await isTokenBlacklisted(token)) {
    return res
      .status(401)
      .json({ message: "Access denied. The token is blacklisted." });
  }

  try {
    const verified = jwt.verify(token, jwtSecret);
    if (await isTokenBlacklisted(verified.id)) {
      return res
        .status(401)
        .json({ message: "Access denied. The token is blacklisted." });
    }
    req.user = verified;
    next();
  } catch (err) {
    console.log("auth", err);

    res.status(401).json({ message: "Access denied. Invalid token." });
  }
};

const optionalAuthenticateToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (token) {
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        if (err instanceof jwt.TokenExpiredError && req.cookies.refreshToken) {
          return res.status(401).send("Access denied. Token expired.");
        }
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
