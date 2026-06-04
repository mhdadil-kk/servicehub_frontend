import axiosInstance from "./axios.instance";
import type { ApiResponse } from "../types/api.types";

export interface Message {
  _id: string;
  conversationId: string;
  bookingId?: string;
  senderId: string;
  senderRole: "user" | "provider";
  messageType?: "text" | "booking_card";
  content: string;
  read: boolean;
  delivered?: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  participants: any[];
  bookingId?: any | null;
  lastMessage?: Message | null;
  unreadCount?: number;
  providerServiceName?: string;
  createdAt: string;
  updatedAt: string;
}

export const chatApi = {
  getConversations: () =>
    axiosInstance.get<unknown, ApiResponse<Conversation[]>>("/chat/conversations"),

  getOrCreateDirectConversation: (targetUserId: string) =>
    axiosInstance.post<unknown, ApiResponse<Conversation>>("/chat/conversations", { targetUserId }),

  getChatHistory: (id: string) =>
    axiosInstance.get<unknown, ApiResponse<Message[]>>(`/chat/${id}`),

  markAsRead: (id: string) =>
    axiosInstance.patch<unknown, ApiResponse<null>>(`/chat/${id}/read`),

  deleteConversation: (conversationId: string) =>
    axiosInstance.delete<unknown, ApiResponse<null>>(`/chat/conversations/${conversationId}`),
};
