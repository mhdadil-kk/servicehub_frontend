import { useState, useCallback } from "react";
import { chatApi, type Conversation, type Message } from "../api/chat.service";
import toast from "react-hot-toast";

export const useChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      setIsLoadingConversations(true);
      const res = await chatApi.getConversations();
      setConversations(res.data || []);
      return res.data || [];
    } catch (error) {
      toast.error("Failed to load conversations.");
      throw error;
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  const loadChatHistory = useCallback(async (conversationId: string) => {
    try {
      setIsLoadingMessages(true);
      const res = await chatApi.getChatHistory(conversationId);
      const sorted = (res.data || []).sort(
        (a: Message, b: Message) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setMessages(sorted);
      await chatApi.markAsRead(conversationId);
      return sorted;
    } catch (error) {
      toast.error("Failed to load chat history.");
      throw error;
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      setIsDeleting(true);
      await chatApi.deleteConversation(conversationId);
      setConversations(prev => prev.filter(c => c._id !== conversationId));
      toast.success("Chat deleted successfully.");
    } catch (error) {
      toast.error("Failed to delete chat.");
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const getOrCreateDirectConversation = useCallback(async (userId: string) => {
    try {
      const res = await chatApi.getOrCreateDirectConversation(userId);
      return res.data;
    } catch (error) {
      toast.error("Could not start a conversation.");
      throw error;
    }
  }, []);

  return {
    conversations,
    setConversations,
    isLoadingConversations,
    fetchConversations,
    messages,
    setMessages,
    isLoadingMessages,
    loadChatHistory,
    deleteConversation,
    getOrCreateDirectConversation,
    isDeleting,
  };
};
