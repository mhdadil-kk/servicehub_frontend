
export const API_BASE_URL = "http://localhost:5000/api";

export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    VERIFY_OTP: "/auth/verify-otp",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    REFRESH_TOKEN: "/auth/refresh",
  },
  ADMIN: {
    USERS: "/admin/users",
    PROVIDERS: "/admin/providers",
  }
};
