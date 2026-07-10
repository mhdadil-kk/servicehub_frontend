import { useState, useCallback } from "react";
import { serviceApi } from "../api/service.service";
import type { IService } from "../types/api.types";
import type { Provider } from "../types/provider.types";
import toast from "react-hot-toast";

export const useServices = () => {
  const [services, setServices] = useState<IService[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(false);

  const fetchActiveServices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await serviceApi.getActiveServices();
      setServices(res.data || []);
      return res.data || [];
    } catch (error) {
      toast.error("Failed to load services.");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const browseProviders = useCallback(async (params: Parameters<typeof serviceApi.browseProviders>[0]) => {
    try {
      setLoadingProviders(true);
      const res = await serviceApi.browseProviders(params);
      const result = res.data;
      setProviders(result?.providers || []);
      setTotal(result?.total || 0);
      setTotalPages(result?.totalPages || 1);
      return result;
    } catch (error) {
      toast.error("Failed to load providers.");
      throw error;
    } finally {
      setLoadingProviders(false);
    }
  }, []);

  return {
    services,
    providers,
    total,
    totalPages,
    loading,
    loadingProviders,
    fetchActiveServices,
    browseProviders,
  };
};
