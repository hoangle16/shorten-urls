const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { authenticateToken, authorizeRoles } = require("../middlewares/auth");
const { roles } = require("../consts/consts");

//TODO: add validation
router.post(
  "/notifications",
  authenticateToken,
  authorizeRoles(roles.admin),
  notificationController.createNotification
);

router.get(
  "/notifications/user/:userId",
  authenticateToken,
  notificationController.getNotificationsByUserId
);

router.put(
  "/notifications/read",
  authenticateToken,
  notificationController.markAllAsRead
);

router.put(
  "/notifications/:notificationId/read",
  authenticateToken,
  notificationController.markAsRead
);

router.delete(
  "/notifications/:notificationId",
  authenticateToken,
  authorizeRoles(roles.admin),
  notificationController.deleteNotification
);

router.delete(
  "/notifications",
  authenticateToken,
  authorizeRoles(roles.admin),
  notificationController.deleteNotifications
);

module.exports = router;
