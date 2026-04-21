import axios from "axios";
import { API_BASE_URL } from "../constants/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Return only the data portion of our common response model to simplify frontend calls
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Global 401 handling
    if (error.response?.status === 401 && !originalRequest._retry) {
      const isAuthRequest = originalRequest.url?.includes("/auth/login") || originalRequest.url?.includes("/auth/signup");
      
      if (!isAuthRequest) {
        originalRequest._retry = true;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    // Extract message from our common response model
    const message = error.response?.data?.message || "An unexpected error occurred.";
    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;
