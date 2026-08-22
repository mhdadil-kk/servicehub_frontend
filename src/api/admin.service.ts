import axiosInstance from "./axios.instance";
import { API_ROUTES } from "../constants/api.routes";
import type { ApiResponse, IUser, IService } from "../types/api.types";
import type { Provider } from "../types/provider.types";

export const adminService = {
  getAllUsers: (search?: string, status?: string, sort?: string, page?: number, limit?: number) =>
    axiosInstance.get<unknown, ApiResponse<{ users: IUser[]; total: number }>>(
      API_ROUTES.ADMIN.USERS,
      { params: { search, status, sort, page, limit } }
    ),

  deleteUser: (id: string) =>
    axiosInstance.delete<unknown, ApiResponse<null>>(API_ROUTES.ADMIN.USER_BY_ID(id)),

  unblockUser: (id: string) =>
    axiosInstance.patch<unknown, ApiResponse<{ user: IUser }>>(API_ROUTES.ADMIN.USER_UNBLOCK(id)),

  getProviders: (search?: string, status?: string, sort?: string, page?: number, limit?: number) =>
    axiosInstance.get<unknown, ApiResponse<{ providers: IUser[]; total: number }>>(
      API_ROUTES.ADMIN.PROVIDERS,
      { params: { search, status, sort, page, limit } }
    ),

  updateProviderStatus: (id: string, status: string) =>
    axiosInstance.patch<unknown, ApiResponse<{ user: IUser }>>(API_ROUTES.ADMIN.PROVIDER_STATUS(id), { status }),

  getProviderDetail: (id: string) =>
    axiosInstance.get<unknown, ApiResponse<{ provider: Provider }>>(API_ROUTES.ADMIN.PROVIDER_BY_ID(id)),

  verifyProvider: (id: string, status: "approved" | "rejected", remarks?: string) =>
    axiosInstance.patch<unknown, ApiResponse<null>>(API_ROUTES.ADMIN.PROVIDER_VERIFY(id), { status, remarks }),


  getServices: () =>
    axiosInstance.get<unknown, ApiResponse<{ services: IService[] }>>(API_ROUTES.ADMIN.SERVICES),

  addService: (data: Partial<IService>) =>
    axiosInstance.post<unknown, ApiResponse<{ service: IService }>>(API_ROUTES.ADMIN.SERVICES, data),

  deleteService: (id: string) =>
    axiosInstance.delete<unknown, ApiResponse<null>>(API_ROUTES.ADMIN.DELETE_SERVICE(id)),

  getDashboardStats: (timeRange?: string) =>
    axiosInstance.get(API_ROUTES.ADMIN.DASHBOARD_STATS, { params: { timeRange } }),

  getAllBookings: (search?: string, status?: string, sort?: string, page?: number, limit?: number) =>
    axiosInstance.get(API_ROUTES.ADMIN.ALL_BOOKINGS, { params: { search, status, sort, page, limit } }),

  getBookingById: (id: string) =>
    axiosInstance.get(API_ROUTES.ADMIN.BOOKING_BY_ID(id)),

  getRevenueReport: (timeRange?: string) =>
    axiosInstance.get(API_ROUTES.ADMIN.DASHBOARD_REVENUE, { params: { timeRange } }),
};