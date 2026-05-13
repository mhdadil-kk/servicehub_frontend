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
import AdminServices from "./pages/admin/AdminServices";
import AdminProviderDetail from "./pages/admin/AdminProviderDetail";
import UserDashboard from "./pages/user/UserDashboard";
import ProviderDashboard from "./pages/provider/ProviderDashboard";
import DashboardLayout from "./components/DashboardLayout";
import AdminLayout from "./components/AdminLayout";
import { useAuthStore } from "./store/useAuthStore";


import ProviderOnboarding from "./pages/provider/ProviderOnboarding";

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

  // Onboarding is now handled via a modal on the dashboard
  if (user?.role === "provider" && user?.status === "pending" && location.pathname === "/onboarding") {
     // Allow access to /onboarding if specifically visited, but don't force it
  }

  if (user?.role === "admin") {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (isAuthenticated) {
    if (user?.role === "admin") return <Navigate to="/admin" />;
    if (user?.role === "provider") {
       return <Navigate to="/provider" />;
    }
    return <Navigate to="/user" />;
  }
  return <>{children}</>;
};

import LandingPage from "./pages/LandingPage";

const App: React.FC = () => {
  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/verify-otp" element={<PublicRoute><VerifyOtp /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
          
          <Route path="/admin/login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
          
          <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/providers" element={<ProtectedRoute allowedRoles={["admin"]}><AdminProviders /></ProtectedRoute>} />
          <Route path="/admin/providers/:id" element={<ProtectedRoute allowedRoles={["admin"]}><AdminProviderDetail /></ProtectedRoute>} />
          <Route path="/admin/services" element={<ProtectedRoute allowedRoles={["admin"]}><AdminServices /></ProtectedRoute>} />
          
          <Route path="/onboarding" element={<ProtectedRoute allowedRoles={["provider"]}><ProviderOnboarding /></ProtectedRoute>} />
          <Route path="/provider" element={<ProtectedRoute allowedRoles={["provider"]}><ProviderDashboard /></ProtectedRoute>} />
          <Route path="/user" element={<ProtectedRoute allowedRoles={["user"]}><UserDashboard /></ProtectedRoute>} />
        </Routes>
    </Router>
    </>
  );
};

export default App;
