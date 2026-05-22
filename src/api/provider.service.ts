import axiosInstance from "./axios.instance";
import type { ApiResponse } from "../types/api.types";

export const providerApi = {
  // Step 1: Update Profile (Basic Info + Photo)
  updateProfile: (formData: FormData) => 
    axiosInstance.patch<unknown, ApiResponse<any>>("/provider/onboarding/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }),

  // Step 2: Update Location
  updateLocation: (data: { address: string, latitude: number, longitude: number, serviceRadius: number }) => 
    axiosInstance.patch<unknown, ApiResponse<any>>("/provider/onboarding/location", data),

  // Step 2: Update Service Details
  updateServiceDetails: (data: { serviceId: string, hourlyRate: number }) => 
    axiosInstance.patch<unknown, ApiResponse<any>>("/provider/onboarding/service", data),

  // Step 3: Upload Documents
  uploadDocuments: (formData: FormData) => 
    axiosInstance.post<unknown, ApiResponse<any>>("/provider/onboarding/documents", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }),

  // Step 4: Update Bank Details
  updateBankDetails: (data: { accountHolderName: string, bankName: string, accountNumber: string, routingNumber: string }) => 
    axiosInstance.patch<unknown, ApiResponse<any>>("/provider/onboarding/bank", data),

  // Reset profile for re-apply
  resetForReapply: () =>
    axiosInstance.post<unknown, ApiResponse<any>>("/provider/onboarding/reset"),

  // Get Profile
  getProfile: () => 
    axiosInstance.get<unknown, ApiResponse<any>>("/provider/profile"),

  // Get Availability
  getAvailability: () => 
    axiosInstance.get<unknown, ApiResponse<any>>("/provider/availability"),

  // Update Availability
  updateAvailability: (data: any) => 
    axiosInstance.put<unknown, ApiResponse<any>>("/provider/availability", data),
};
