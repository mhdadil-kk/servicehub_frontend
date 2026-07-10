import { useState, useCallback } from "react";
import { reviewService } from "../api/review.service";
import type { Review } from "../types/provider.types";
import toast from "react-hot-toast";

export const useReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProviderReviews = useCallback(async (providerId: string, page = 1, limit = 10) => {
    try {
      setLoading(true);
      const res = await reviewService.getProviderReviews(providerId, page, limit);
      setReviews(res.data?.reviews || []);
      return res.data;
    } catch (error) {
      toast.error("Failed to load reviews.");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const createReview = useCallback(async (data: { bookingId: string; rating: number; reviewText: string }) => {
    try {
      setIsSubmitting(true);
      const res = await reviewService.createReview(data);
      toast.success("Review submitted successfully!");
      return res.data;
    } catch (error) {
      toast.error("Failed to submit review.");
      throw error;
    } finally {
      setIsSubmitting(false);
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

  return {
    reviews,
    loading,
    isSubmitting,
    fetchProviderReviews,
    createReview,
    likeReview,
  };
};
