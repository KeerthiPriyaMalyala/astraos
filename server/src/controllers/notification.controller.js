const Notification = require("../models/Notification");

const {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../services/notification.service");

// =====================================================
// GET MY NOTIFICATIONS
// =====================================================

const getMyNotifications = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const notifications =
      await Notification.find({
        recipient: userId,
      })
        .populate(
          "complaint",
          "title status priority"
        )
        .sort({
          createdAt: -1,
        })
        .limit(100);

    const unreadCount =
      await Notification.countDocuments({
        recipient: userId,
        isRead: false,
      });

    res.status(200).json({
      success: true,

      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET UNREAD COUNT
// =====================================================

const getUnreadNotificationCount = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const unreadCount =
      await Notification.countDocuments({
        recipient: userId,
        isRead: false,
      });

    res.status(200).json({
      success: true,

      data: {
        unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// MARK ONE AS READ
// =====================================================

const readNotification = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const notification =
      await markNotificationAsRead({
        notificationId:
          req.params.id,

        userId,
      });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message:
          "Notification not found.",
      });
    }

    res.status(200).json({
      success: true,

      message:
        "Notification marked as read.",

      data: {
        notification,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// MARK ALL AS READ
// =====================================================

const readAllNotifications = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    await markAllNotificationsAsRead(
      userId
    );

    res.status(200).json({
      success: true,

      message:
        "All notifications marked as read.",
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getMyNotifications,
  getUnreadNotificationCount,
  readNotification,
  readAllNotifications,
};