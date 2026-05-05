import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import VerifyOtp from "./pages/auth/VerifyOtp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProviders from "./pages/admin/AdminProviders";
import UserDashboard from "./pages/user/UserDashboard";
import ProviderDashboard from "./pages/provider/ProviderDashboard";
import DashboardLayout from "./components/DashboardLayout";
import AdminLayout from "./components/AdminLayout";
import { useAuthStore } from "./store/useAuthStore";


const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    const isAdminPath = location.pathname.startsWith("/admin");
    return <Navigate to={isAdminPath ? "/admin/login" : "/login"} replace />;
  }

  if (allowedRoles && (!user?.role || !allowedRoles.includes(user.role))) {
    return <Navigate to="/login" replace />;
  }

  // Use AdminLayout for admin routes, otherwise DashboardLayout
  if (user?.role === "admin") {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated) {
    // Redirect authenticated users to their dashboard based on role
    if (user?.role === "admin") return <Navigate to="/admin" />;
    if (user?.role === "provider") return <Navigate to="/provider" />;
    return <Navigate to="/user" />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/verify-otp" element={<PublicRoute><VerifyOtp /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
          
          <Route path="/admin/login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
          
          <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/providers" element={<ProtectedRoute allowedRoles={["admin"]}><AdminProviders /></ProtectedRoute>} />
          <Route path="/provider" element={<ProtectedRoute allowedRoles={["provider"]}><ProviderDashboard /></ProtectedRoute>} />
          <Route path="/user" element={<ProtectedRoute allowedRoles={["user"]}><UserDashboard /></ProtectedRoute>} />
          
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
    </Router>
    </>
  );
};

export default App;
