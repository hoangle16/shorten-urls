const { body, query, param } = require("express-validator");
const { roles, userSortKey } = require("../consts/consts");
const { isMongoId } = require("validator");

const emailValidate = [
  body("email")
    .exists()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Email is invalid"),
];

const tokenValidate = [
  query("token").exists().withMessage("Token is required"),
];

const resetPasswordValidate = [
  body("password")
    .exists()
    .withMessage("Password is required")
    .bail()
    .isLength({ min: 8, max: 32 })
    .withMessage("Password must be between 8 and 32 characters"),
  body("confirmPassword")
    .exists()
    .withMessage("Confirm Password is required")
    .bail()
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Confirm Password does not match Password"),
  query("token").exists().withMessage("Token is required"),
];

const changePasswordValidate = [
  body("currentPassword")
    .exists()
    .withMessage("Current Password is required")
    .bail()
    .isLength({ min: 8, max: 32 })
    .withMessage("Current Password must be between 8 and 32 characters"),
  body("newPassword")
    .exists()
    .withMessage("New Password is required")
    .bail()
    .isLength({ min: 8, max: 32 })
    .withMessage("New Password must be between 8 and 32 characters"),
  body("confirmPassword")
    .exists()
    .withMessage("Confirm Password is required")
    .bail()
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage("Confirm Password does not match New Password"),
];

const userQueryValidate = [
  query("search")
    .optional({ nullable: true })
    .isString()
    .withMessage("Search must be a string"),
  query("isVerify")
    .optional({ nullable: true })
    .isBoolean()
    .withMessage("isVerify must be a boolean"),
  query("isBanned")
    .optional({ nullable: true })
    .isBoolean()
    .withMessage("isBanned must be a boolean"),
  query("role")
    .optional({ nullable: true })
    .isIn(Object.values(roles))
    .withMessage(`Role must be in ${Object.values(roles).toString()}`),
  query("sortBy")
    .optional({ nullable: true })
    .isIn(userSortKey)
    .withMessage(
      `sortBy by must be in ${Object.values(userSortKey).toString()}`
    ),
  query("sortOrder")
    .optional({ nullable: true })
    .isIn(["asc", "desc"])
    .withMessage("sortOrder must be either 'asc' or 'desc'"),
  query("limit")
    .optional({ nullable: true })
    .isNumeric()
    .withMessage("Limit must be a number"),
  query("page")
    .optional({ nullable: true })
    .isNumeric()
    .withMessage("Page must be a number"),
];

const userIdValidate = [param("userId").isMongoId("userId must be a MongoId")];

const userIdsValidate = [
  body("userIds")
    .isArray({ min: 1 })
    .withMessage("userIds must be an non-empty array")
    .custom((values) => {
      return !values.some((value) => !isMongoId(value));
    })
    .withMessage("Each userId must be a valid MongoId"),
];

module.exports = {
  emailValidate,
  tokenValidate,
  resetPasswordValidate,
  changePasswordValidate,
  userQueryValidate,
  userIdValidate,
  userIdsValidate,
};
