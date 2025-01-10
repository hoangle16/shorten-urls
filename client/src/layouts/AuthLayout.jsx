import { Outlet, useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { Button } from "../components/Button";

const AuthLayout = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <div
              className="leading-[2.75rem] text-2xl font-bold text-blue-600 cursor-pointer hover:text-blue-700 transition-colors"
              onClick={() => navigate("/")}
            >
              HTL.COM
            </div>
          </div>
        </div>
      </header>
      <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50">
        <div className="w-full max-w-md px-6">
          <Card className="w-full">
            <Outlet />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
