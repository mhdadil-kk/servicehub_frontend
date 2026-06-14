import axiosInstance from "./axios.instance";
import type { ApiResponse } from "../types/api.types";
import type { Address } from "./address.service";

export interface Booking {
  _id: string;
  userId: { _id: string; name: string; email: string; phone?: string } | string;
  providerId: {
    _id: string;
    userId: { _id: string; name: string; email: string; phone?: string; profilePhoto?: string };
    bio?: string;
    hourlyRate?: number;
  } | string;
  serviceId: { _id: string; name: string; description?: string } | string;
  addressId: Address | string;
  date: string;
  slot: {
    start: string;
    end: string;
  };
  status: "pending" | "awaiting_payment" | "confirmed" | "in_progress" | "completed_pending_payment" | "completed" | "cancelled" | "rescheduled";
  notes?: string;
  cancelledBy?: "user" | "provider";
  cancellationReason?: string;
  rescheduledFrom?: string;
  totalAmount?: number;
  paymentStatus?: "pending" | "paid" | "failed";
  stripeSessionId?: string;
  arrivalOtp?: string;
  completionOtp?: string;
  finalInvoice?: {
    baseCharge: number;
    extraCharges: Array<{ description: string; amount: number }>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AvailableSlot {
  id: string;
  start: string;
  end: string;
  isBooked: boolean;
}

export const bookingApi = {
  getAvailableSlots: (providerId: string, date: string) =>
    axiosInstance.get<unknown, ApiResponse<AvailableSlot[]>>("/bookings/slots", {
      params: { providerId, date }
    }),

  createBooking: (data: {
    providerId: string;
    serviceId: string;
    addressId: string;
    date: string;
    slot: { start: string; end: string };
    notes?: string;
  }) =>
    axiosInstance.post<unknown, ApiResponse<Booking>>("/bookings", data),

  getUserBookings: () =>
    axiosInstance.get<unknown, ApiResponse<Booking[]>>("/bookings"),

  getProviderBookings: () =>
    axiosInstance.get<unknown, ApiResponse<Booking[]>>("/bookings/provider"),

  getBookingDetail: (id: string) =>
    axiosInstance.get<unknown, ApiResponse<Booking>>(`/bookings/${id}`),

  cancelBooking: (id: string, reason?: string) =>
    axiosInstance.patch<unknown, ApiResponse<Booking>>(`/bookings/${id}/cancel`, { reason }),

  rescheduleBooking: (id: string, data: {
    date: string;
    slot: { start: string; end: string };
    addressId?: string;
    notes?: string;
  }) =>
    axiosInstance.patch<unknown, ApiResponse<Booking>>(`/bookings/${id}/reschedule`, data),

  acceptBooking: (id: string) =>
    axiosInstance.patch<unknown, ApiResponse<Booking>>(`/bookings/${id}/accept`),

  confirmBooking: (id: string) =>
    axiosInstance.patch<unknown, ApiResponse<Booking>>(`/bookings/${id}/confirm`),

  completeBooking: (id: string) =>
    axiosInstance.patch<unknown, ApiResponse<Booking>>(`/bookings/${id}/complete`),

  // OTP Verification
  generateArrivalOtp: (id: string) =>
    axiosInstance.post<unknown, ApiResponse<Booking>>(`/bookings/${id}/otp/arrival/generate`),

  verifyArrivalOtp: (id: string, otp: string) =>
    axiosInstance.post<unknown, ApiResponse<Booking>>(`/bookings/${id}/otp/arrival/verify`, { otp }),

  generateCompletionOtp: (id: string, invoiceData: { baseCharge: number, extraCharges: any[] }) =>
    axiosInstance.post<unknown, ApiResponse<Booking>>(`/bookings/${id}/otp/completion/generate`, { invoiceData }),

  verifyCompletionOtp: (id: string, otp: string) =>
    axiosInstance.post<unknown, ApiResponse<Booking>>(`/bookings/${id}/otp/completion/verify`, { otp }),
};
