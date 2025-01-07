import { Outlet } from "react-router-dom";
import { Card } from "../components/Card";

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50">
      <div className="w-full max-w-md px-6">
        <Card className="w-full">
          <Outlet />
        </Card>
      </div>
    </div>
  );
};

export default AuthLayout;
