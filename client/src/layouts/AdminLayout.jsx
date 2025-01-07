import { useState } from "react";
import { useAuth } from "../features/auth/state/AuthContext";
import {
  Bell,
  ChartNoAxesCombined,
  Globe,
  Home,
  Link2,
  Menu,
  SquareUserRound,
  Users,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { Button } from "../components/Button";
import { Outlet } from "react-router-dom";
import Breadcrumbs from "../components/Breadcumb";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { user: admin, logout } = useAuth();
  const navigationItems = [
    { path: "/admin", icon: <Home size={20} />, label: "Dashboard" },
    {
      path: "/admin/profile",
      icon: <SquareUserRound size={20} />,
      label: "Profile",
    },
    { path: "/admin/links", icon: <Link2 size={20} />, label: "Links" },
    // {
    //   path: "/admin/stats",
    //   icon: <ChartNoAxesCombined size={20} />,
    //   label: "Stats",
    // },
    { path: "/admin/users", icon: <Users size={20} />, label: "Users" },
    { path: "/admin/domains", icon: <Globe size={20} />, label: "Domains" },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        user={admin}
        navigationItems={navigationItems}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onLogout={handleLogout}
        userRole="Admin"
      />

      <div className="flex-1 flex flex-col h-screen overflow-auto">
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 sticky top-0 z-10">
          <Button
            variant="custom"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:invisible p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu size={20} />
          </Button>

          <div className="flex items-center space-x-4">
            <Button
              variant="custom"
              className="p-2 rounded-lg hover:bg-gray-100 relative"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <main className="min-h-[calc(100%-64px)] p-6">
            <Breadcrumbs />
            <Outlet />
          </main>

          {/* Footer */}
          <footer className="bg-white border-t h-16 p-4 mt-auto">
            <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
              <p className="text-gray-600 mb-4 sm:mb-0">
                &copy; 2024 htl.com All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
