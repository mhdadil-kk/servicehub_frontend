import api from "./axios.instance";
import { API_ROUTES } from "../constants/api.routes";
import type { ApiResponse } from "../types/api.types";

export interface AppNotification {
  _id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "otp" | "message";
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}

export interface NotificationsPayload {
  notifications: AppNotification[];
  unreadCount: number;
}

export const notificationApi = {
  getNotifications: () =>
    api.get<unknown, ApiResponse<NotificationsPayload | AppNotification[]>>(
      API_ROUTES.NOTIFICATIONS.LIST
    ),

  markAsRead: (id: string) =>
    api.patch<unknown, ApiResponse<AppNotification>>(API_ROUTES.NOTIFICATIONS.MARK_READ(id)),

  markAllAsRead: () =>
    api.patch<unknown, ApiResponse<null>>(API_ROUTES.NOTIFICATIONS.MARK_ALL_READ),
};
