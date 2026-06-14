import api from "./axios.instance";

export interface AppNotification {
  _id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "otp" | "message";
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}

export const notificationApi = {
  getNotifications: () => 
    api.get<{ data: { notifications: AppNotification[], unreadCount: number } }>("/notifications"),

  markAsRead: (id: string) =>
    api.patch<{ data: AppNotification }>(`/notifications/${id}/read`),

  markAllAsRead: () =>
    api.patch<{ data: null }>("/notifications/read-all")
};
