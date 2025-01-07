import { useEffect } from "react";
import { useAuth } from "../state/AuthContext";
import { useNavigate } from "react-router-dom";

const LogoutPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    logout();
  }, [logout, navigate]);

  return null;
};

export default LogoutPage;
