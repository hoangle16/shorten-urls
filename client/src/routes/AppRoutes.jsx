import { lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { PublicOnlyRoute } from "../components/PublicOnlyRoute";
import GuestLayout from "../layouts/GuestLayout";
import AuthLayout from "../layouts/AuthLayout";
import AdminLayout from "../layouts/AdminLayout";
import Logout from "../features/auth/pages/Logout";
import ForgotPassword from "../features/auth/pages/ForgotPassword";
import ResetPassword from "../features/auth/pages/ResetPassword";
import VerifyEmail from "../features/auth/pages/VerifyEmail";
import EmailVerified from "../features/auth/pages/EmailVerified";
import VerificationProtectedLink from "../features/links/pages/VerificationProtectedLink";
import UserLayout from "../layouts/UserLayout";
import UserDashboard from "../features/users/pages/UserDashboard";
import Profile from "../features/users/pages/Profile";
import LinksManager from "../features/links/pages/LinksManager";
import StatsManager from "../features/stats/pages/StatsManager";
import LinkStat from "../features/stats/pages/LinkStat";
import UpdateLink from "../features/links/pages/UpdateLink";
import ListStatByLinkId from "../features/stats/pages/ListStatByLinkId";
import AdminDashboard from "../features/admin/page/AdminDashboard";
import LinkDetail from "../features/links/pages/LinkDetail";
import UserManagement from "../features/admin/page/UserManagement";
import UserDetail from "../features/admin/page/UserDetail";
import LinkManagement from "../features/admin/page/LinkManagement";
import LinkDetailManagement from "../features/admin/page/LinkDetailManagement";
import LinkStatManagement from "../features/admin/page/LinkStatManagement";
import DomainManagement from "../features/admin/page/DomainManagement";
import ReportLink from "../features/report/pages/ReportLink";
import ReportManagement from "../features/admin/page/ReportManagement";
import ReportDetailManagement from "../features/admin/page/ReportDetailManagement";

const Login = lazy(() => import("../features/auth/pages/Login"));
const Register = lazy(() => import("../features/auth/pages/Register"));

const GuestHome = lazy(() => import("../pages/GuestHome"));
const NotFound = lazy(() => import("../pages/NotFound"));
const Unauthorized = lazy(() => import("../pages/Unauthorized"));

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route element={<GuestLayout />}>
        <Route path="/" element={<GuestHome />} />
        <Route
          path="/:shortCode/protected"
          element={<VerificationProtectedLink />}
        />
        <Route path="/report" element={<ReportLink />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Route>

      {/* Auth */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />
        <Route path="/logout" element={<Logout />} />
        <Route
          path="/forgot-password"
          element={
            <PublicOnlyRoute>
              <ForgotPassword />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicOnlyRoute>
              <ResetPassword />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/verify-email"
          element={
            <PublicOnlyRoute>
              <VerifyEmail />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/email-verified"
          element={
            <PublicOnlyRoute>
              <EmailVerified />
            </PublicOnlyRoute>
          }
        />
      </Route>

      {/* User route */}
      <Route
        element={
          <ProtectedRoute roles={["user"]}>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/user/profile" element={<Profile />} />
        <Route path="/user/stats" element={<StatsManager />} />
        <Route path="/user/links" element={<LinksManager />} />
        <Route path="/user/links/:linkId" element={<LinkDetail />} />
        <Route path="/user/links/:linkId/stat" element={<LinkStat />} />
        <Route
          path="/user/links/:linkId/stat-list"
          element={<ListStatByLinkId />}
        />
        <Route path="/user/links/:linkId/edit" element={<UpdateLink />} />
      </Route>

      {/*Admin route*/}
      <Route
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/profile" element={<Profile />} />

        <Route path="/admin/links" element={<LinkManagement />} />
        <Route path="/admin/links/:linkId" element={<LinkDetailManagement />} />
        <Route
          path="/admin/links/:linkId/stat"
          element={<LinkStatManagement />}
        />

        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/users/:userId" element={<UserDetail />} />

        <Route path="/admin/domains" element={<DomainManagement />} />

        <Route path="/admin/reports" element={<ReportManagement />} />
        <Route
          path="/admin/reports/:reportId"
          element={<ReportDetailManagement />}
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
