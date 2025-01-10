const { body, param, query } = require("express-validator");

const validateCreateReport = [
  body("linkId")
    .optional()
    .isMongoId()
    .withMessage("Link ID must be a mongoId"),
  body("shortUrl")
    .optional()
    .isURL({
      require_tld: false,
      allow_underscores: true,
      require_protocol: true,
      protocols: ["http", "https"],
    })
    .withMessage("Short URL must be a valid URL"),
  body().custom((value, { req }) => {
    if (!req.body.linkId && !req.body.shortUrl) {
      throw new Error("Either linkId or shortUrl must be provided");
    }
    return true;
  }),
  body("type")
    .notEmpty()
    .withMessage("Type is required")
    .isIn(["abuse", "spam", "offensive", "other"])
    .withMessage("Invalid report type"),
  body("description")
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage("Description must be a string and max 500 characters"),
];

const validateGetReports = [
  query("search").optional().isString().withMessage("Search must be a string"),
  query("status")
    .optional()
    .isIn(["pending", "reviewed", "resolved", "rejected"])
    .withMessage("Invalid status"),
  query("type")
    .optional()
    .isIn(["abuse", "spam", "offensive", "other"])
    .withMessage("Invalid type"),
  query("sortBy")
    .optional()
    .isIn(["createdAt", "updatedAt"])
    .withMessage("Invalid sortBy field"),
  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Invalid sortOrder"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

const validateGetReportsByLinkId = [
  param("linkId")
    .notEmpty()
    .withMessage("Link ID is required")
    .isMongoId()
    .withMessage("Link ID must be a mongoId"),
];

const validateGetReportById = [
  param("reportId")
    .notEmpty()
    .withMessage("Report ID is required")
    .isMongoId()
    .withMessage("Report ID must be a mongoId"),
];

const validateUpdateReportStatus = [
  param("reportId")
    .notEmpty()
    .withMessage("Report ID is required")
    .isMongoId()
    .withMessage("Report ID must be a mongoId"),
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["pending", "reviewed", "resolved", "rejected"])
    .withMessage("Invalid status"),
  body("action")
    .optional()
    .isIn(["warning", "disable"])
    .withMessage("Invalid action"),
  body("isChangeRelated")
    .isIn([true, false])
    .withMessage("Invalid isChangeRelated"),
  body("adminNotes")
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage("Admin notes must be a string and max 500 characters"),
];

const validateDeleteReport = [
  param("reportId")
    .notEmpty()
    .withMessage("Report ID is required")
    .isMongoId()
    .withMessage("Report ID must be a mongoId"),
];

const validateDeleteReports = [
  body("reportIds")
    .isArray({ min: 1 })
    .withMessage("Report IDs must be a non-empty array"),
  body("reportIds.*")
    .isMongoId()
    .withMessage("Each Report ID must be a mongoId"),
];

module.exports = {
  validateCreateReport,
  validateGetReports,
  validateGetReportsByLinkId,
  validateGetReportById,
  validateUpdateReportStatus,
  validateDeleteReport,
  validateDeleteReports,
};
