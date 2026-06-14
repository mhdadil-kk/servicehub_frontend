import api from './axios.instance';

export const paymentApi = {
  createCheckoutSession: (bookingId: string) => 
    api.post('/payments/create-checkout-session', { bookingId }),

  verifyPayment: (sessionId: string, bookingId: string) =>
    api.post('/payments/verify-payment', { sessionId, bookingId }),
};
