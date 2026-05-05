import axiosInstance from "./axios.instance";
import { API_ROUTES } from "../constants/api.routes";
import type { ApiResponse, IUser } from "../types/api.types";

export const adminService = {
  getAllUsers: (search?:string, status?:string, sort?:string) => 
    axiosInstance.get<unknown, ApiResponse<{ users: IUser[] }>>(
      API_ROUTES.ADMIN.USERS,
      { params: { search,status,sort } } 
    ),

  deleteUser: (id: string) => 
    axiosInstance.delete<unknown, ApiResponse<null>>(`${API_ROUTES.ADMIN.USERS}/${id}`),

  unblockUser: (id: string) => 
    axiosInstance.patch<unknown, ApiResponse<{ user: IUser }>>(API_ROUTES.ADMIN.USER_ACTION(id, 'unblock')),

  getProviders: (search?:string, status?:string, sort?:string) => 
    axiosInstance.get<unknown, ApiResponse<{ providers: IUser[] }>>(
      API_ROUTES.ADMIN.PROVIDERS,
      { params: { search,status,sort } } 
    ),

  updateProviderStatus: (id: string, status: string) => 
    axiosInstance.patch<unknown, ApiResponse<{ user: IUser }>>(API_ROUTES.ADMIN.PROVIDER_STATUS(id), { status }),
};
