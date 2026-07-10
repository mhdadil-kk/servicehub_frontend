import { useState, useCallback } from "react";
import { bookingApi, type Booking, type AvailableSlot } from "../api/booking.service";
import { addressApi, type Address } from "../api/address.service";
import toast from "react-hot-toast";

export const useBooking = () => {
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAvailableSlots = useCallback(async (providerId: string, date: string) => {
    try {
      setIsLoadingSlots(true);
      const res = await bookingApi.getAvailableSlots(providerId, date);
      setSlots(res.data || []);
    } catch (error) {
      toast.error("Failed to load availability slots.");
      throw error;
    } finally {
      setIsLoadingSlots(false);
    }
  }, []);

  const fetchAddresses = useCallback(async () => {
    try {
      setIsLoadingAddresses(true);
      const res = await addressApi.getAddresses();
      setAddresses(res.data || []);
    } catch (error) {
      toast.error("Failed to load addresses.");
      throw error;
    } finally {
      setIsLoadingAddresses(false);
    }
  }, []);

  const createAddress = useCallback(async (data: Parameters<typeof addressApi.createAddress>[0]) => {
    try {
      const res = await addressApi.createAddress(data);
      await fetchAddresses();
      return res.data;
    } catch (error) {
      toast.error("Failed to save address.");
      throw error;
    }
  }, [fetchAddresses]);

  const fetchUserBookings = useCallback(async () => {
    try {
      setIsLoadingBookings(true);
      const res = await bookingApi.getUserBookings();
      setBookings(res.data || []);
      return res.data || [];
    } catch (error) {
      toast.error("Failed to load bookings.");
      throw error;
    } finally {
      setIsLoadingBookings(false);
    }
  }, []);

  const fetchProviderBookings = useCallback(async () => {
    try {
      setIsLoadingBookings(true);
      const res = await bookingApi.getProviderBookings();
      setBookings(res.data || []);
      return res.data || [];
    } catch (error) {
      toast.error("Failed to load bookings.");
      throw error;
    } finally {
      setIsLoadingBookings(false);
    }
  }, []);

  const getBookingDetail = useCallback(async (id: string): Promise<Booking> => {
    const res = await bookingApi.getBookingDetail(id);
    return res.data;
  }, []);

  const createBooking = useCallback(async (data: Parameters<typeof bookingApi.createBooking>[0]) => {
    try {
      setIsSubmitting(true);
      const res = await bookingApi.createBooking(data);
      toast.success("Booking request sent! Waiting for provider acceptance.");
      return res.data;
    } catch (error) {
      toast.error("Failed to create booking.");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const cancelBooking = useCallback(async (id: string, reason?: string) => {
    try {
      setIsSubmitting(true);
      const res = await bookingApi.cancelBooking(id, reason);
      toast.success("Booking cancelled successfully.");
      return res.data;
    } catch (error) {
      toast.error("Failed to cancel booking.");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const rescheduleBooking = useCallback(async (id: string, data: Parameters<typeof bookingApi.rescheduleBooking>[1]) => {
    try {
      setIsSubmitting(true);
      const res = await bookingApi.rescheduleBooking(id, data);
      toast.success("Booking rescheduled successfully!");
      return res.data;
    } catch (error) {
      toast.error("Failed to reschedule booking.");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const providerRescheduleBooking = useCallback(async (id: string, data: Parameters<typeof bookingApi.providerRescheduleBooking>[1]) => {
    try {
      setIsSubmitting(true);
      const res = await bookingApi.providerRescheduleBooking(id, data);
      toast.success("Booking rescheduled successfully!");
      return res.data;
    } catch (error) {
      toast.error("Failed to reschedule booking.");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const acceptReschedule = useCallback(async (id: string) => {
    try {
      setIsSubmitting(true);
      const res = await bookingApi.acceptReschedule(id);
      toast.success("Rescheduled time accepted!");
      return res.data;
    } catch (error) {
      toast.error("Failed to accept rescheduled time.");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const rejectReschedule = useCallback(async (id: string) => {
    try {
      setIsSubmitting(true);
      const res = await bookingApi.rejectReschedule(id);
      toast.success("Rescheduled time rejected and booking cancelled.");
      return res.data;
    } catch (error) {
      toast.error("Failed to reject rescheduled time.");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const acceptBooking = useCallback(async (id: string) => {
    try {
      setIsSubmitting(true);
      const res = await bookingApi.acceptBooking(id);
      toast.success("Booking accepted!");
      return res.data;
    } catch (error) {
      toast.error("Failed to accept booking.");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const confirmBooking = useCallback(async (id: string) => {
    try {
      setIsSubmitting(true);
      const res = await bookingApi.confirmBooking(id);
      toast.success("Booking confirmed!");
      return res.data;
    } catch (error) {
      toast.error("Failed to confirm booking.");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const generateArrivalOtp = useCallback(async (id: string) => {
    try {
      setIsSubmitting(true);
      const res = await bookingApi.generateArrivalOtp(id);
      return res.data;
    } catch (error) {
      toast.error("Failed to generate arrival OTP.");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const verifyArrivalOtp = useCallback(async (id: string, otp: string) => {
    try {
      setIsSubmitting(true);
      const res = await bookingApi.verifyArrivalOtp(id, otp);
      toast.success("Arrival confirmed!");
      return res.data;
    } catch (error) {
      toast.error("Invalid OTP. Please try again.");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const generateCompletionOtp = useCallback(async (id: string, invoiceData: { baseCharge: number; extraCharges: Array<{ description: string; amount: number }> }) => {
    try {
      setIsSubmitting(true);
      const res = await bookingApi.generateCompletionOtp(id, invoiceData);
      return res.data;
    } catch (error) {
      toast.error("Failed to generate completion OTP.");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const verifyCompletionOtp = useCallback(async (id: string, otp: string) => {
    try {
      setIsSubmitting(true);
      const res = await bookingApi.verifyCompletionOtp(id, otp);
      toast.success("Service completed successfully!");
      return res.data;
    } catch (error) {
      toast.error("Invalid OTP. Please try again.");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    slots,
    isLoadingSlots,
    fetchAvailableSlots,
    addresses,
    isLoadingAddresses,
    fetchAddresses,
    createAddress,
    bookings,
    isLoadingBookings,
    fetchUserBookings,
    fetchProviderBookings,
    getBookingDetail,
    createBooking,
    cancelBooking,
    rescheduleBooking,
    providerRescheduleBooking,
    acceptReschedule,
    rejectReschedule,
    acceptBooking,
    confirmBooking,
    generateArrivalOtp,
    verifyArrivalOtp,
    generateCompletionOtp,
    verifyCompletionOtp,
    isSubmitting,
  };
};
