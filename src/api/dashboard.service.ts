import axiosInstance from "./axios.instance";
import { API_ROUTES } from "../constants/api.routes";

export const dashboardApi = {
  getUserDashboard: () => axiosInstance.get(API_ROUTES.DASHBOARD.USER),
  getProviderDashboard: () => axiosInstance.get(API_ROUTES.DASHBOARD.PROVIDER),
}; 
