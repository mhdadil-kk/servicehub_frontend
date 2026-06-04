import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Send,
  Calendar,
  Clock,
  Check,
  CheckCheck,
  Loader2,
  Inbox,
  Trash2
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import { chatApi } from "../api/chat.service";
import type { Message, Conversation } from "../api/chat.service";
import { getSocket } from "../socket";

const ChatPage: React.FC = () => {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; conversationId: string } | null>(null);

  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [deleteConversationId, setDeleteConversationId] = useState<string | null>(null);
  const [isDeletingChat, setIsDeletingChat] = useState(false);
  // Messages State
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [deleteMessageId, setDeleteMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleCloseMenu = () => setContextMenu(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setContextMenu(null);
    };
    window.addEventListener("click", handleCloseMenu);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("click", handleCloseMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleContextMenu = (e: React.MouseEvent, conversationId: string) => {
    e.preventDefault();
    const menuWidth = 160;
    const menuHeight = 50;
    let x = e.clientX;
    let y = e.clientY;

    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - 10;
    }
    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - 10;
    }

    setContextMenu({ x, y, conversationId });
  };

  const handleDeleteChat = async () => {
    if (!deleteConversationId) return;

    try {
      setIsDeletingChat(true);

      await chatApi.deleteConversation(deleteConversationId);

      toast.success("Chat conversation deleted successfully.");

      setConversations(prev => {
        const next = prev.filter(c => c._id !== deleteConversationId);

        if (selectedConversation?._id === deleteConversationId) {
          if (next.length > 0) {
            setSelectedConversation(next[0]);
            setSearchParams({ conversationId: next[0]._id });
          } else {
            setSelectedConversation(null);
            setSearchParams({});
          }
        }

        return next;
      });

      setDeleteConversationId(null);
    } catch {
      toast.error("Failed to delete conversation.");
    } finally {
      setIsDeletingChat(false);
    }
  };

  // Global online/offline presence listeners (mount once)
  useEffect(() => {
    const s = getSocket();
    s.connect();

    s.on("online_users", ({ userIds }: { userIds: string[] }) => {
      setOnlineUsers(new Set(userIds));
    });

    s.on("user_online", ({ userId }: { userId: string }) => {
      setOnlineUsers(prev => new Set([...prev, userId]));
    });

    s.on("user_offline", ({ userId }: { userId: string }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    return () => {
      s.off("online_users");
      s.off("user_online");
      s.off("user_offline");
    };
  }, []);

  useEffect(() => {
    fetchConversations();
  }, []);

  // Update selection if query params change
  useEffect(() => {
    const qBookingId = searchParams.get("bookingId");
    const qConversationId = searchParams.get("conversationId");

    if (conversations.length > 0) {
      let found = null;
      if (qConversationId) {
        found = conversations.find(c => c._id === qConversationId);
      } else if (qBookingId) {
        found = conversations.find(c => c.bookingId?._id === qBookingId);
      }

      if (found && found._id !== selectedConversation?._id) {
        setSelectedConversation(found);
      }
    }
  }, [searchParams, conversations]);

  // Load chat history and configure sockets when selected conversation changes
  useEffect(() => {
    if (selectedConversation) {
      loadChatHistory(selectedConversation._id);

      const s = getSocket();

      s.on("connect", () => {
        console.log("Socket connected successfully:", s.id);
      });

      s.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message);
      });

      s.connect();
      s.emit("join_room", selectedConversation._id);

      // Listen for incoming messages
      s.on("message_received", (msg: Message) => {
        if (msg.conversationId === selectedConversation._id) {
          setMessages(prev => {
            // Avoid duplicate message appending
            if (prev.some(m => m._id === msg._id)) return prev;
            return [...prev, msg];
          });

          // Mark read on backend and socket if received from partner
          if (msg.senderId !== user?.id) {
            s.emit("mark_read", selectedConversation._id);
            chatApi.markAsRead(selectedConversation._id).catch(console.error);
          }
        }

        // Live update conversation previews in the sidebar
        setConversations(prev => {
          const next = prev.map(c => {
            if (c._id === msg.conversationId) {
              const isCurrentChat = selectedConversation._id === msg.conversationId;
              const newUnreadCount = msg.senderId !== user?.id && !isCurrentChat
                ? (c.unreadCount || 0) + 1
                : c.unreadCount || 0;

              return {
                ...c,
                lastMessage: msg,
                unreadCount: isCurrentChat ? 0 : newUnreadCount
              };
            }
            return c;
          });

          // Resort by newest last message
          return next.sort((a, b) => {
            const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : new Date(a.updatedAt).getTime();
            const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : new Date(b.updatedAt).getTime();
            return timeB - timeA;
          });
        });
      });

      // Listen for read receipts
      s.on("messages_read", (data: { conversationId: string }) => {
        if (data.conversationId === selectedConversation._id) {
          setMessages(prev => prev.map(m => m.senderId === user?.id ? { ...m, read: true, delivered: true } : m));
          setConversations(prev => prev.map(c => c._id === selectedConversation._id ? { ...c, unreadCount: 0 } : c));
        }
      });

      // Listen for delivery receipts
      s.on("messages_delivered", (data: { conversationId: string }) => {
        if (data.conversationId === selectedConversation._id) {
          setMessages(prev => prev.map(m => m.senderId === user?.id && !m.read ? { ...m, delivered: true } : m));
        }
      });

      // Listen for deleted messages
      s.on("message_deleted", (msg: Message) => {
        if (msg.conversationId === selectedConversation._id) {
          setMessages(prev => prev.map(m => m._id === msg._id ? msg : m));

          // If it was the last message, update conversation preview
          setConversations(prev => prev.map(c => {
            if (c._id === msg.conversationId && c.lastMessage?._id === msg._id) {
              return { ...c, lastMessage: msg };
            }
            return c;
          }));
        }
      });

      return () => {
        s.off("connect");
        s.off("connect_error");
        s.off("message_received");
        s.off("messages_read");
        s.off("message_deleted");
        s.emit("mark_read", selectedConversation._id);
      };
    }
  }, [selectedConversation]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setIsLoadingConversations(true);
      const res = await chatApi.getConversations();
      const list = res.data || [];
      setConversations(list);

      const qBookingId = searchParams.get("bookingId");
      const qConversationId = searchParams.get("conversationId");

      if (list.length > 0) {
        let found = null;
        if (qConversationId) {
          found = list.find(c => c._id === qConversationId);
        } else if (qBookingId) {
          found = list.find(c => c.bookingId?._id === qBookingId);
        }

        if (found) {
          setSelectedConversation(found);
        } else if (!qConversationId && !qBookingId) {
          setSelectedConversation(list[0]);
          setSearchParams({ conversationId: list[0]._id });
        }
      }
    } catch (e) {
      toast.error("Failed to load active chats.");
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const loadChatHistory = async (id: string) => {
    try {
      setIsLoadingMessages(true);

      const res = await chatApi.getChatHistory(id);

      const chatMessages = res.data || [];

      chatMessages.sort(
        (a: Message, b: Message) =>
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
      );

      setMessages(chatMessages);

      await chatApi.markAsRead(id);

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "auto"
        });
      }, 100);

    } catch (e) {
      toast.error("Failed to load chat history.");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const s = getSocket();
    s.emit("send_message", {
      conversationId: selectedConversation._id,
      content: newMessage.trim()
    });

    setNewMessage("");
  };

  const handleDeleteMessage = (messageId: string) => {
    setDeleteMessageId(messageId);
  };

  const confirmDeleteMessage = () => {
    if (!deleteMessageId) return;
    const s = getSocket();
    s.emit("delete_message", { messageId: deleteMessageId });
    setDeleteMessageId(null);
  };

  const selectThread = (c: Conversation) => {
    setSelectedConversation(c);
    setSearchParams({ conversationId: c._id });
  };

  const getPartnerName = (c: Conversation) => {
    const partner = c.participants.find(p => p._id !== user?.id);
    return partner?.name || "Member";
  };

  return (
    <div className="h-[calc(100vh-120px)] flex -m-8 overflow-hidden bg-slate-50">

      {/* ── SIDEBAR THREAD LIST ── */}
      <aside className="w-80 h-full bg-white border-r border-slate-100 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-50 shrink-0">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Messages</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Active Conversations</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {isLoadingConversations ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 size={24} className="text-blue-600 animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <Inbox size={24} className="text-slate-300 mx-auto" />
              <p className="text-xs text-slate-400 font-bold">No active conversations</p>
            </div>
          ) : (
            conversations.map((c) => {
              const isActive = selectedConversation?._id === c._id;
              const name = getPartnerName(c);
              // Show 'Customer' if current user is provider, else show the provider's service category
              const service = user?.role === "provider"
                ? "Customer"
                : c.providerServiceName || "Service Provider";
              const lastText = c.lastMessage ? c.lastMessage.content : "No messages yet";

              return (
                <div
                  key={c._id}
                  onClick={() => selectThread(c)}
                  onContextMenu={(e) => handleContextMenu(e, c._id)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border flex items-center gap-3 relative ${isActive
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100"
                    : "bg-white hover:bg-slate-50 border-slate-100 text-slate-700"
                    }`}
                >
                  <div className="relative w-10 h-10 shrink-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                      <img
                        src={c.participants.find(p => p._id !== user?.id)?.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${name}`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Online / offline indicator dot */}
                    {(() => {
                      const partner = c.participants.find((p: any) => p._id !== user?.id);
                      const isOnline = partner && onlineUsers.has(partner._id);
                      return (
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${isActive ? "border-blue-600" : "border-white"
                            } ${isOnline
                              ? "bg-emerald-400 shadow-[0_0_0_2px_rgba(52,211,153,0.3)]"
                              : "bg-slate-300"
                            }`}
                        />
                      );
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-black truncate ${isActive ? "text-white" : "text-slate-900"}`}>{name}</p>
                    <p className={`text-[10px] font-semibold truncate ${isActive ? "text-blue-100" : "text-slate-400"} mt-0.5`}>
                      {lastText}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${isActive ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-500"
                      }`}>
                      {service}
                    </span>
                    {c.unreadCount && c.unreadCount > 0 ? (
                      <span className="w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[8px] font-black shadow-sm shadow-rose-100 animate-pulse">
                        {c.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* ── MAIN CHAT PANEL ── */}
      <section className="flex-1 h-full flex flex-col bg-[#F9FAFB]">
        {selectedConversation ? (
          <>
            {/* Header info bar */}
            <div className="bg-white border-b border-slate-100 px-8 py-5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                {(() => {
                  const headerPartner = selectedConversation.participants.find((p: any) => p._id !== user?.id);
                  const headerOnline = headerPartner && onlineUsers.has(headerPartner._id);
                  return (
                    <div className="relative w-10 h-10 shrink-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                        <img 
                          src={headerPartner?.profilePhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${getPartnerName(selectedConversation)}`} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  );
                })()}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-slate-900">{getPartnerName(selectedConversation)}</h4>
                    <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                      {user?.role === "provider"
                        ? "Customer"
                        : selectedConversation.providerServiceName || "Service Provider"
                      }
                    </span>
                  </div>
                  {(() => {
                    const hp = selectedConversation.participants.find((p: any) => p._id !== user?.id);
                    const hp_online = hp && onlineUsers.has(hp._id);
                    return (
                      <p className={`text-[10px] font-bold flex items-center gap-1 mt-0.5 ${hp_online ? "text-emerald-500" : "text-slate-400"}`}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${hp_online ? "bg-emerald-400" : "bg-slate-300"}`} />
                        {hp_online ? "Online" : "Offline"}
                      </p>
                    );
                  })()}
                </div>
              </div>

              {/* Booking schedule details */}
              {selectedConversation.bookingId && (
                <div className="hidden md:flex gap-6 text-[10px] font-bold text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    <span>{selectedConversation.bookingId.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} />
                    <span>{selectedConversation.bookingId.slot.start} - {selectedConversation.bookingId.slot.end}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Message Bubble list */}
            <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
              {isLoadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 size={24} className="text-blue-600 animate-spin" />
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.senderId === user?.id;

                  return (
                    <div
                      key={msg._id || i}
                      className={`flex ${isMe ? "justify-end" : "justify-start"} group`}
                    >
                      {/* Delete Button (Only for own messages that aren't already deleted) */}
                      {isMe && !msg.isDeleted && (
                        <button
                          onClick={() => handleDeleteMessage(msg._id)}
                          className="mr-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity self-center p-2 rounded-full hover:bg-red-50"
                          title="Delete message"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}

                      {msg.messageType === "booking_card" && !msg.isDeleted ? (
                        <div className={`max-w-[85%] md:max-w-[65%] rounded-2xl border ${isMe ? 'border-blue-200 bg-blue-50/50' : 'border-slate-200 bg-white'} overflow-hidden shadow-sm flex flex-col`}>
                          <div className={`p-4 border-b ${isMe ? 'border-blue-100 bg-blue-100/30' : 'border-slate-100 bg-slate-50'}`}>
                            <div className="flex items-center gap-2 mb-1.5">
                              <Calendar size={14} className={isMe ? 'text-blue-600' : 'text-slate-600'} />
                              <span className={`text-xs font-black ${isMe ? 'text-blue-900' : 'text-slate-900'}`}>Booking Request</span>
                            </div>
                            <p className={`text-[11px] font-medium leading-relaxed ${isMe ? 'text-blue-700' : 'text-slate-500'}`}>{msg.content}</p>
                          </div>
                          <div className={`p-3 flex items-center justify-between ${isMe ? 'bg-blue-50/50' : 'bg-white'}`}>
                            <button 
                              onClick={() => {
                                if (user?.role === "provider" && msg.bookingId) {
                                  navigate(`/provider/bookings/${msg.bookingId}`);
                                } else {
                                  navigate("/user/bookings");
                                }
                              }}
                              className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold px-4 py-1.5 rounded-lg transition-colors shadow-sm"
                            >
                              View Booking
                            </button>
                            <div className={`flex items-center gap-1 text-[9px] font-semibold ${isMe ? "text-blue-300" : "text-slate-400"}`}>
                              <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              {isMe && (
                                msg.read ? (
                                  <CheckCheck size={13} strokeWidth={3} className="text-emerald-500 drop-shadow-sm" />
                                ) : msg.delivered ? (
                                  <CheckCheck size={11} strokeWidth={2.5} className="text-blue-400" />
                                ) : (
                                  <Check size={11} strokeWidth={2.5} className="text-blue-400" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className={`max-w-[70%] rounded-[24px] px-5 py-3 shadow-sm text-xs leading-relaxed relative transition-colors ${
                          msg.isDeleted
                            ? "bg-slate-50 border border-slate-200 text-slate-400 italic" 
                            : isMe
                              ? "bg-blue-600 text-white rounded-br-none"
                              : "bg-white border border-slate-100 text-slate-800 rounded-bl-none"
                        }`}>
                          <p className={msg.isDeleted ? "opacity-75" : ""}>{msg.content}</p>

                          <div className={`flex items-center justify-end gap-1 text-[9px] mt-1.5 font-semibold ${
                            msg.isDeleted ? "text-slate-300" : isMe ? "text-blue-200" : "text-slate-400"
                          }`}>
                            <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isMe && !msg.isDeleted && (
                              msg.read ? (
                                <CheckCheck size={13} strokeWidth={3} className="text-emerald-400 drop-shadow-sm" />
                              ) : msg.delivered ? (
                                <CheckCheck size={11} strokeWidth={2.5} className="text-white/40" />
                              ) : (
                                <Check size={11} strokeWidth={2.5} className="text-white/40" />
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-6 bg-white border-t border-slate-100 shrink-0 flex gap-3"
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="w-12 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-100 hover:scale-[1.03] transition-all disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center p-12">
            <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 flex items-center justify-center shadow-sm text-slate-300 mb-6">
              <MessageSquare size={28} />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1.5">Select a conversation</h3>
            <p className="text-xs text-slate-400 font-semibold max-w-xs leading-relaxed">
              Choose a booking thread or direct conversation from the list on the left to start real-time messaging.
            </p>
          </div>
        )}
      </section>

      {contextMenu && (
        <div
          className="fixed bg-white border border-slate-100 rounded-xl shadow-xl py-1.5 z-50 min-w-[160px] animate-in fade-in zoom-in-95 duration-100"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setDeleteConversationId(contextMenu.conversationId);
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
          >
            <Trash2 size={14} />
            <span>Delete Chat</span>
          </button>
        </div>
      )}


      {deleteConversationId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100">

            <div className="flex items-center justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center">
                <Trash2 size={24} className="text-rose-600" />
              </div>
            </div>

            <h3 className="text-lg font-black text-slate-900 text-center">
              Delete Chat?
            </h3>

            <p className="text-sm text-slate-500 text-center mt-2">
              Are you sure you want to delete this conversation?
            </p>

            <p className="text-xs text-rose-500 text-center mt-2">
              This action cannot be undone.
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteConversationId(null)}
                disabled={isDeletingChat}
                className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteChat}
                disabled={isDeletingChat}
                className="flex-1 h-11 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 flex items-center justify-center gap-2"
              >
                {isDeletingChat && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteMessageId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">

            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center">
                <Trash2 size={24} className="text-rose-600" />
              </div>
            </div>

            <h3 className="text-lg font-black text-center">
              Delete Message?
            </h3>

            <p className="text-sm text-slate-500 text-center mt-2">
              Are you sure you want to delete this message?
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteMessageId(null)}
                className="flex-1 h-11 rounded-xl border border-slate-200"
              >
                Cancel
              </button>

              <button
                onClick={confirmDeleteMessage}
                className="flex-1 h-11 rounded-xl bg-rose-600 text-white"
              >
                Delete
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ChatPage;
