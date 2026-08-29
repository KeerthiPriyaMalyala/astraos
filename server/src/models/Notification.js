const mongoose = require("mongoose");

// =====================================================
// ASTRAOS NOTIFICATION SCHEMA
// =====================================================

const notificationSchema = new mongoose.Schema(
  {
    // =================================================
    // 👤 USER WHO RECEIVES THE NOTIFICATION
    // =================================================

    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // =================================================
    // 🔔 NOTIFICATION TYPE
    // =================================================

    type: {
      type: String,

      enum: [
        "COMPLAINT_CREATED",
        "AI_ANALYZED",
        "PRIORITY_ASSIGNED",
        "DEPARTMENT_ASSIGNED",
        "OFFICER_ASSIGNED",
        "COMPLAINT_ACCEPTED",
        "WORK_STARTED",
        "WORK_PROGRESS",
        "COMPLAINT_RESOLVED",
        "CITIZEN_VERIFIED",
        "COMPLAINT_CLOSED",
        "COMPLAINT_REOPENED",
        "DUPLICATE_DETECTED",
        "SYSTEM",
      ],

      required: true,
    },

    // =================================================
    // 📝 TITLE
    // =================================================

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    // =================================================
    // 💬 MESSAGE
    // =================================================

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    // =================================================
    // 🔗 RELATED COMPLAINT
    // =================================================

    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      default: null,
      index: true,
    },

    // =================================================
    // 📌 EXTRA DATA
    // =================================================

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // =================================================
    // 👁️ READ STATUS
    // =================================================

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

// =====================================================
// 📊 INDEX
// =====================================================

notificationSchema.index({
  recipient: 1,
  isRead: 1,
  createdAt: -1,
});

notificationSchema.index({
  recipient: 1,
  createdAt: -1,
});

// =====================================================
// EXPORT
// =====================================================

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

module.exports = Notification;