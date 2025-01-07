import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/state/AuthContext";
import { getDefaultRouteForRole } from "../utils/roleUtils";
import Loading from "./Loading";

export const ProtectedRoute = ({ children, roles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading fullScreen={true} />;
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return children;
};
