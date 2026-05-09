import axios from "axios";
import { API_BASE_URL } from "../constants/api";
import { useAuthStore } from "../store/useAuthStore";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

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

axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const isAuthRequest = originalRequest.url?.includes("/auth/login") || originalRequest.url?.includes("/auth/signup");

      if (!isAuthRequest) {
        originalRequest._retry = true;
        const refreshToken = localStorage.getItem("refreshToken");

        if (refreshToken) {
          try {
            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
            const { accessToken } = response.data.data;

            useAuthStore.getState().setTokens(accessToken, refreshToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return axiosInstance(originalRequest);
          } catch (refreshError) {

            useAuthStore.getState().logout();
          }
        } else {
          useAuthStore.getState().logout();
        }
      }
    }

    const message = error.response?.data?.message || "An unexpected error occurred.";
    return Promise.reject(new Error(message));
  }
);


export default axiosInstance;
