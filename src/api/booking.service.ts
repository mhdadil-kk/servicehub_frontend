import axiosInstance from "./axios.instance";
import { API_ROUTES } from "../constants/api.routes";
import type { ApiResponse } from "../types/api.types";
import type {
  PopulatedAddress,
  PopulatedProviderProfile,
  PopulatedService,
  PopulatedUser,
} from "../types/domain.types";

export interface Booking {
  _id: string;
  userId: string | PopulatedUser;
  providerId: string | PopulatedProviderProfile;
  serviceId: string | PopulatedService;
  addressId?: string | PopulatedAddress;
  provider?: {
    _id: string;
    userId: { name: string; email?: string; phone?: string; profilePhoto?: string };
    profilePhoto?: string;
    hourlyRate?: number;
    address?: string;
  };
  service?: { _id: string; name: string; description?: string };
  address?: { _id: string; label: string; fullAddress: string; latitude?: number; longitude?: number };
  user?: { _id: string; name: string; profilePhoto?: string };
  date: string;
  slot: { start: string; end: string };
  status: string;
  notes?: string;
  cancelledBy?: "user" | "provider";
  cancellationReason?: string;
  rescheduledFrom?: string;
  rescheduledTo?: string;
  totalAmount?: number;
  paymentStatus?: "pending" | "paid" | "failed" | "fully_paid";
  stripeSessionId?: string;
  arrivalOtp?: string;
  completionOtp?: string;
  finalInvoice?: {
    baseCharge: number;
    extraCharges: Array<{ description?: string; reason?: string; amount: number }>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AvailableSlot {
  id?: string;
  start: string;
  end: string;
  isBooked: boolean;
}

export const bookingApi = {
  getAvailableSlots: (providerId: string, date: string) =>
    axiosInstance.get<unknown, ApiResponse<AvailableSlot[]>>(API_ROUTES.BOOKINGS.SLOTS, {
      params: { providerId, date },
    }),

  createBooking: (data: {
    providerId: string;
    serviceId: string;
    addressId: string;
    date: string;
    slot: { start: string; end: string };
    notes?: string;
  }) =>
    axiosInstance.post<unknown, ApiResponse<Booking>>(API_ROUTES.BOOKINGS.CREATE, data),

  getUserBookings: () =>
    axiosInstance.get<unknown, ApiResponse<Booking[]>>(API_ROUTES.BOOKINGS.MY_BOOKINGS),

  getProviderBookings: () =>
    axiosInstance.get<unknown, ApiResponse<Booking[]>>(API_ROUTES.BOOKINGS.PROVIDER_JOBS),

  getBookingDetail: (id: string) =>
    axiosInstance.get<unknown, ApiResponse<Booking>>(API_ROUTES.BOOKINGS.DETAIL(id)),

  cancelBooking: (id: string, reason?: string) =>
    axiosInstance.post<unknown, ApiResponse<Booking>>(API_ROUTES.BOOKINGS.CANCEL(id), { reason }),

  rescheduleBooking: (
    id: string,
    data: {
      date: string;
      slot: { start: string; end: string };
      addressId?: string;
      notes?: string;
    }
  ) =>
    axiosInstance.post<unknown, ApiResponse<Booking>>(API_ROUTES.BOOKINGS.RESCHEDULE(id), data),

  providerRescheduleBooking: (
    id: string,
    data: {
      date: string;
      slot: { start: string; end: string };
      addressId?: string;
      notes?: string;
    }
  ) =>
    axiosInstance.post<unknown, ApiResponse<Booking>>(
      API_ROUTES.BOOKINGS.PROVIDER_RESCHEDULE(id),
      data
    ),

  acceptReschedule: (id: string) =>
    axiosInstance.post<unknown, ApiResponse<Booking>>(API_ROUTES.BOOKINGS.ACCEPT_RESCHEDULE(id)),

  rejectReschedule: (id: string) =>
    axiosInstance.post<unknown, ApiResponse<Booking>>(API_ROUTES.BOOKINGS.REJECT_RESCHEDULE(id)),

  acceptBooking: (id: string) =>
    axiosInstance.post<unknown, ApiResponse<Booking>>(API_ROUTES.BOOKINGS.ACCEPT(id)),

  updateBookingStatus: (id: string, status: "confirmed" | "completed" | "cancelled") =>
    axiosInstance.put<unknown, ApiResponse<Booking>>(API_ROUTES.BOOKINGS.STATUS(id), { status }),

  confirmBooking: (id: string) =>
    axiosInstance.put<unknown, ApiResponse<Booking>>(API_ROUTES.BOOKINGS.STATUS(id), {
      status: "confirmed",
    }),

  generateArrivalOtp: (id: string) =>
    axiosInstance.post<unknown, ApiResponse<Booking>>(API_ROUTES.BOOKINGS.ARRIVAL_OTP_GENERATE(id)),

  verifyArrivalOtp: (id: string, otp: string) =>
    axiosInstance.post<unknown, ApiResponse<Booking>>(API_ROUTES.BOOKINGS.ARRIVAL_OTP_VERIFY(id), {
      otp,
    }),

  generateCompletionOtp: (
    id: string,
    invoiceData: {
      baseCharge: number;
      extraCharges: Array<{ description: string; amount: number }>;
    }
  ) =>
    axiosInstance.post<unknown, ApiResponse<Booking>>(
      API_ROUTES.BOOKINGS.COMPLETION_OTP_GENERATE(id),
      { invoiceData }
    ),

  verifyCompletionOtp: (id: string, otp: string) =>
    axiosInstance.post<unknown, ApiResponse<Booking>>(
      API_ROUTES.BOOKINGS.COMPLETION_OTP_VERIFY(id),
      { otp }
    ),
};
