import axiosInstance from "./axios.instance";
import { API_ROUTES } from "../constants/api.routes";
import type { ApiResponse } from "../types/api.types";
import type { ReportEntity, ReportCategory } from "../types/domain.types";

export type Report = ReportEntity;

export interface CreateReportPayload {
  reportedId: string;
  bookingId?: string;
  category: ReportCategory;
  description: string;
  screenshot?: File;
}

export interface ReportActionPayload {
  action: "warn" | "block" | "reject" | "resolve";
  adminNotes?: string;
}

export interface ReportsPage {
  reports: Report[];
  total: number;
  page?: number;
  limit?: number;
}

export const reportApi = {
  createReport: (payload: CreateReportPayload) => {
    const formData = new FormData();
    formData.append("reportedId", payload.reportedId);
    formData.append("category", payload.category);
    formData.append("description", payload.description);
    if (payload.bookingId) formData.append("bookingId", payload.bookingId);
    if (payload.screenshot) formData.append("screenshot", payload.screenshot);

    return axiosInstance.post<unknown, ApiResponse<Report>>(
      API_ROUTES.REPORTS.CREATE,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  },

  getMyReports: () =>
    axiosInstance.get<unknown, ApiResponse<{ reports: Report[] }>>(
      API_ROUTES.REPORTS.MY_REPORTS
    ),

  getReportById: (id: string) =>
    axiosInstance.get<unknown, ApiResponse<Report>>(
      API_ROUTES.REPORTS.BY_ID(id)
    ),

  getAllReports: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
    axiosInstance.get<unknown, ApiResponse<ReportsPage>>(
      API_ROUTES.REPORTS.ALL,
      { params }
    ),

  takeAction: (id: string, payload: ReportActionPayload) =>
    axiosInstance.put<unknown, ApiResponse<Report>>(
      API_ROUTES.REPORTS.ACTION(id),
      payload
    ),
};