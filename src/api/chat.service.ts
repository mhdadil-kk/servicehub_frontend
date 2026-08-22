import axiosInstance from "./axios.instance";
import { API_BASE_URL } from "../constants/api";
import { API_ROUTES } from "../constants/api.routes";
import type { ApiResponse } from "../types/api.types";

export interface Message {
  _id: string;
  conversationId: string;
  bookingId?: string;
  senderId: string;
  senderRole: "user" | "provider";
  messageType?: "text" | "booking_card" | "image";
  content: string;
  imageUrl?: string;
  read: boolean;
  delivered?: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  _id: string;
  name?: string;
  profilePhoto?: string;
  role?: string;
}

export interface Conversation {
  _id: string;
  participants: Participant[];
  bookingId?: string | null;
  lastMessage?: Message | null;
  unreadCount?: number;
  providerServiceName?: string;
  createdAt: string;
  updatedAt: string;
}

export const chatApi = {
  getConversations: () =>
    axiosInstance.get<unknown, ApiResponse<Conversation[]>>(API_ROUTES.CHAT.CONVERSATIONS),

  getOrCreateDirectConversation: (targetUserId: string) =>
    axiosInstance.post<unknown, ApiResponse<Conversation>>(API_ROUTES.CHAT.CONVERSATIONS, { targetUserId }),

  getChatHistory: (id: string) =>
    axiosInstance.get<unknown, ApiResponse<Message[]>>(API_ROUTES.CHAT.HISTORY(id)),

  markAsRead: (id: string) =>
    axiosInstance.patch<unknown, ApiResponse<null>>(API_ROUTES.CHAT.MARK_READ(id)),

  deleteConversation: (conversationId: string) =>
    axiosInstance.delete<unknown, ApiResponse<null>>(API_ROUTES.CHAT.CONVERSATION_BY_ID(conversationId)),

  uploadChatImage: async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    const token = localStorage.getItem("accessToken");

    const res = await fetch(`${API_BASE_URL}/chat/upload-image`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw { response: { data } };
    }
    return { data };
  },
};