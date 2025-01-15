import { useEffect, useState, useCallback, useRef } from "react";
import useSocket from "../../../hooks/useSocket";
import { useAuth } from "../../auth/state/AuthContext";
import { useToast } from "../../../state/ToastContext";
import { Bell, BellDot, Check, Ellipsis } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/Tabs";
import {
  notificationKeys,
  useListsByUserId,
  useMarkAllAsRead,
  useMarkAsRead,
} from "../../notifications/hooks/useNotifications";
import Loading from "../../../components/Loading";
import { timeFromNow } from "../../../utils/dateUtils";
import Popover from "../../../components/Popover";
import { useQueryClient } from "@tanstack/react-query";

const TABS = {
  ALL: "All",
  UNREAD: "Unread",
};

const TAB_CONFIGS = {
  [TABS.ALL]: {
    label: "All",
    isUnreadList: false,
  },
  [TABS.UNREAD]: {
    label: "Unread",
    isUnreadList: true,
  },
};

const ITEMS_PER_PAGE = 10;

const NotificationList = ({
  notifications,
  expandedIds,
  onNotificationClick,
  isFetchingNextPage,
}) => {
  if (notifications.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">No notifications</div>
    );
  }

  return (
    <>
      {notifications.map((notification) => (
        <div
          key={notification._id}
          className={`mb-2 border-b p-2 ${
            notification?.isRead ? "" : "bg-blue-50"
          } flex items-start cursor-pointer`}
          onClick={() => onNotificationClick(notification)}
        >
          <div className="w-8 mt-1">
            {notification.isRead ? <Bell size={20} /> : <BellDot size={20} />}
          </div>
          <div className="flex-1">
            <p
              className={`${
                expandedIds.includes(notification._id) ? "" : "line-clamp-3"
              }`}
            >
              {notification.message}
            </p>
            <p className="text-sm text-blue-700">
              {timeFromNow(notification.createdAt)}
            </p>
          </div>
        </div>
      ))}
      {isFetchingNextPage && (
        <div className="flex justify-center py-2">
          <Loading size="1.5rem" />
        </div>
      )}
    </>
  );
};

const Notification = ({ onUnreadCountChange }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { notification, isConnected } = useSocket(user?._id);
  const [activeTab, setActiveTab] = useState(TABS.ALL);
  const [expandedIds, setExpandedIds] = useState([]);
  const containerRef = useRef(null);
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useListsByUserId({
    userId: user?._id,
    isUnreadList: TAB_CONFIGS[activeTab].isUnreadList,
    limit: ITEMS_PER_PAGE,
  });

  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  // Handle tab change
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    // Reset scroll position when changing tabs
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  };

  const invalidateNotificationQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
  }, [queryClient]);

  // Handle new notifications via socket
  useEffect(() => {
    if (notification) {
      console.log("Received notification", notification);
      addToast(notification?.message, { variant: "info" });
      invalidateNotificationQueries();
    }
  }, [notification, invalidateNotificationQueries]);

  // Infinite scroll implementation
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const scrollThreshold = 100;

    if (
      scrollHeight - (scrollTop + clientHeight) < scrollThreshold &&
      !isFetchingNextPage &&
      hasNextPage
    ) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  const handleNotificationClick = (notification) => {
    setExpandedIds((prev) =>
      prev.includes(notification._id)
        ? prev.filter((item) => item !== notification._id)
        : [...prev, notification._id]
    );
    if (!notification.isRead) {
      markAsRead.mutate(notification._id);
    }
  };

  const handleMarkAll = () => {
    markAllAsRead.mutate();
  };

  // Flatten all notifications from all pages
  const allNotifications =
    data?.pages?.flatMap((page) => page.notifications) || [];

  const unreadCount = data?.pages?.[0]?.unreadCount || 0;
  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
  }, [unreadCount, onUnreadCountChange]);

  return (
    <div
      className="w-96 px-4 py-2 max-h-[70vh] overflow-auto shadow-lg"
      ref={containerRef}
    >
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-lg font-bold text-gray-800">
          Notifications{" "}
          {unreadCount > 0 && (
            <span className="text-sm text-blue-600">({unreadCount})</span>
          )}
        </h1>
        <Popover
          trigger="click"
          position="bottom"
          align="right"
          offset={0}
          content={({ onClose }) => (
            <div className="w-52 py-2">
              <ul>
                <li
                  className="flex items-center gap-2 p-2 bg-gray-100 cursor-pointer hover:bg-gray-200"
                  onClick={() => {
                    handleMarkAll();
                    onClose();
                  }}
                >
                  <Check size={20} />
                  <span className="text-sm text-gray-700">
                    Mark all as read
                  </span>
                </li>
              </ul>
            </div>
          )}
        >
          <Ellipsis size={20} />
        </Popover>
      </div>

      <Tabs
        defaultValue={TABS.ALL}
        value={activeTab}
        onValueChange={handleTabChange}
        variant="pills"
      >
        <TabsList className="mb-2">
          {Object.entries(TAB_CONFIGS).map(([value, { label }]) => (
            <TabsTrigger key={value} value={value}>
              <h3>{label}</h3>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="min-h-[200px] relative">
          {isLoading ? (
            <div className="flex justify-center items-center absolute inset-0">
              <Loading size="2rem" />
            </div>
          ) : (
            <TabsContent value={activeTab}>
              <NotificationList
                notifications={allNotifications}
                expandedIds={expandedIds}
                onNotificationClick={handleNotificationClick}
                isFetchingNextPage={isFetchingNextPage}
              />
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default Notification;
