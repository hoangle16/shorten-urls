import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/authApi";
import { userApi } from "../../users/api/userApi";
import { useLocation, useNavigate } from "react-router-dom";
import { getDefaultRouteForRole } from "../../../utils/roleUtils";
import Loading from "../../../components/Loading";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const storedUserInfo = localStorage.getItem("userInfo");
      if (!storedUserInfo) {
        const userInfo = await userApi.getUserProfile();
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
        setUser(userInfo);
      } else {
        setUser(JSON.parse(storedUserInfo));
      }

      // if (location.pathname === "/") {
      //   navigate(getDefaultRouteForRole(user?.role), { replace: true });
      // }
    } catch (err) {
      console.error("Auth check failed", err);
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");
      setError("Session expired. Please log in again.");
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const { user, token } = await authApi.login(credentials);
      localStorage.setItem("token", token);
      localStorage.setItem("userInfo", JSON.stringify(user));
      setUser(user);
      setError(null);

      const redirectPath =
        location.state?.from?.pathname || getDefaultRouteForRole(user.role);
      navigate(redirectPath, { replace: true });
      return user;
    } catch (err) {
      setError(err.response?.data?.message || "Invalid login credentials.");
      throw err;
    }
  };

  const logout = async () => {
    await authApi.logout();
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    setUser(null);
    navigate("/login");
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("userInfo", JSON.stringify(updatedUser));
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      login,
      logout,
      updateUser,
      isAuthenticated: !!user,
    }),
    [user, loading, error]
  );

  if (loading) {
    return <Loading fullScreen={true} />;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
