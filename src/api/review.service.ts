import api from "./axios.instance";
import type { Review } from "../types/provider.types";
import type { ApiResponse } from "../types/api.types";
import { API_ROUTES } from "../constants/api.routes";

export interface ReviewPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const reviewService = {
  createReview: (
    data: { bookingId: string; rating: number; reviewText: string }
  ): Promise<ApiResponse<{ review: Review }>> =>
    api.post(API_ROUTES.REVIEWS.CREATE, data),

  getProviderReviews: (
    providerId: string,
    page = 1,
    limit = 10
  ): Promise<ApiResponse<{ reviews: Review[]; pagination?: ReviewPagination }>> =>
    api.get(API_ROUTES.REVIEWS.BY_PROVIDER(providerId), { params: { page, limit } }),

  likeReview: (reviewId: string): Promise<ApiResponse<{ review: Review }>> =>
    api.patch(API_ROUTES.REVIEWS.LIKE(reviewId)),
};
