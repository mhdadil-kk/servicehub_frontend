import { useState, useCallback } from "react";
import {
  reportApi,
  type Report,
  type CreateReportPayload,
  type ReportActionPayload,
} from "../api/report.service";
import toast from "react-hot-toast";
import { getErrorMessage } from "../utils/errors";

export const useReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchMyReports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportApi.getMyReports();
      const list = res.data?.reports;
      setReports(Array.isArray(list) ? list : []);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to fetch reports"));
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllReports = useCallback(async (page = 1, status?: string, search?: string) => {
    setLoading(true);
    try {
      const res = await reportApi.getAllReports({ page, limit: 10, status, search });
      // res = ApiResponse<ReportsPage>
      // res.data = { reports: [...], total: N }
      const list = res.data?.reports;
      setReports(Array.isArray(list) ? list : []);
      setTotal(res.data?.total || 0);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to fetch reports"));
    } finally {
      setLoading(false);
    }
  }, []);

  const submitReport = async (payload: CreateReportPayload): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await reportApi.createReport(payload);
      toast.success("Report submitted successfully.");
      return true;
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to submit report"));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const takeAction = async (id: string, payload: ReportActionPayload): Promise<Report | null> => {
    setIsSubmitting(true);
    try {
      const res = await reportApi.takeAction(id, payload);
      // res = ApiResponse<Report>, res.data = Report object
      const updated = res.data;
      if (!updated) throw new Error("No data returned");
      toast.success("Action taken successfully.");
      setReports((prev) => prev.map((r) => (r._id === id ? updated : r)));
      return updated;
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to update report"));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    reports,
    loading,
    isSubmitting,
    total,
    fetchMyReports,
    fetchAllReports,
    submitReport,
    takeAction,
  };
};