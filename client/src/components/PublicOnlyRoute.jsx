import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/state/AuthContext";
import { getDefaultRouteForRole } from "../utils/roleUtils";

export const PublicOnlyRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    if (location.state?.from?.pathname) {
      return <Navigate to={location.state.from.pathname} replace />;
    }

    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return children;
};
