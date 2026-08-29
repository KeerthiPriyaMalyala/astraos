import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  CheckCheck,
  ChevronRight,
  Clock3,
  Loader2,
  X,
} from "lucide-react";

import api from "../api/axios";

const NotificationBell = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const [error, setError] = useState("");

  const dropdownRef = useRef(null);

  // =====================================================
  // FETCH NOTIFICATIONS
  // =====================================================

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/notifications");

      const data = response.data;

      if (data.success) {
        setNotifications(
          data.data?.notifications || []
        );

        setUnreadCount(
          data.data?.unreadCount || 0
        );
      }
    } catch (error) {
      console.error(
        "❌ Notification fetch error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load notifications"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH UNREAD COUNT
  // =====================================================

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get(
        "/notifications/unread-count"
      );

      const data = response.data;

      if (data.success) {
        setUnreadCount(
          data.data?.unreadCount || 0
        );
      }
    } catch (error) {
      console.error(
        "❌ Unread notification count error:",
        error
      );
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // =====================================================
  // CLOSE WHEN CLICKING OUTSIDE
  // =====================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // =====================================================
  // OPEN DROPDOWN
  // =====================================================

  const handleOpen = () => {
    const nextState = !open;

    setOpen(nextState);

    if (nextState) {
      fetchNotifications();
    }
  };

  // =====================================================
  // MARK ONE AS READ
  // =====================================================

  const markAsRead = async (
    notification,
    shouldNavigate = true
  ) => {
    try {
      if (!notification.isRead) {
        await api.patch(
          `/notifications/${notification._id}/read`
        );

        setNotifications((previous) =>
          previous.map((item) =>
            item._id === notification._id
              ? {
                  ...item,
                  isRead: true,
                }
              : item
          )
        );

        setUnreadCount((count) =>
          Math.max(0, count - 1)
        );
      }

      if (
        shouldNavigate &&
        notification.complaint?._id
      ) {
        setOpen(false);

        navigate(
          `/complaints/${notification.complaint._id}`
        );
      }
    } catch (error) {
      console.error(
        "❌ Mark notification read error:",
        error
      );
    }
  };

  // =====================================================
  // MARK ALL AS READ
  // =====================================================

  const markAllAsRead = async () => {
    try {
      await api.patch(
        "/notifications/read-all"
      );

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "❌ Mark all notifications error:",
        error
      );
    }
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (date) => {
    if (!date) return "";

    const created = new Date(date);
    const now = new Date();

    const difference =
      Math.floor(
        (now - created) / 1000
      );

    if (difference < 60) {
      return "Just now";
    }

    if (difference < 3600) {
      return `${Math.floor(
        difference / 60
      )}m ago`;
    }

    if (difference < 86400) {
      return `${Math.floor(
        difference / 3600
      )}h ago`;
    }

    if (difference < 604800) {
      return `${Math.floor(
        difference / 86400
      )}d ago`;
    }

    return created.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
      }
    );
  };

  // =====================================================
  // NOTIFICATION ICON
  // =====================================================

  const getNotificationIcon = (type) => {
    const normalized =
      String(type || "").toUpperCase();

    if (
      normalized.includes("RESOLVED") ||
      normalized.includes("CLOSED") ||
      normalized.includes("VERIFIED")
    ) {
      return (
        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-400/10 flex items-center justify-center">
          <Check className="w-4 h-4 text-emerald-400" />
        </div>
      );
    }

    if (
      normalized.includes("ASSIGN") ||
      normalized.includes("OFFICER")
    ) {
      return (
        <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-400/10 flex items-center justify-center">
          <Bell className="w-4 h-4 text-blue-400" />
        </div>
      );
    }

    return (
      <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-400/10 flex items-center justify-center">
        <Bell className="w-4 h-4 text-cyan-400" />
      </div>
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      ref={dropdownRef}
      className="relative"
    >
      {/* =================================================
          BELL
      ================================================= */}

      <button
        onClick={handleOpen}
        className={`relative w-10 h-10 rounded-xl border flex items-center justify-center transition ${
          open
            ? "border-blue-400/30 bg-blue-500/10 text-blue-300"
            : "border-white/10 bg-white/[0.04] text-slate-400 hover:text-white hover:border-blue-400/20 hover:bg-blue-500/5"
        }`}
        title="Notifications"
      >
        <Bell className="w-4.5 h-4.5" />

        {/* UNREAD BADGE */}

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-500 border-2 border-[#050b16] text-[9px] font-black text-white flex items-center justify-center">
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>

      {/* =================================================
          DROPDOWN
      ================================================= */}

      {open && (
        <div className="absolute right-0 top-12 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-white/10 bg-[#09111f]/95 backdrop-blur-2xl shadow-2xl shadow-black/40 overflow-hidden z-[100]">

          {/* HEADER */}

          <div className="px-4 py-4 border-b border-white/10 flex items-center justify-between">

            <div>
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-400" />

                <h3 className="text-sm font-bold text-white">
                  Notifications
                </h3>

                {unreadCount > 0 && (
                  <span className="rounded-full bg-blue-500/10 border border-blue-400/20 px-2 py-0.5 text-[9px] font-bold text-blue-300">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <p className="mt-1 text-[10px] text-slate-500">
                Stay updated on your civic activity
              </p>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>

          </div>

          {/* MARK ALL */}

          {unreadCount > 0 && (
            <div className="px-4 py-2 border-b border-white/5 flex justify-end">

              <button
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-400 hover:text-blue-300 transition"
              >
                <CheckCheck className="w-3.5 h-3.5" />

                Mark all as read
              </button>

            </div>
          )}

          {/* CONTENT */}

          <div className="max-h-[390px] overflow-y-auto">

            {loading ? (

              <div className="py-12 flex flex-col items-center justify-center">

                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />

                <p className="mt-3 text-xs text-slate-500">
                  Loading notifications...
                </p>

              </div>

            ) : error ? (

              <div className="py-10 px-5 text-center">

                <Bell className="mx-auto w-7 h-7 text-slate-600" />

                <p className="mt-3 text-xs text-slate-500">
                  {error}
                </p>

                <button
                  onClick={fetchNotifications}
                  className="mt-3 text-[10px] font-bold text-blue-400"
                >
                  Try again
                </button>

              </div>

            ) : notifications.length === 0 ? (

              <div className="py-12 px-5 text-center">

                <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-400/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-400" />
                </div>

                <p className="mt-4 text-sm font-bold">
                  You're all caught up
                </p>

                <p className="mt-1 text-[10px] text-slate-600">
                  New civic updates will appear here.
                </p>

              </div>

            ) : (

              notifications
                .slice(0, 8)
                .map((notification) => (

                  <button
                    key={notification._id}
                    onClick={() =>
                      markAsRead(notification)
                    }
                    className={`w-full text-left px-4 py-3 border-b border-white/5 flex gap-3 hover:bg-white/[0.035] transition ${
                      !notification.isRead
                        ? "bg-blue-500/[0.035]"
                        : ""
                    }`}
                  >

                    {getNotificationIcon(
                      notification.type
                    )}

                    <div className="min-w-0 flex-1">

                      <div className="flex items-start gap-2">

                        <p
                          className={`text-xs font-bold truncate ${
                            notification.isRead
                              ? "text-slate-300"
                              : "text-white"
                          }`}
                        >
                          {notification.title}
                        </p>

                        {!notification.isRead && (
                          <span className="mt-1.5 w-1.5 h-1.5 shrink-0 rounded-full bg-blue-400" />
                        )}

                      </div>

                      <p className="mt-1 text-[10px] leading-relaxed text-slate-500 line-clamp-2">
                        {notification.message}
                      </p>

                      <div className="mt-2 flex items-center gap-1 text-[9px] text-slate-600">

                        <Clock3 className="w-3 h-3" />

                        {formatTime(
                          notification.createdAt
                        )}

                        {notification.complaint?.title && (
                          <>
                            <span>•</span>

                            <span className="truncate">
                              {notification.complaint.title}
                            </span>
                          </>
                        )}

                      </div>

                    </div>

                    <ChevronRight className="w-3.5 h-3.5 shrink-0 mt-2 text-slate-700" />

                  </button>

                ))

            )}

          </div>

          {/* FOOTER */}

          {notifications.length > 0 && (
            <div className="p-3 border-t border-white/10">

              <button
                onClick={() => {
                  setOpen(false);
                  navigate("/notifications");
                }}
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 py-2.5 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/[0.06] transition flex items-center justify-center gap-2"
              >
                View all notifications

                <ChevronRight className="w-3.5 h-3.5" />
              </button>

            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default NotificationBell;