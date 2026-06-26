import axiosInstance from "./axios.instance";
import { API_ROUTES } from "../constants/api.routes";
import type { ApiResponse, IUser, IService } from "../types/api.types";
import type { Provider } from "../types/provider.types";

export const adminService = {
  getAllUsers: (search?:string, status?:string, sort?:string, page?: number, limit?: number) => 
    axiosInstance.get<unknown, ApiResponse<{ users: IUser[], total: number }>>(
      API_ROUTES.ADMIN.USERS,
      { params: { search, status, sort, page, limit } } 
    ),

  deleteUser: (id: string) => 
    axiosInstance.delete<unknown, ApiResponse<null>>(`${API_ROUTES.ADMIN.USERS}/${id}`),

  unblockUser: (id: string) => 
    axiosInstance.patch<unknown, ApiResponse<{ user: IUser }>>(API_ROUTES.ADMIN.USER_ACTION(id, 'unblock')),

  getProviders: (search?:string, status?:string, sort?:string, page?: number, limit?: number) => 
    axiosInstance.get<unknown, ApiResponse<{ providers: IUser[], total: number }>>(
      API_ROUTES.ADMIN.PROVIDERS,
      { params: { search, status, sort, page, limit } } 
    ),

  updateProviderStatus: (id: string, status: string) => 
    axiosInstance.patch<unknown, ApiResponse<{ user: IUser }>>(API_ROUTES.ADMIN.PROVIDER_STATUS(id), { status }),

  getProviderDetail: (id: string) => 
    axiosInstance.get<unknown, ApiResponse<{ provider: Provider }>>(`/admin/providers/${id}`),  

  verifyProvider: (id: string, status: 'approved' | 'rejected', remarks?: string) => 
    axiosInstance.post<unknown, ApiResponse<null>>(`/admin/providers/${id}/verify`, { status, remarks }),

  getServices: () => 
    axiosInstance.get<unknown, ApiResponse<{ services: IService[] }>>(API_ROUTES.ADMIN.SERVICES),

  addService: (data: Partial<IService>) => 
    axiosInstance.post<unknown, ApiResponse<{ service: IService }>>(API_ROUTES.ADMIN.SERVICES, data),

  deleteService: (id: string) => 
    axiosInstance.delete<unknown, ApiResponse<null>>(API_ROUTES.ADMIN.DELETE_SERVICE(id)),
};
