import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./Button";
import { useAuth } from "../features/auth/state/AuthContext";
import { Menu, X } from "lucide-react";

const GuestHeader = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavigation = (path) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
    navigate("/");
  };

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div
            className="text-2xl font-bold text-blue-600 cursor-pointer hover:text-blue-700 transition-colors"
            onClick={() => handleNavigation("/")}
          >
            HTL.COM
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-4">
            {isAuthenticated ? (
              <>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    if (user?.role === "admin") {
                      handleNavigation("/admin");
                    } else {
                      handleNavigation("/user");
                    }
                  }}
                  size="md"
                >
                  Dashboard
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleLogout}
                  size="md"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => handleNavigation("/login")}
                  size="md"
                >
                  Login
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => handleNavigation("/register")}
                >
                  Register
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t">
            <div className="flex flex-col gap-4">
              {isAuthenticated ? (
                <>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => {
                      if (user?.role === "admin") {
                        handleNavigation("/admin");
                      } else {
                        handleNavigation("/user");
                      }
                    }}
                    size="md"
                    className="w-full"
                  >
                    Dashboard
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={handleLogout}
                    size="md"
                    className="w-full"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => handleNavigation("/login")}
                  size="md"
                  className="w-full"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default GuestHeader;
