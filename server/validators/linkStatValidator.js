const { param, query } = require("express-validator");

const linkStatValidate = [
  param("linkId", "linkId is not valid").isMongoId(),
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage(
      "startDate must be a valid ISO 8601 format. Example: 'YYYY-MM-DD'"
    ),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage(
      "endDate must be a valid ISO 8601 format. Example: 'YYYY-MM-DD'"
    ),
  query("groupBy")
    .optional()
    .isIn(["date", "country", "os", "browser", "referrer"])
    .withMessage(
      "groupBy must be one of the following: date, country, os, browser, referrer"
    ),
];

const rangeDateValidate = [
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage(
      "startDate must be a valid ISO 8601 format. Example: 'YYYY-MM-DD'"
    ),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage(
      "endDate must be a valid ISO 8601 format. Example: 'YYYY-MM-DD'"
    ),
];

module.exports = { linkStatValidate, rangeDateValidate };
