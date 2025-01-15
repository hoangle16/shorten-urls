import apiClient from "../../../utils/apiClient";
import { generateQueryURL } from "../../../utils/helper";

export const notificationApis = {
  createNotification: async ({ userId, message, type, meta }) => {
    const response = await apiClient.post("/api/notifications", {
      userId,
      message,
      type,
      meta,
    });
    return response.data;
  },
  getNotificationsByUserId: async ({ userId, isUnreadList, page, limit }) => {
    const url = generateQueryURL(`/api/notifications/user/${userId}`, {
      isUnreadList,
      page,
      limit,
    });
    const response = await apiClient.get(url);
    return response.data;
  },
  markAsRead: async (notificationId) => {
    const response = await apiClient.put(
      `/api/notifications/${notificationId}/read`
    );
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await apiClient.put(`/api/notifications/read`);
    return response.data;
  },
  deleteNotification: async (notificationId) => {
    const response = await apiClient.delete(
      `/api/notifications/${notificationId}`
    );
    return response.data;
  },
  deleteNotifications: async (notificationIds) => {
    const response = await apiClient.delete("/api/notifications", {
      data: { notificationIds },
    });
    return response.data;
  },
};
