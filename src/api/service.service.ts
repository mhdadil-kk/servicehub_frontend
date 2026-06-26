import axiosInstance from "./axios.instance";
import type { ApiResponse, IService } from "../types/api.types";
import type { Provider } from "../types/provider.types";

export interface ProvidersResponse {
  providers: Provider[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

export const serviceApi = {
  getActiveServices: () => 
    axiosInstance.get<unknown, ApiResponse<IService[]>>("/services"),
  browseProviders: (params: { search?: string; serviceId?: string; latitude?: number; longitude?: number; radius?: number; sortBy?: string; sortOrder?: string; limit?: number; page?: number }) =>
    axiosInstance.get<unknown, ApiResponse<ProvidersResponse>>("/providers", { params }),
};
