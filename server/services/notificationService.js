const Notification = require("../models/Notification");
const { CustomError } = require("../helpers/utils");

const createNotification = async ({
  userId,
  message,
  type = "info",
  meta = {},
}) => {
  const notification = new Notification({ userId, message, type, meta });
  return await notification.save();
};

const getNotificationsByUserId = async (
  userId,
  isUnreadList,
  page = 1,
  limit = 10
) => {
  const query = { userId };
  if (isUnreadList) {
    query.isRead = false;
  }
  const [notifications, total, unreadTotal] = await Promise.all([
    await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    await Notification.countDocuments(query),
    await Notification.countDocuments({
      userId,
      isRead: false,
    }),
  ]);

  return {
    notifications,
    unreadCount: unreadTotal,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      limit,
      hasMore: (page - 1) * limit + notifications.length < total,
    },
  };
};

const markAsRead = async (notificationId) => {
  return await Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true }
  );
};

const markAllAsRead = async (userId) => {
  return await Notification.updateMany({ userId }, { isRead: true });
};

const deleteNotification = async (notificationId) => {
  return await Notification.findByIdAndDelete(notificationId);
};

const deleteNotifications = async (notificationIds) => {
  return await Notification.deleteMany({ _id: { $in: notificationIds } });
};

module.exports = {
  createNotification,
  getNotificationsByUserId,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteNotifications,
};
