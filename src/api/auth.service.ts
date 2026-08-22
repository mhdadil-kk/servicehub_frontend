import api from "./axios.instance";
import { API_ROUTES } from "../constants/api.routes";
import type { ApiResponse, AuthResponse, SignupData, ResetPasswordData } from "../types/api.types";

export const authService = {
  signup: (data: SignupData): Promise<ApiResponse> =>
    api.post(API_ROUTES.AUTH.SIGNUP, data),
  login: (email: string, password: string): Promise<ApiResponse<AuthResponse>> =>
    api.post(API_ROUTES.AUTH.LOGIN, { email, password }),

  verifyOtp: (email: string, otp: string): Promise<ApiResponse<AuthResponse>> =>
    api.post(API_ROUTES.AUTH.VERIFY_OTP, { email, otp }),

  forgotPassword: (email: string): Promise<ApiResponse> =>
    api.post(API_ROUTES.AUTH.FORGOT_PASSWORD, { email }),

  resetPassword: (data: ResetPasswordData): Promise<ApiResponse> =>
    api.post(API_ROUTES.AUTH.RESET_PASSWORD, data),

  googleLogin: (token: string, role?: string): Promise<ApiResponse<AuthResponse>> =>
    api.post(API_ROUTES.AUTH.GOOGLE, { token, role }),

  changePassword: (data: { oldPassword: string; newPassword: string }): Promise<ApiResponse> =>
    api.put(API_ROUTES.AUTH.CHANGE_PASSWORD, data),

  updateProfile: (data: { name?: string; phone?: string }): Promise<ApiResponse<AuthResponse>> =>
    api.put(API_ROUTES.AUTH.PROFILE, data),
};