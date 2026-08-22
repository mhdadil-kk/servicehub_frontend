import axiosInstance from "./axios.instance";
import type { ApiResponse, IService } from "../types/api.types";
import type { Provider } from "../types/provider.types";
import { API_ROUTES } from "../constants/api.routes";

export interface ProvidersResponse {
  providers: Provider[];
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

export const serviceApi = {
  getActiveServices: () => 
    axiosInstance.get<unknown, ApiResponse<IService[]>>(API_ROUTES.SERVICES.LIST),
  browseProviders: (params: { search?: string; serviceId?: string; latitude?: number; longitude?: number; radius?: number; sortBy?: string; sortOrder?: string; limit?: number; page?: number }) =>
    axiosInstance.get<unknown, ApiResponse<ProvidersResponse>>(API_ROUTES.PROVIDERS.LIST, { params }),
};
