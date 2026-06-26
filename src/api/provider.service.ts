import axiosInstance from "./axios.instance";
import type { ApiResponse } from "../types/api.types";
import type { Provider } from "../types/provider.types";

export interface IProviderProfile {
  _id: string;
  userId: string;
  bio?: string;
  profilePhoto?: string;
  serviceId?: string;
  hourlyRate?: number;
  serviceRadius?: number;
  address?: string;
  location?: { type: string; coordinates: number[] };
  documents?: Array<{ docType: string; url: string }>;
  onboardingStep: number;
  onboardingStatus: "pending" | "in_review" | "approved" | "rejected";
  rejectionReason?: string;
  bankDetails?: {
    accountHolderName?: string;
    bankName?: string;
    accountNumber?: string;
    routingNumber?: string;
  };
  averageRating?: number;
  totalReviews?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IProviderAvailability {
  providerId: string;
  rrules?: string[];
  exdates?: string[];
}

export const providerApi = {
  updateProfile: (formData: FormData) => 
    axiosInstance.patch<unknown, ApiResponse<IProviderProfile>>("/provider/onboarding/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }),

  updateLocation: (data: { address: string, latitude: number, longitude: number, serviceRadius: number }) => 
    axiosInstance.patch<unknown, ApiResponse<IProviderProfile>>("/provider/onboarding/location", data),

  updateServiceDetails: (data: { serviceId: string, hourlyRate: number }) => 
    axiosInstance.patch<unknown, ApiResponse<IProviderProfile>>("/provider/onboarding/service", data),

  uploadDocuments: (formData: FormData) => 
    axiosInstance.post<unknown, ApiResponse<IProviderProfile>>("/provider/onboarding/documents", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }),

  updateBankDetails: (data: { accountHolderName: string, bankName: string, accountNumber: string, routingNumber: string }) => 
    axiosInstance.patch<unknown, ApiResponse<IProviderProfile>>("/provider/onboarding/bank", data),

  resetForReapply: () =>
    axiosInstance.post<unknown, ApiResponse<IProviderProfile>>("/provider/onboarding/reset"),

  getProfile: () => 
    axiosInstance.get<unknown, ApiResponse<IProviderProfile>>("/provider/profile"),

  getAvailability: () => 
    axiosInstance.get<unknown, ApiResponse<IProviderAvailability>>("/provider/availability"),

  updateAvailability: (data: Partial<IProviderAvailability>) => 
    axiosInstance.put<unknown, ApiResponse<IProviderAvailability>>("/provider/availability", data),
};
