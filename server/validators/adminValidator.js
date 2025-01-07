const { query } = require("express-validator");

const rangeDateValidate = [
  query("range")
    .optional()
    .custom((value) => {
      if (!value) return true;
      return ["day", "week", "month"].includes(value);
    })
    .withMessage("Invalid range. Use 'day', 'week', or 'month'."),
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

module.exports = { rangeDateValidate };
