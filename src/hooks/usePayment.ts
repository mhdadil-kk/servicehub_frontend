import { useState, useCallback } from "react";
import { paymentApi } from "../api/payment.service";
import toast from "react-hot-toast";

export const usePayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const createCheckoutSession = useCallback(async (bookingId: string) => {
    try {
      setIsProcessing(true);
      const res = await paymentApi.createCheckoutSession(bookingId);
      return res.data;
    } catch (error) {
      toast.error("Failed to initiate payment.");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const verifyPayment = useCallback(async (sessionId: string, bookingId: string) => {
    try {
      setIsProcessing(true);
      const res = await paymentApi.verifyPayment(sessionId, bookingId);
      return res.data;
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    createCheckoutSession,
    verifyPayment,
    isProcessing,
  };
};
