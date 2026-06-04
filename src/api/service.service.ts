import axiosInstance from "./axios.instance";
import type { ApiResponse } from "../types/api.types";

export const serviceApi = {
  getActiveServices: () => 
    axiosInstance.get<unknown, ApiResponse<any[]>>("/services"),
  browseProviders: (params: { search?: string; serviceId?: string; latitude?: number; longitude?: number; radius?: number; sortBy?: string; sortOrder?: string; limit?: number; page?: number }) =>
    axiosInstance.get<unknown, ApiResponse<any>>("/providers", { params }),
};
