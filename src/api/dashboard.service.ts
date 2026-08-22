import axiosInstance from "./axios.instance";
import { API_ROUTES } from "../constants/api.routes";
import type { ApiResponse } from "../types/api.types";
import type { UserDashboardData, ProviderDashboardData } from "../types/domain.types";

export const dashboardApi = {
  getUserDashboard: () =>
    axiosInstance.get<unknown, ApiResponse<UserDashboardData>>(API_ROUTES.DASHBOARD.USER),
  getProviderDashboard: () =>
    axiosInstance.get<unknown, ApiResponse<ProviderDashboardData>>(API_ROUTES.DASHBOARD.PROVIDER),
};
