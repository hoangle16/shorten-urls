import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, LogOut, ChevronLeft } from "lucide-react";
import { Button } from "./Button";

const Sidebar = ({
  user,
  navigationItems,
  isSidebarOpen,
  onToggleSidebar,
  onLogout,
  siteName = "HTL.COM",
  userRole = "User",
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let resizing = false;
    const handleResize = () => {
      if (!resizing) {
        resizing = true;
        if (window.innerWidth <= 768 && isSidebarOpen) {
          onToggleSidebar(false);
        }
        setTimeout(() => {
          resizing = false;
        }, 200);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarOpen, onToggleSidebar]);

  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => onToggleSidebar(false)}
        />
      )}

      <aside
        className={`
          ${
            isSidebarOpen
              ? "translate-x-0 w-64"
              : "-translate-x-full w-64 md:w-20 md:translate-x-0"
          }
          bg-white shadow-lg fixed md:relative h-full z-30
          transform transition-all duration-300 ease-in-out
      `}
      >
        {/* Sidebar Header */}
        <div
          className={`h-16 flex items-center ${
            isSidebarOpen ? "justify-between" : "justify-center"
          }  px-4 border-b`}
        >
          <h1
            className={`font-bold text-xl text-blue-600 cursor-pointer ${
              !isSidebarOpen && "md:hidden"
            }`}
            onClick={() => navigate("/")}
          >
            {siteName}
          </h1>
          <Button
            variant="custom"
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {isSidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-center space-x-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                user?.avatar?.url ? "bg-white" : "bg-blue-500"
              }`}
            >
              {user?.avatar?.url ? (
                <img
                  className="w-full h-full object-cover rounded-full"
                  src={user?.avatar?.url}
                  alt="User Avatar"
                />
              ) : (
                <span>{user?.email?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            {isSidebarOpen && (
              <div
                className={`flex-1 overflow-hidden ${
                  !isSidebarOpen && "md:hidden"
                }`}
              >
                <p className="font-medium truncate">{user?.email}</p>
                <p className="text-sm text-gray-500 truncate">{userRole}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-2">
          {navigationItems.map((item) => (
            <Button
              key={item.path}
              variant="custom"
              onClick={() => {
                navigate(item.path);
                if (window.innerWidth < 768) {
                  onToggleSidebar(false);
                }
              }}
              className={`
              w-full flex items-center space-x-3 p-3 rounded-lg
              ${
                location.pathname === item.path
                  ? "bg-blue-50 text-blue-600"
                  : "hover:bg-gray-100"
              }
              ${!isSidebarOpen && "md:justify-center"}
              transition-colors duration-200
            `}
            >
              {item.icon}
              <span className={!isSidebarOpen ? "md:hidden" : ""}>
                {item.label}
              </span>
            </Button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-4 w-full px-2">
          <Button
            variant="custom"
            onClick={onLogout}
            className={`
            w-full flex items-center space-x-3 p-3 rounded-lg
            hover:bg-red-50 hover:text-red-600 text-gray-700
            ${!isSidebarOpen && "md:justify-center"}
            transition-colors duration-200
          `}
          >
            <LogOut size={20} />
            <span className={!isSidebarOpen ? "md:hidden" : ""}>Logout</span>
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
