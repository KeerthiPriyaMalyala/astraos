const mongoose = require("mongoose");

// =====================================================
// 🏆 REWARD TRANSACTION SCHEMA
// =====================================================

const rewardTransactionSchema = new mongoose.Schema(
  {
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      default: null,
      index: true,
    },

    action: {
      type: String,
      enum: [
        "COMPLAINT_SUBMITTED",
        "AI_ANALYSIS_COMPLETED",
        "COMPLAINT_VERIFIED",
        "SERVICE_RATED",
        "REOPENED_COMPLAINT_RESOLVED",
        "BADGE_EARNED",
        "BONUS",
      ],
      required: true,
    },

    points: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

// =====================================================
// 🏅 CITIZEN REWARD PROFILE
// =====================================================

const rewardSchema = new mongoose.Schema(
  {
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // =================================================
    // ⭐ POINTS
    // =================================================

    totalPoints: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =================================================
    // 🏆 LEVEL
    // =================================================

    level: {
      type: String,
      enum: [
        "CIVIC_STARTER",
        "CIVIC_CONTRIBUTOR",
        "COMMUNITY_CHAMPION",
        "CIVIC_GUARDIAN",
        "CIVIC_LEADER",
      ],
      default: "CIVIC_STARTER",
    },

    // =================================================
    // 🔥 STREAK
    // =================================================

    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },

    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastActivityAt: {
      type: Date,
      default: null,
    },

    // =================================================
    // 🥇 BADGES
    // =================================================

    badges: [
      {
        type: String,
        enum: [
          "FIRST_REPORT",
          "CIVIC_PARTICIPANT",
          "ISSUE_VERIFIER",
          "FEEDBACK_CHAMPION",
          "CIVIC_STREAK",
          "COMMUNITY_CHAMPION",
          "CIVIC_GUARDIAN",
          "CIVIC_LEADER",
        ],
      },
    ],

    // =================================================
    // 📜 REWARD HISTORY
    // =================================================

    transactions: {
      type: [rewardTransactionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// =====================================================
// 📊 INDEX
// =====================================================

rewardSchema.index({
  citizen: 1,
  totalPoints: -1,
});

// =====================================================
// EXPORT
// =====================================================

const Reward = mongoose.model("Reward", rewardSchema);

module.exports = Reward;