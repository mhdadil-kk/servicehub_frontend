import axiosInstance from "./axios.instance";
import type { ApiResponse } from "../types/api.types";

export interface Address {
  _id: string;
  userId: string;
  label: string;
  fullAddress: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export const addressApi = {
  getAddresses: () =>
    axiosInstance.get<unknown, ApiResponse<Address[]>>("/addresses"),

  createAddress: (data: { label: string; fullAddress: string; latitude?: number; longitude?: number; isDefault?: boolean }) =>
    axiosInstance.post<unknown, ApiResponse<Address>>("/addresses", data),

  updateAddress: (id: string, data: { label?: string; fullAddress?: string; latitude?: number; longitude?: number; isDefault?: boolean }) =>
    axiosInstance.patch<unknown, ApiResponse<Address>>(`/addresses/${id}`, data),

  deleteAddress: (id: string) =>
    axiosInstance.delete<unknown, ApiResponse<null>>(`/addresses/${id}`),

  setDefaultAddress: (id: string) =>
    axiosInstance.patch<unknown, ApiResponse<Address>>(`/addresses/${id}/default`),
};
