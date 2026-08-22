import axiosInstance from "./axios.instance";
import type { ApiResponse } from "../types/api.types";
import { API_ROUTES } from "../constants/api.routes";

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
    axiosInstance.put<unknown, ApiResponse<IProviderProfile>>(API_ROUTES.PROVIDER.PROFILE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  updateLocation: (data: { address: string; latitude: number; longitude: number; serviceRadius: number }) =>
    axiosInstance.put<unknown, ApiResponse<IProviderProfile>>(API_ROUTES.PROVIDER.LOCATION, data),

  updateServiceDetails: (data: { serviceId: string; hourlyRate: number }) =>
    axiosInstance.put<unknown, ApiResponse<IProviderProfile>>(API_ROUTES.PROVIDER.SERVICE_DETAILS, data),

  uploadDocuments: (formData: FormData) =>
    axiosInstance.post<unknown, ApiResponse<IProviderProfile>>(API_ROUTES.PROVIDER.VERIFY_DOCS, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  updateBankDetails: (data: { accountHolderName: string; bankName: string; accountNumber: string; routingNumber: string }) =>
    axiosInstance.put<unknown, ApiResponse<IProviderProfile>>(API_ROUTES.PROVIDER.BANK_DETAILS, data),

  resetForReapply: () =>
    axiosInstance.post<unknown, ApiResponse<IProviderProfile>>(API_ROUTES.PROVIDER.REAPPLY),

  getProfile: () =>
    axiosInstance.get<unknown, ApiResponse<IProviderProfile>>(API_ROUTES.PROVIDER.PROFILE),

  getAvailability: () =>
    axiosInstance.get<unknown, ApiResponse<IProviderAvailability>>(API_ROUTES.PROVIDER.AVAILABILITY),

  updateAvailability: (data: Partial<IProviderAvailability>) =>
    axiosInstance.put<unknown, ApiResponse<IProviderAvailability>>(API_ROUTES.PROVIDER.AVAILABILITY, data),
};