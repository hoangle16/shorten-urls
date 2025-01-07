const express = require("express");
const { authenticateToken, authorizeRoles } = require("../middlewares/auth");
const router = express.Router();
const { roles } = require("../consts/consts");
const adminController = require("../controllers/adminController");
const { rangeDateValidate } = require("../validators/adminValidator");
const validateRequest = require("../middlewares/validateRequest");

router.get(
  "/admin/dashboard/overview",
  authenticateToken,
  authorizeRoles(roles.admin),
  adminController.getAdminDashboardOverview
);

router.get(
  "/admin/dashboard/chart",
  authenticateToken,
  authorizeRoles(roles.admin),
  rangeDateValidate,
  validateRequest,
  adminController.getAdminDashboardChart
);

module.exports = router;
