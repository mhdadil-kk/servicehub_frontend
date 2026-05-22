import { useState, useCallback } from "react";
import { adminService } from "../api/admin.service";
import type { IUser } from "../types/api.types";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

export const useAdmin = () => {
  const [data, setData] = useState<IUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (search?: string, status?: string, sort?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getAllUsers(search, status, sort, page, limit);
      setData(res.data?.users || []);
      setTotal(res.data?.total || 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  const fetchProviders = useCallback(async (search?: string, status?: string, sort?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getProviders(search, status, sort, page, limit);
      setData(res.data?.providers || []);
      setTotal(res.data?.total || 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch providers");
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  const blockUser = useCallback(async (id: string, type: "customer" | "provider") => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Are you sure you want to block this ${type}? Access will be restricted immediately.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, block it!"
    });
    if (!result.isConfirmed) return false;

    try {
      await adminService.deleteUser(id);
      setData(prev => prev.filter(u => u.id !== id)); 
      toast.success(`${type} blocked successfully`);
      return true;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : `Failed to block ${type}`);
      return false;
    }
  }, []);

  const unblockUser = useCallback(async (id: string, type: "customer" | "provider") => {
    const result = await Swal.fire({
      title: "Restore Access?",
      text: `Are you sure you want to restore access for this ${type}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, restore access"
    });
    if (!result.isConfirmed) return false;

    try {
      await adminService.unblockUser(id);
      toast.success(`Access restored for ${type}`);
      return true;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : `Failed to restore ${type}`);
      return false;
    }
  }, []);

  const updateProviderStatus = useCallback(async (id: string, status: string) => {
    const action = status === "approved" ? "approve" : "reject";
    const result = await Swal.fire({
      title: "Confirm Action",
      text: `Are you sure you want to ${action} this provider?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: status === "approved" ? "#10b981" : "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: `Yes, ${action}`
    });
    if (!result.isConfirmed) return false;

    try {
      await adminService.updateProviderStatus(id, status);
      toast.success(`Provider ${action}d successfully`);
      return true;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : `Failed to ${action} provider`);
      return false;
    }
  }, []);

  return {
    data,
    total,
    page,
    limit,
    loading,
    error,
    setPage,
    fetchUsers,
    fetchProviders,
    blockUser,
    unblockUser,
    updateProviderStatus,
    setData
  };
};
