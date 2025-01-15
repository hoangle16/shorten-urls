const asyncHandler = require("express-async-handler");
const notificationService = require("../services/notificationService");
const { roles } = require("../consts/consts");
const { CustomError } = require("../helpers/utils");

const createNotification = asyncHandler(async (req, res) => {
  const { userId, message, type, meta } = req.body;
  const notification = await notificationService.createNotification({
    userId,
    message,
    type,
    meta,
  });
  res.status(201).json(notification);
});

const getNotificationsByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { isUnreadList, page, limit } = req.query;
  if (userId !== req.user.id && req.user.role !== roles.admin) {
    throw new CustomError("Unauthorized", 403);
  }
  const result = await notificationService.getNotificationsByUserId(
    userId,
    isUnreadList,
    page,
    limit
  );
  res.json(result);
});

const markAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  await notificationService.markAsRead(notificationId);
  res.json({ message: "Notification marked as read" });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  await notificationService.markAllAsRead(userId);
  res.json({ message: "All notifications marked as read" });
});

const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  await notificationService.deleteNotification(notificationId);
  res.status(204).json({ message: "Notification deleted successfully" });
});

const deleteNotifications = asyncHandler(async (req, res) => {
  const { notificationIds } = req.body;
  await notificationService.deleteNotifications(notificationIds);
  res.status(204).json({ message: "Notifications deleted successfully" });
});

module.exports = {
  createNotification,
  getNotificationsByUserId,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteNotifications,
};
