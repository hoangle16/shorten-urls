import { Outlet } from "react-router-dom";
import GuestHeader from "../components/GuestHeader";
import GuestFooter from "../components/GuestFooter";

const GuestLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/*Header*/}
      <GuestHeader />
      <main className="flex-grow">
        <Outlet />
      </main>
      {/*Footer*/}
      <GuestFooter />
    </div>
  );
};

export default GuestLayout;
