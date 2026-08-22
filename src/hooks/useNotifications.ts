import { useState, useCallback } from "react";
import {
  notificationApi,
  type AppNotification,
  type NotificationsPayload,
} from "../api/notification.service";
import toast from "react-hot-toast";

function normalizeNotificationsPayload(
  data: NotificationsPayload | AppNotification[] | undefined
): { notifications: AppNotification[]; unreadCount: number } {
  if (!data) return { notifications: [], unreadCount: 0 };
  if (Array.isArray(data)) {
    return {
      notifications: data,
      unreadCount: data.filter((n) => !n.isRead).length,
    };
  }
  return {
    notifications: data.notifications ?? [],
    unreadCount: data.unreadCount ?? 0,
  };
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await notificationApi.getNotifications();
      const result = normalizeNotificationsPayload(res.data);
      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      toast.error("Failed to mark notification as read.");
      throw error;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      toast.error("Failed to mark all as read.");
      throw error;
    }
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
};
