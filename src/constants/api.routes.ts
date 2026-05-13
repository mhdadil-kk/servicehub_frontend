export const API_ROUTES = {
  AUTH: {
    SIGNUP: "/auth/signup",
    LOGIN: "/auth/login",
    GOOGLE_LOGIN: "/auth/google-login",
    VERIFY_EMAIL: "/auth/verify-email",
    REQUEST_OTP: "/auth/request-otp",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
  ADMIN: {
    USERS: "/admin/users",
    USER_ACTION: (id: string, action: string) => `/admin/users/${id}/${action}`,
    PROVIDERS: "/admin/providers",
    PROVIDER_STATUS: (id: string) => `/admin/providers/${id}/status`,
    SERVICES: "/admin/services",
    DELETE_SERVICE: (id: string) => `/admin/services/${id}`,
  }
};
