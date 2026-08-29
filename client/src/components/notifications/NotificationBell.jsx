
import React, { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../services/notificationService";

// =====================================================
// ASTRAOS NOTIFICATION BELL
// =====================================================

const NotificationBell = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const dropdownRef = useRef(null);

  // ===================================================
  // LOAD NOTIFICATIONS
  // ===================================================

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const response = await getMyNotifications();

      if (response?.success) {
        setNotifications(
          response.data?.notifications || []
        );

        setUnreadCount(
          response.data?.unreadCount || 0
        );
      }
    } catch (error) {
      console.error(
        "❌ Failed to load notifications:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // LOAD ON COMPONENT MOUNT
  // ===================================================

  useEffect(() => {
    loadNotifications();
  }, []);

  // ===================================================
  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  // ===================================================

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

  // ===================================================
  // MARK ONE AS READ
  // ===================================================

  const handleNotificationClick = async (
    notification
  ) => {
    try {
      if (!notification.isRead) {
        await markNotificationAsRead(
          notification._id
        );

        setNotifications((previous) =>
          previous.map((item) =>
            item._id === notification._id
              ? {
                  ...item,
                  isRead: true,
                  readAt: new Date(),
                }
              : item
          )
        );

        setUnreadCount((previous) =>
          Math.max(previous - 1, 0)
        );
      }

      // =================================================
      // NAVIGATE TO RELATED COMPLAINT
      // =================================================

      if (notification.complaint?._id) {
        navigate(
          `/complaints/${notification.complaint._id}`
        );

        setOpen(false);
      }
    } catch (error) {
      console.error(
        "❌ Failed to mark notification as read:",
        error
      );
    }
  };

  // ===================================================
  // MARK ALL AS READ
  // ===================================================

  const handleMarkAllAsRead = async () => {
    try {
      if (unreadCount === 0) {
        return;
      }

      await markAllNotificationsAsRead();

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
          readAt: notification.readAt || new Date(),
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "❌ Failed to mark all notifications as read:",
        error
      );
    }
  };

  // ===================================================
  // FORMAT TIME
  // ===================================================

  const formatTime = (date) => {
    if (!date) {
      return "";
    }

    const notificationDate = new Date(date);

    if (Number.isNaN(notificationDate.getTime())) {
      return "";
    }

    const now = new Date();

    const difference =
      now.getTime() -
      notificationDate.getTime();

    const seconds = Math.floor(
      difference / 1000
    );

    if (seconds < 60) {
      return "Just now";
    }

    const minutes = Math.floor(
      seconds / 60
    );

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    const hours = Math.floor(
      minutes / 60
    );

    if (hours < 24) {
      return `${hours}h ago`;
    }

    const days = Math.floor(
      hours / 24
    );

    if (days < 7) {
      return `${days}d ago`;
    }

    return notificationDate.toLocaleDateString();
  };

  // ===================================================
  // GET NOTIFICATION ICON
  // ===================================================

  const getNotificationIcon = (type) => {
    switch (type) {
      case "COMPLAINT_CREATED":
        return "📝";

      case "AI_ANALYZED":
        return "🤖";

      case "PRIORITY_ASSIGNED":
        return "🎯";

      case "DEPARTMENT_ASSIGNED":
        return "🏢";

      case "OFFICER_ASSIGNED":
        return "👮";

      case "COMPLAINT_ACCEPTED":
        return "✅";

      case "WORK_STARTED":
        return "🔧";

      case "WORK_PROGRESS":
        return "📊";

      case "COMPLAINT_RESOLVED":
        return "🎉";

      case "CITIZEN_VERIFIED":
        return "✔️";

      case "COMPLAINT_CLOSED":
        return "🔒";

      case "COMPLAINT_REOPENED":
        return "🔄";

      case "DUPLICATE_DETECTED":
        return "🔎";

      default:
        return "🔔";
    }
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div
      className="relative"
      ref={dropdownRef}
    >
      {/* =================================================
          BELL BUTTON
      ================================================= */}

      <button
        type="button"
        onClick={() => {
          setOpen((previous) => !previous);

          if (!open) {
            loadNotifications();
          }
        }}
        className="
          relative
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          text-gray-600
          transition
          hover:bg-gray-100
          hover:text-gray-900
        "
        aria-label="Notifications"
      >
        <Bell size={21} />

        {/* ===============================================
            UNREAD BADGE
        =============================================== */}

        {unreadCount > 0 && (
          <span
            className="
              absolute
              -right-0.5
              -top-0.5
              flex
              min-h-[18px]
              min-w-[18px]
              items-center
              justify-center
              rounded-full
              bg-red-500
              px-1
              text-[10px]
              font-bold
              text-white
              ring-2
              ring-white
            "
          >
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
        <div
          className="
            absolute
            right-0
            top-12
            z-50
            w-[360px]
            overflow-hidden
            rounded-2xl
            border
            border-gray-200
            bg-white
            shadow-xl
          "
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-gray-100
              px-4
              py-3
            "
          >
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Notifications
              </h3>

              <p className="text-xs text-gray-500">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : "You're all caught up"}
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="
                  flex
                  items-center
                  gap-1
                  rounded-lg
                  px-2
                  py-1.5
                  text-xs
                  font-medium
                  text-blue-600
                  transition
                  hover:bg-blue-50
                "
              >
                <CheckCheck size={14} />

                Mark all read
              </button>
            )}
          </div>

          {/* =================================================
              NOTIFICATION LIST
          ================================================= */}

          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div
                className="
                  flex
                  min-h-[180px]
                  items-center
                  justify-center
                "
              >
                <Loader2
                  className="animate-spin text-gray-400"
                  size={24}
                />
              </div>
            ) : notifications.length === 0 ? (
              <div
                className="
                  flex
                  min-h-[180px]
                  flex-col
                  items-center
                  justify-center
                  px-6
                  text-center
                "
              >
                <div
                  className="
                    mb-3
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-full
                    bg-gray-100
                  "
                >
                  <Bell
                    size={22}
                    className="text-gray-400"
                  />
                </div>

                <p className="text-sm font-medium text-gray-700">
                  No notifications
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  New complaint updates will appear here.
                </p>
              </div>
            ) : (
              notifications.map(
                (notification) => (
                  <button
                    key={notification._id}
                    type="button"
                    onClick={() =>
                      handleNotificationClick(
                        notification
                      )
                    }
                    className={`
                      flex
                      w-full
                      gap-3
                      border-b
                      border-gray-100
                      px-4
                      py-3
                      text-left
                      transition
                      hover:bg-gray-50
                      ${
                        !notification.isRead
                          ? "bg-blue-50/60"
                          : "bg-white"
                      }
                    `}
                  >
                    {/* =====================================
                        ICON
                    ===================================== */}

                    <div
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-gray-100
                        text-base
                      "
                    >
                      {getNotificationIcon(
                        notification.type
                      )}
                    </div>

                    {/* =====================================
                        CONTENT
                    ===================================== */}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`
                            text-sm
                            ${
                              notification.isRead
                                ? "font-medium text-gray-700"
                                : "font-semibold text-gray-900"
                            }
                          `}
                        >
                          {notification.title}
                        </p>

                        {!notification.isRead && (
                          <span
                            className="
                              mt-1
                              h-2
                              w-2
                              shrink-0
                              rounded-full
                              bg-blue-600
                            "
                          />
                        )}
                      </div>

                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">
                        {notification.message}
                      </p>

                      <p className="mt-1 text-[11px] text-gray-400">
                        {formatTime(
                          notification.createdAt
                        )}
                      </p>
                    </div>
                  </button>
                )
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

