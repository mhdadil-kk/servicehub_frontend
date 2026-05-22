import { useState } from "react";
import { authService } from "../api/auth.service";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import type { ApiResponse, AuthResponse, SignupData, ResetPasswordData } from "../types/api.types";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser, setTokens, logout: clearStore } = useAuthStore();
  const navigate = useNavigate();

  const handleAuthSuccess = (response: ApiResponse<AuthResponse>) => {
    if (response.data) {
      setUser(response.data.user);
      setTokens(response.data.accessToken, response.data.refreshToken);
      const role = response.data.user.role;
      if (role === "admin") navigate("/admin");
      else if (role === "provider") navigate("/provider/dashboard");
      else navigate("/user/dashboard");
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      handleAuthSuccess(response);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: SignupData) => {
    setLoading(true);
    setError(null);
    try {
      await authService.signup(userData);
      navigate("/verify-otp", { state: { email: userData.email } });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.verifyOtp(email, otp);
      handleAuthSuccess(response);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(email);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (data: ResetPasswordData) => {
    setLoading(true);
    setError(null);
    try {
      await authService.resetPassword(data);
      navigate("/login", { state: { message: "Password reset successful!" } });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    const { user } = useAuthStore.getState();
    const isAdmin = user?.role === "admin";
    clearStore();
    if (isAdmin) {
      navigate("/admin/login");
    } else {
      navigate("/login");
    }
  };

  const googleLogin = async (token: string, role?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.googleLogin(token, role);
      handleAuthSuccess(response);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return { login, signup, verifyOtp, forgotPassword, resetPassword, googleLogin, logout, loading, error };
};
