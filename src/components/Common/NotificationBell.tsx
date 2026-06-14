import React, { useState, useEffect, useRef } from "react";
import { Bell, CheckCircle2, ShieldAlert, Info, MessageSquare, AlertCircle } from "lucide-react";
import { notificationApi } from "../../api/notification.service";
import type { AppNotification } from "../../api/notification.service";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";

export const NotificationBell: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await notificationApi.getNotifications();
      const payload = (res as any)?.data?.data ?? (res as any)?.data ?? {};
      setNotifications(payload.notifications || []);
      setUnreadCount(payload.unreadCount || 0);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const handleNotificationClick = async (notification: AppNotification) => {
    if (!notification.isRead) {
      try {
        await notificationApi.markAsRead(notification._id);
        setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (e) {}
    }
    setIsOpen(false);

    // Deep link routing based on relatedId
    if (notification.relatedId) {
      const rolePrefix = user?.role === "provider" ? "/provider" : "/user";
      if (notification.type === "message") {
        navigate(`${rolePrefix}/messages?bookingId=${notification.relatedId}`);
      } else {
        // Assume other related IDs are bookings
        navigate(`${rolePrefix}/bookings/${notification.relatedId}`);
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle2 size={16} className="text-emerald-500" />;
      case "warning": return <ShieldAlert size={16} className="text-orange-500" />;
      case "otp": return <AlertCircle size={16} className="text-blue-500" />;
      case "message": return <MessageSquare size={16} className="text-purple-500" />;
      default: return <Info size={16} className="text-slate-400" />;
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center relative text-slate-600 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="text-sm font-black text-slate-900">Notifications</h3>
              <p className="text-[10px] font-bold text-slate-400">{unreadCount} unread</p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-500">
                <Bell size={24} className="mx-auto mb-2 opacity-20" />
                <p className="text-xs font-bold">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`px-4 py-3 border-b border-slate-50 flex gap-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                    !notif.isRead ? "bg-blue-50/30" : ""
                  }`}
                >
                  <div className="mt-1 shrink-0 bg-white p-1.5 rounded-lg border border-slate-100 shadow-sm">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-xs font-bold text-slate-900 ${!notif.isRead ? "font-black" : ""}`}>
                      {notif.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      {notif.message}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 mt-1.5 uppercase tracking-wider">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="shrink-0 flex flex-col items-center justify-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mb-2"></div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
