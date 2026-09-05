import { useState, useCallback } from "react";
import { providerApi, type IProviderProfile } from "../api/provider.service";
import { serviceApi } from "../api/service.service";
import { reviewService } from "../api/review.service";
import type { IService } from "../types/api.types";
import type { Review } from "../types/provider.types";
import toast from "react-hot-toast";

export const useProviderProfile = () => {
  const [profile, setProfile] = useState<IProviderProfile | null>(null);
  const [services, setServices] = useState<IService[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const [profileRes, servicesRes] = await Promise.all([
        providerApi.getProfile(),
        serviceApi.getActiveServices(),
      ]);
      setProfile(profileRes.data);
      setServices(servicesRes.data || []);
      return profileRes.data;
    } catch (error) {
      toast.error("Failed to load profile.");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadReviews = useCallback(async (providerId: string, page = 1, limit = 10) => {
    try {
      const res = await reviewService.getProviderReviews(providerId, page, limit);
      setReviews(res.data?.reviews || []);
      return res.data;
    } catch (error) {
      toast.error("Failed to load reviews.");
      throw error;
    }
  }, []);

  const updateProfile = useCallback(async (formData: FormData, silent = false) => {
    try {
      setSaving(true);
      const res = await providerApi.updateProfile(formData);
      setProfile(res.data);
      if (!silent) {
        toast.success("Profile updated successfully!");
      }
      return res.data;
    } catch (error) {
      toast.error("Failed to update profile.");
      throw error;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateLocation = useCallback(async (data: Parameters<typeof providerApi.updateLocation>[0], silent = false) => {
    try {
      setSaving(true);
      const res = await providerApi.updateLocation(data);
      setProfile(res.data);
      if (!silent) {
        toast.success("Location updated successfully!");
      }
      return res.data;
    } catch (error) {
      toast.error("Failed to update location.");
      throw error;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateServiceDetails = useCallback(async (data: Parameters<typeof providerApi.updateServiceDetails>[0], silent = false) => {
    try {
      setSaving(true);
      const res = await providerApi.updateServiceDetails(data);
      setProfile(res.data);
      if (!silent) {
        toast.success("Service details updated successfully!");
      }
      return res.data;
    } catch (error) {
      toast.error("Failed to update service details.");
      throw error;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateBankDetails = useCallback(async (data: Parameters<typeof providerApi.updateBankDetails>[0], silent = false) => {
    try {
      setSaving(true);
      const res = await providerApi.updateBankDetails(data);
      setProfile(res.data);
      if (!silent) {
        toast.success("Bank details updated successfully!");
      }
      return res.data;
    } catch (error) {
      toast.error("Failed to update bank details.");
      throw error;
    } finally {
      setSaving(false);
    }
  }, []);

  const uploadDocuments = useCallback(async (formData: FormData, silent = false) => {
    try {
      setSaving(true);
      const res = await providerApi.uploadDocuments(formData);
      setProfile(res.data);
      if (!silent) {
        toast.success("Documents uploaded successfully!");
      }
      return res.data;
    } catch (error) {
      toast.error("Failed to upload documents.");
      throw error;
    } finally {
      setSaving(false);
    }
  }, []);

  const likeReview = useCallback(async (reviewId: string) => {
    try {
      const res = await reviewService.likeReview(reviewId);
      setReviews(prev =>
        prev.map(r => r._id === reviewId ? { ...r, likedByProvider: !r.likedByProvider } : r)
      );
      return res.data;
    } catch (error) {
      toast.error("Failed to update review.");
      throw error;
    }
  }, []);

  const resetForReapply = useCallback(async () => {
    try {
      setSaving(true);
      const res = await providerApi.resetForReapply();
      setProfile(res.data);
      return res.data;
    } catch (error) {
      toast.error("Failed to reset application.");
      throw error;
    } finally {
      setSaving(false);
    }
  }, []);

  const getAvailability = useCallback(async () => {
    try {
      setLoading(true);
      const res = await providerApi.getAvailability();
      return res.data;
    } catch (error) {
      toast.error("Failed to fetch availability.");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAvailability = useCallback(async (data: Parameters<typeof providerApi.updateAvailability>[0]) => {
    try {
      setSaving(true);
      const res = await providerApi.updateAvailability(data);
      toast.success("Availability updated successfully!");
      return res.data;
    } catch (error) {
      toast.error("Failed to update availability.");
      throw error;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    profile,
    setProfile,
    services,
    reviews,
    loading,
    saving,
    loadProfile,
    loadReviews,
    updateProfile,
    updateLocation,
    updateServiceDetails,
    updateBankDetails,
    uploadDocuments,
    likeReview,
    resetForReapply,
    getAvailability,
    updateAvailability,
  };
};
