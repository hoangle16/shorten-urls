const express = require("express");
const {
  registerValidate,
  loginValidate,
} = require("../validators/authValidator");
const validateRequest = require("../middlewares/validateRequest");

const router = express.Router();

const authController = require("../controllers/authController");
const { authenticateToken } = require("../middlewares/auth");

router.post(
  "/auth/register",
  registerValidate,
  validateRequest,
  authController.register
);

router.post(
  "/auth/login",
  loginValidate,
  validateRequest,
  authController.login
);

router.post("/auth/logout", authenticateToken, authController.logout);

router.post("/auth/renew-tokens", authController.renewTokens);

module.exports = router;
