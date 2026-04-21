import { useState, useCallback } from "react";
import { adminService } from "../api/admin.service";
import type { IUser } from "../types/api.types";

export const useAdmin = () => {
  const [data, setData] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getAllUsers();
      setData(res.data?.users || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getProviders();
      setData(res.data?.providers || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch providers");
    } finally {
      setLoading(false);
    }
  }, []);

  const blockUser = useCallback(async (id: string, type: "customer" | "provider") => {
    if (!window.confirm(`Are you sure you want to block this ${type}? Access will be restricted immediately.`)) return;
    try {
      await adminService.deleteUser(id);
      setData(prev => prev.filter(u => u.id !== id)); // Immediate UI update or refetch
      return true;
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : `Failed to block ${type}`);
      return false;
    }
  }, []);

  const unblockUser = useCallback(async (id: string, type: "customer" | "provider") => {
    if (!window.confirm(`Are you sure you want to restore access for this ${type}?`)) return;
    try {
      await adminService.unblockUser(id);
      return true;
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : `Failed to restore ${type}`);
      return false;
    }
  }, []);

  const updateProviderStatus = useCallback(async (id: string, status: string) => {
    const action = status === "approved" ? "approve" : "reject";
    if (!window.confirm(`Are you sure you want to ${action} this provider?`)) return;
    try {
      await adminService.updateProviderStatus(id, status);
      return true;
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : `Failed to ${action} provider`);
      return false;
    }
  }, []);

  return {
    data,
    loading,
    error,
    fetchUsers,
    fetchProviders,
    blockUser,
    unblockUser,
    updateProviderStatus,
    setData
  };
};
