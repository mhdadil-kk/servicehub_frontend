import axiosInstance from "./axios.instance";
import { API_ROUTES } from "../constants/api.routes";
import type { ApiResponse } from "../types/api.types";
import type { Review } from "../types/provider.types";

export interface ReviewPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const reviewService = {
  createReview: (data: { bookingId: string; rating: number; reviewText: string }) =>
    axiosInstance.post<unknown, ApiResponse<{ review: Review }>>(
      API_ROUTES.REVIEWS.CREATE,
      data
    ),

  getProviderReviews: (providerId: string, page = 1, limit = 10) =>
    axiosInstance.get<unknown, ApiResponse<{ reviews: Review[]; pagination?: ReviewPagination }>>(
      API_ROUTES.REVIEWS.BY_PROVIDER(providerId),
      { params: { page, limit } }
    ),

  likeReview: (reviewId: string) =>
    axiosInstance.patch<unknown, ApiResponse<{ review: Review }>>(
      API_ROUTES.REVIEWS.LIKE(reviewId)
    ),
};