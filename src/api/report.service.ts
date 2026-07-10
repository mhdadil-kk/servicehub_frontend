import api from "./axios.instance";

export interface Report {
  _id: string;
  reporterId: any;
  reportedId: any;
  bookingId?: any;
  category: string;
  description: string;
  screenshot?: string;
  status: "pending" | "under_review" | "resolved" | "rejected";
  adminNotes?: string;
  actionTaken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReportPayload {
  reportedId: string;
  bookingId?: string;
  category: string;
  description: string;
  screenshot?: File;
}

export interface ReportActionPayload {
  action: "warn" | "block" | "reject" | "resolve";
  adminNotes?: string;
}

export const reportApi = {
  createReport: async (payload: CreateReportPayload): Promise<Report> => {
    const formData = new FormData();
    formData.append("reportedId", payload.reportedId);
    formData.append("category", payload.category);
    formData.append("description", payload.description);
    if (payload.bookingId) formData.append("bookingId", payload.bookingId);
    if (payload.screenshot) formData.append("screenshot", payload.screenshot);

    const res: any = await api.post("/reports", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
  },
  getMyReports: async (): Promise<Report[]> => {
    const res: any = await api.get("/reports/my");
    return res.data;
  },
  getReportById: async (id: string): Promise<Report> => {
    const res: any = await api.get(`/reports/${id}`);
    return res.data;
  },
  getAllReports: async (params?: { page?: number; limit?: number; status?: string; search?: string }): Promise<{ reports: Report[]; total: number; page: number; limit: number }> => {
    const res: any = await api.get("/reports/all", { params });
    return res.data;
  },
  takeAction: async (id: string, payload: ReportActionPayload): Promise<Report> => {
    const res: any = await api.put(`/reports/${id}/action`, payload);
    return res.data;
  },
};
