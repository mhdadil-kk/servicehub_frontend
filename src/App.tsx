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
import BrowseServices from "./pages/user/BrowseServices";
import ProviderDashboard from "./pages/provider/ProviderDashboard";
import DashboardLayout from "./components/DashboardLayout";
import AdminLayout from "./components/AdminLayout";
import { useAuthStore } from "./store/useAuthStore";


import ProviderOnboarding from "./pages/provider/ProviderOnboarding";
import ProviderProfile from "./pages/provider/ProviderProfile";
import ProviderAvailability from "./pages/provider/ProviderAvailability";
import UserProfile from "./pages/user/UserProfile";
import AddressBook from "./pages/user/AddressBook";
import MyBookings from "./pages/user/MyBookings";
import ProviderBookings from "./pages/provider/ProviderBookings";
import ProviderBookingDetail from "./pages/provider/ProviderBookingDetail";
import UserBookingDetail from "./pages/user/UserBookingDetail";
import UserWallet from "./pages/user/UserWallet";
import ProviderWallet from "./pages/provider/ProviderWallet";
import ChatPage from "./pages/ChatPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";

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

  if (user?.role === "provider" && user?.status === "pending" && location.pathname === "/provider/onboarding") {
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
       return <Navigate to="/provider/dashboard" />; 
    }
    return <Navigate to="/user/dashboard" />;
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
          
          <Route path="/provider/onboarding" element={<ProtectedRoute allowedRoles={["provider"]}><ProviderOnboarding /></ProtectedRoute>} />
          
          <Route path="/provider" element={<Navigate to="/provider/dashboard" replace />} />
          <Route path="/provider/dashboard" element={<ProtectedRoute allowedRoles={["provider"]}><ProviderDashboard /></ProtectedRoute>} />
          <Route path="/provider/bookings" element={<ProtectedRoute allowedRoles={["provider"]}><ProviderBookings /></ProtectedRoute>} />
          <Route path="/provider/bookings/:id" element={<ProtectedRoute allowedRoles={["provider"]}><ProviderBookingDetail /></ProtectedRoute>} />
          <Route path="/provider/profile" element={<ProtectedRoute allowedRoles={["provider"]}><ProviderProfile /></ProtectedRoute>} />
          <Route path="/provider/availability" element={<ProtectedRoute allowedRoles={["provider"]}><ProviderAvailability /></ProtectedRoute>} />
          <Route path="/provider/wallet" element={<ProtectedRoute allowedRoles={["provider"]}><ProviderWallet /></ProtectedRoute>} />
          <Route path="/provider/messages" element={<ProtectedRoute allowedRoles={["provider"]}><ChatPage /></ProtectedRoute>} />
          
          <Route path="/user" element={<Navigate to="/user/dashboard" replace />} />
          <Route path="/user/dashboard" element={<ProtectedRoute allowedRoles={["user"]}><UserDashboard /></ProtectedRoute>} />
          <Route path="/user/browse" element={<ProtectedRoute allowedRoles={["user"]}><BrowseServices /></ProtectedRoute>} />
          <Route path="/user/bookings" element={<ProtectedRoute allowedRoles={["user"]}><MyBookings /></ProtectedRoute>} />
          <Route path="/user/bookings/:id" element={<ProtectedRoute allowedRoles={["user"]}><UserBookingDetail /></ProtectedRoute>} />
          <Route path="/user/wallet" element={<ProtectedRoute allowedRoles={["user"]}><UserWallet /></ProtectedRoute>} />
          <Route path="/user/profile" element={<ProtectedRoute allowedRoles={["user"]}><UserProfile /></ProtectedRoute>} />
          <Route path="/user/addresses" element={<ProtectedRoute allowedRoles={["user"]}><AddressBook /></ProtectedRoute>} />
          <Route path="/user/messages" element={<ProtectedRoute allowedRoles={["user"]}><ChatPage /></ProtectedRoute>} />

          <Route path="/payment-success" element={<ProtectedRoute allowedRoles={["user"]}><PaymentSuccess /></ProtectedRoute>} />
          <Route path="/payment-cancel" element={<ProtectedRoute allowedRoles={["user"]}><PaymentCancel /></ProtectedRoute>} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
