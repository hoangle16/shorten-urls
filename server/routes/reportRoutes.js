const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const {
  authenticateToken,
  authorizeRoles,
  optionalAuthenticateToken,
} = require("../middlewares/auth");
const { roles } = require("../consts/consts");
const {
  validateCreateReport,
  validateGetReports,
  validateGetReportsByLinkId,
  validateGetReportById,
  validateDeleteReport,
  validateDeleteReports,
  validateUpdateReportStatus,
} = require("../validators/reportValidator");
const validateRequest = require("../middlewares/validateRequest");

router.post(
  "/reports",
  optionalAuthenticateToken,
  validateCreateReport,
  validateRequest,
  reportController.createReport
);

router.get(
  "/reports",
  authenticateToken,
  authorizeRoles(roles.admin),
  validateGetReports,
  validateRequest,
  reportController.getReports
);

router.get(
  "/reports/link/:linkId",
  authenticateToken,
  authorizeRoles(roles.admin),
  validateGetReportsByLinkId,
  validateRequest,
  reportController.getReportsByLinkId
);

router.get(
  "/reports/stats",
  authenticateToken,
  authorizeRoles(roles.admin),
  reportController.getReportStats
);

router.get(
  "/reports/:reportId",
  authenticateToken,
  authorizeRoles(roles.admin),
  validateGetReportById,
  validateRequest,
  reportController.getReportById
);

router.put(
  "/reports/:reportId",
  authenticateToken,
  authorizeRoles(roles.admin),
  validateUpdateReportStatus,
  validateRequest,
  reportController.updateReportStatus
);

router.delete(
  "/reports/:reportId",
  authenticateToken,
  authorizeRoles(roles.admin),
  validateDeleteReport,
  validateRequest,
  reportController.deleteReport
);

router.delete(
  "/reports",
  authenticateToken,
  authorizeRoles(roles.admin),
  validateDeleteReports,
  validateRequest,
  reportController.deleteReports
);

module.exports = router;
