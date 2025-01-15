import {
  useQuery,
  keepPreviousData,
  useQueryClient,
  useMutation,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { notificationApis } from "../api/notificationApis";

export const notificationKeys = {
  all: ["notifications"],
  lists: () => [...notificationKeys.all, "list"],
  listByUserId: (filters) => [...notificationKeys.lists(), "byUser", filters],
  //
};

export const useListsByUserId = (filters) => {
  return useInfiniteQuery({
    queryKey: notificationKeys.listByUserId(filters),
    queryFn: ({ pageParam = 1 }) =>
      notificationApis.getNotificationsByUserId({
        ...filters,
        page: pageParam,
      }),
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasMore) {
        return lastPage.pagination.currentPage + 1;
      }
      return undefined;
    },
    enabled: !!filters?.userId,
  });
};

export const useCreateNotification = (addToast) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApis.createNotification,
    onError: (err) => {
      console.error("Failed to create notification", err);
    },
    onSuccess: (_, { userId }) => {
      addToast("Notification sent successfully", { variant: "success" });
      queryClient.invalidateQueries(notificationKeys.lists());
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApis.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(notificationKeys.lists());
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApis.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(notificationKeys.lists());
    },
  });
};

export const useDeleteNotification = (addToast) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApis.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries(notificationKeys.lists());
      addToast("Notification deleted successfully!", { variant: "success" });
    },
    onError: (err) => {
      console.error("Failed to delete notification", err);
    },
  });
};

export const useDeleteNotifications = (addToast) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApis.deleteNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries(notificationKeys.lists());
      addToast("Deleted Notifications successfully!", {
        variant: "success",
      });
    },
    onError: () => {
      console.error("Failed to delete notifications");
    },
  });
};
