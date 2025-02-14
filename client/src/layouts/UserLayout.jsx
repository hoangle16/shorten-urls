import { Outlet } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../features/auth/state/AuthContext";
import { Bell, ChartSpline, Home, Link, Menu, User } from "lucide-react";
import { Button } from "../components/Base";
import Sidebar from "../components/Sidebar";
import UserFooter from "../features/users/components/UserFooter";
import Breadcrumb from "../components/Breadcumb";
import Popover from "../components/Popover";
import Notification from "../features/shared/component/Notification";
const UserLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleUnreadCountChange = (count) => {
    setUnreadCount(count);
  };

  const { user, logout } = useAuth();
  const navigationItems = [
    { path: "/user", icon: <Home size={20} />, label: "Dashboard" },
    { path: "/user/profile", icon: <User size={20} />, label: "Profile" },
    { path: "/user/links", icon: <Link size={20} />, label: "Links" },
    { path: "/user/stats", icon: <ChartSpline size={20} />, label: "Stats" },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        user={user}
        navigationItems={navigationItems}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onLogout={handleLogout}
        userRole="User"
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Top Header - Fixed */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 sticky top-0 z-10">
          <Button
            variant="custom"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:invisible p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu size={20} />
          </Button>

          <div className="flex items-center space-x-4">
            <Popover
              content={
                <Notification onUnreadCountChange={handleUnreadCountChange} />
              }
              trigger="click"
              position="bottom"
              align="right"
              offset={0}
            >
              <Button
                variant="custom"
                className="p-2 rounded-lg  hover:bg-gray-100 relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-2 w-4 h-4 text-sm text-white bg-red-500 rounded-full flex justify-center items-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </Popover>
          </div>
        </header>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-auto">
          {/* Main Content Area */}
          <main className="min-h-[calc(100%-64px)] p-6">
            <Breadcrumb />
            <Outlet />
          </main>
          {/* Footer scrolls with content */}
          <UserFooter />
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
