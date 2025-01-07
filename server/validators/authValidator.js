const { body } = require("express-validator");

const loginValidate = [
  body("username")
    .exists()
    .withMessage("User name is required")
    .bail()
    .isString()
    .withMessage("User name must be a string"),
  body("password")
    .exists()
    .withMessage("Password is required")
    .bail()
    .isString()
    .withMessage("Password must be a string"),
];

const registerValidate = [
  body("username")
    .exists()
    .withMessage("User name is required")
    .bail()
    .isString()
    .withMessage("User name must be a string"),
  body("email")
    .exists()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Email is invalid"),
  body("password")
    .exists()
    .withMessage("Password is required")
    .bail()
    .isString()
    .withMessage("Password must be a string"),
];

module.exports = {
  loginValidate,
  registerValidate,
};
