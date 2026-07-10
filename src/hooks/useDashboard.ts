import { useState, useCallback } from "react";
import { dashboardApi } from "../api/dashboard.service";
import toast from "react-hot-toast";

export const useDashboard = () => {
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  const fetchUserDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getUserDashboard();
      setData((res as any).data);
      return (res as any).data;
    } catch (error) {
      toast.error("Failed to load dashboard data.");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProviderDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getProviderDashboard();
      setData((res as any).data);
      return (res as any).data;
    } catch (error) {
      toast.error("Failed to load dashboard data.");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    fetchUserDashboard,
    fetchProviderDashboard,
  };
};
