import api from './axios.instance';
import { API_ROUTES } from "../constants/api.routes";
import type { ApiResponse } from "../types/api.types";

export const paymentApi = {
  createCheckoutSession: (bookingId: string) =>
    api.post(API_ROUTES.PAYMENTS.CREATE_CHECKOUT, { bookingId }) as Promise<
      ApiResponse<{ sessionId: string; url: string }>
    >,
  verifyPayment: (sessionId: string, bookingId: string) =>
    api.post(API_ROUTES.PAYMENTS.VERIFY, { sessionId, bookingId }),
};
