const Notification = require("../models/Notification");
const User = require("../models/User");

// =====================================================
// ASTRAOS NOTIFICATION SERVICE
// =====================================================

// =====================================================
// CREATE NOTIFICATION
// =====================================================

const createNotification = async ({
  recipient,
  type,
  title,
  message,
  complaint = null,
  metadata = {},
}) => {
  try {
    if (!recipient) {
      console.log(
        "⚠️ [AstraOS Notification] Recipient not provided"
      );

      return null;
    }

    const notification =
      await Notification.create({
        recipient,
        type,
        title,
        message,
        complaint,
        metadata,
      });

    console.log(
      `🔔 [AstraOS Notification] Created notification for ${recipient}`
    );

    return notification;
  } catch (error) {
    console.error(
      "❌ [AstraOS Notification] Creation failed:",
      error
    );

    return null;
  }
};

// =====================================================
// CREATE COMPLAINT NOTIFICATION
// =====================================================

const notifyComplaintEvent = async ({
  recipient,
  type,
  complaint,
  title,
  message,
  metadata = {},
}) => {
  if (!recipient) {
    return null;
  }

  return createNotification({
    recipient,
    type,
    title,
    message,
    complaint: complaint?._id || complaint,
    metadata,
  });
};

// =====================================================
// NOTIFY CITIZEN
// =====================================================

const notifyCitizen = async ({
  complaint,
  type,
  title,
  message,
  metadata = {},
}) => {
  if (!complaint?.citizen) {
    console.log(
      "⚠️ [AstraOS Notification] Complaint has no citizen"
    );

    return null;
  }

  return notifyComplaintEvent({
    recipient: complaint.citizen,
    type,
    complaint,
    title,
    message,
    metadata,
  });
};

// =====================================================
// NOTIFY OFFICER
// =====================================================

const notifyOfficer = async ({
  complaint,
  type,
  title,
  message,
  metadata = {},
}) => {
  if (!complaint?.assignedOfficer) {
    console.log(
      "⚠️ [AstraOS Notification] Complaint has no assigned officer"
    );

    return null;
  }

  return notifyComplaintEvent({
    recipient: complaint.assignedOfficer,
    type,
    complaint,
    title,
    message,
    metadata,
  });
};

// =====================================================
// NOTIFY DEPARTMENT
// =====================================================

const notifyDepartmentUsers = async ({
  complaint,
  departmentId,
  type,
  title,
  message,
  metadata = {},
}) => {
  if (!departmentId) {
    return [];
  }

  const departmentUsers = await User.find({
    department: departmentId,
    isActive: true,
    role: {
      $in: [
        "OFFICER",
        "DEPARTMENT_HEAD",
      ],
    },
  }).select("_id");

  const notifications = [];

  for (const user of departmentUsers) {
    const notification =
      await notifyComplaintEvent({
        recipient: user._id,
        type,
        complaint,
        title,
        message,
        metadata,
      });

    if (notification) {
      notifications.push(notification);
    }
  }

  return notifications;
};

// =====================================================
// MARK AS READ
// =====================================================

const markNotificationAsRead = async ({
  notificationId,
  userId,
}) => {
  const notification =
    await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        recipient: userId,
      },

      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      },

      {
        new: true,
      }
    );

  return notification;
};

// =====================================================
// MARK ALL AS READ
// =====================================================

const markAllNotificationsAsRead = async (
  userId
) => {
  const result =
    await Notification.updateMany(
      {
        recipient: userId,
        isRead: false,
      },

      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

  return result;
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createNotification,
  notifyComplaintEvent,
  notifyCitizen,
  notifyOfficer,
  notifyDepartmentUsers,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};