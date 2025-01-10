const { param, body } = require("express-validator");

const userIdValidate = [param("userId", "userId is in valid").isMongoId()];

const linkIdValidate = [param("linkId", "linkId is in valid").isMongoId()];

const commonLinkValidation = {
  customAddress: body("customAddress")
    .optional()
    .customSanitizer((value) => (value === "" ? undefined : value))
    .isLength({ min: 4, max: 32 })
    .withMessage("Custom address must be between 4 and 32 characters"),

  password: body("password")
    .optional({ nullable: true })
    .customSanitizer((value) => (value === "" ? undefined : value))
    .isLength({ min: 4, max: 16 })
    .withMessage("Password must be between 4 and 16 characters"),

  expiryDate: body("expiryDate")
    .optional({ nullable: true })
    .isString()
    .custom((value) => {
      if (!value) return true;
      try {
        return !!new Date(value);
      } catch (e) {
        return false;
      }
    }),

  description: body("description")
    .optional()
    .customSanitizer((value) =>
      value === "" || value === null ? undefined : value
    )
    .isString()
    .trim()
    .isLength({ min: 0, max: 1024 })
    .withMessage("Description must be at least 1024 characters"),

  domainId: body("domainId")
    .isLength({ min: 24, max: 24 })
    .withMessage("DomainId is invalid"),
};

// Validation rules specific to create
const originalUrlValidation = body("originalUrl")
  .isURL()
  .withMessage("Original URL is invalid");

// Create the validation arrays using the common rules
const createLinkValidation = [
  originalUrlValidation,
  commonLinkValidation.customAddress,
  commonLinkValidation.password,
  commonLinkValidation.expiryDate,
  commonLinkValidation.description,
  commonLinkValidation.domainId,
];

const updateLinkValidation = [
  commonLinkValidation.customAddress,
  commonLinkValidation.password,
  commonLinkValidation.description,
  commonLinkValidation.domainId,
  commonLinkValidation.expiryDate,
];

const passwordValidate = [commonLinkValidation.password];

const updateLinkStatusValidation = [
  param("linkId", "linkId is in valid").isMongoId(),
  body("isDisabled", "isDisabled must be in true/false").isBoolean(),
  body("message").optional({ nullable: true }),
];

module.exports = {
  userIdValidate,
  linkIdValidate,
  createLinkValidation,
  updateLinkValidation,
  passwordValidate,
  updateLinkStatusValidation,
};
