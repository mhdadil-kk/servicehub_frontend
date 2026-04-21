import axiosInstance from "./axios.instance";
import { API_ROUTES } from "../constants/api.routes";
import type { ApiResponse, IUser } from "../types/api.types";

export const adminService = {
  getAllUsers: () => 
    axiosInstance.get<any, ApiResponse<{ users: IUser[] }>>(API_ROUTES.ADMIN.USERS),

  deleteUser: (id: string) => 
    axiosInstance.delete<any, ApiResponse<null>>(`${API_ROUTES.ADMIN.USERS}/${id}`),

  unblockUser: (id: string) => 
    axiosInstance.patch<any, ApiResponse<{ user: IUser }>>(API_ROUTES.ADMIN.USER_ACTION(id, 'unblock')),

  getProviders: () => 
    axiosInstance.get<any, ApiResponse<{ providers: IUser[] }>>(API_ROUTES.ADMIN.PROVIDERS),

  updateProviderStatus: (id: string, status: string) => 
    axiosInstance.patch<any, ApiResponse<{ user: IUser }>>(API_ROUTES.ADMIN.PROVIDER_STATUS(id), { status }),
};
