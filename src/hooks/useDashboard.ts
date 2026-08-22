import { useState, useCallback } from "react";
import { dashboardApi } from "../api/dashboard.service";
import toast from "react-hot-toast";
import type { UserDashboardData, ProviderDashboardData } from "../types/domain.types";

export type DashboardData = UserDashboardData | ProviderDashboardData;

export const useDashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUserDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getUserDashboard();
      const payload = res.data ?? null;
      setData(payload);
      return payload;
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
      const payload = res.data ?? null;
      setData(payload);
      return payload;
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
