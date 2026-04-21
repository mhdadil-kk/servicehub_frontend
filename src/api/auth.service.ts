import api from "./axios.instance";
import { ENDPOINTS } from "../constants/api";
import type { ApiResponse, AuthResponse, SignupData, ResetPasswordData } from "../types/api.types";

export const authService = {
  signup: (data: SignupData): Promise<ApiResponse> => api.post(ENDPOINTS.AUTH.SIGNUP, data),
  login: (email: string, password: string): Promise<ApiResponse<AuthResponse>> => 
    api.post(ENDPOINTS.AUTH.LOGIN, { email, password }),
  verifyOtp: (email: string, otp: string): Promise<ApiResponse<AuthResponse>> => 
    api.post(ENDPOINTS.AUTH.VERIFY_OTP, { email, otp }),
  forgotPassword: (email: string): Promise<ApiResponse> => 
    api.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),
  resetPassword: (data: ResetPasswordData): Promise<ApiResponse> => 
    api.post(ENDPOINTS.AUTH.RESET_PASSWORD, data),
  googleLogin: (token: string, role?: string): Promise<ApiResponse<AuthResponse>> => 
    api.post("/auth/google", { token, role }),
};
