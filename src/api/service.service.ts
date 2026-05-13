import axiosInstance from "./axios.instance";
import type { ApiResponse } from "../types/api.types";

export const serviceApi = {
  getActiveServices: () => 
    axiosInstance.get<unknown, ApiResponse<any[]>>("/services"),
};
