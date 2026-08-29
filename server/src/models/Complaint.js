const mongoose = require("mongoose");

// =====================================================
// TIMELINE SCHEMA
// =====================================================

const timelineSchema = new mongoose.Schema(
  {
    status: {
      type: String,

      enum: [
        "CREATED",
        "AI_ANALYZING",
        "AI_ANALYZED",
        "AI_ANALYSIS_FAILED",
        "PRIORITY_ASSIGNED",
        "PENDING_ASSIGNMENT",
        "DEPARTMENT_ASSIGNED",
        "OFFICER_ASSIGNED",
        "ACCEPTED",
        "WORK_STARTED",
        "WORK_50_PERCENT",
        "RESOLVED",
        "CITIZEN_VERIFIED",
        "CLOSED",
        "REOPENED",
        "DUPLICATE_DETECTED",
        "RATED",
      ],

      required: true,
    },

    message: {
      type: String,
      trim: true,
    },

    actor: {
      type: String,

      enum: [
        "CITIZEN",
        "AI",
        "OFFICER",
        "DEPARTMENT",
        "DEPARTMENT_HEAD",
        "ADMIN",
        "SYSTEM",
      ],

      default: "SYSTEM",
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },

  {
    _id: false,
  }
);

// =====================================================
// VISION DETECTION SCHEMA
// =====================================================

const visionDetectionSchema =
  new mongoose.Schema(
    {
      object: {
        type: String,
        trim: true,
      },

      confidence: {
        type: Number,
        min: 0,
        max: 1,
      },

      severity: {
        type: String,

        enum: [
          "NONE",
          "LOW",
          "MEDIUM",
          "HIGH",
          "CRITICAL",
        ],
      },

      bounding_box: {
        x1: {
          type: Number,
        },

        y1: {
          type: Number,
        },

        x2: {
          type: Number,
        },

        y2: {
          type: Number,
        },
      },
    },

    {
      _id: false,
    }
  );

// =====================================================
// COMPLAINT SCHEMA
// =====================================================

const complaintSchema = new mongoose.Schema(
  {
    // =================================================
    // 👤 CITIZEN
    // =================================================

    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // =================================================
    // 📝 BASIC COMPLAINT INFORMATION
    // =================================================

    title: {
      type: String,

      required: [
        true,
        "Complaint title is required",
      ],

      trim: true,

      minlength: [
        3,
        "Title must be at least 3 characters",
      ],

      maxlength: [
        200,
        "Title cannot exceed 200 characters",
      ],
    },

    description: {
      type: String,

      required: [
        true,
        "Complaint description is required",
      ],

      trim: true,

      minlength: [
        10,
        "Description must be at least 10 characters",
      ],

      maxlength: [
        5000,
        "Description cannot exceed 5000 characters",
      ],
    },

    // =================================================
    // 🏷️ CATEGORY
    // =================================================

    category: {
      type: String,

      enum: [
        "ROAD",
        "WATER",
        "ELECTRICITY",
        "TRAFFIC",
        "GARBAGE",
        "ENVIRONMENT",
        "ANIMALS",
        "INFRASTRUCTURE",
        "CONSTRUCTION",
        "EMERGENCY",
      ],

      required: true,
    },

    // =================================================
    // 📸 MEDIA
    // =================================================

    image: {
      type: String,
      default: "",
    },

    video: {
      type: String,
      default: "",
    },

    // =================================================
    // 📍 LOCATION
    // =================================================

    location: {
      latitude: {
        type: Number,
      },

      longitude: {
        type: Number,
      },

      address: {
        type: String,
        trim: true,
      },

      landmark: {
        type: String,
        trim: true,
      },
    },

    // =================================================
    // 🤖 GROQ / TEXT AI ANALYSIS
    // =================================================

    aiAnalysis: {
      category: {
        type: String,
        default: "",
      },

      department: {
        type: String,
        default: "",
      },

      summary: {
        type: String,
        default: "",
      },

      severity: {
        type: Number,
        min: 0,
        max: 10,
        default: null,
      },

      confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: null,
      },

      suggestedAction: {
        type: String,
        default: "",
      },

      model: {
        type: String,
        default: "",
      },

      analyzedAt: {
        type: Date,
      },
    },

    // =================================================
    // 👁️ VISION AI / YOLO ANALYSIS
    // =================================================

    visionAnalysis: {
      detections: {
        type: [visionDetectionSchema],

        default: [],
      },

      detectionCount: {
        type: Number,
        default: 0,
        min: 0,
      },

      overallSeverity: {
        type: String,

        enum: [
          "NONE",
          "LOW",
          "MEDIUM",
          "HIGH",
          "CRITICAL",
          null,
        ],

        default: null,
      },

      annotatedImage: {
        type: String,
        default: "",
      },

      analyzedAt: {
        type: Date,
        default: null,
      },
    },

    // =================================================
    // 🎯 PRIORITY ENGINE
    // =================================================

    priority: {
      level: {
        type: String,

        enum: [
          "LOW",
          "MEDIUM",
          "HIGH",
          "CRITICAL",
        ],

        default: "LOW",
      },

      score: {
        type: Number,

        min: 0,
        max: 100,

        default: 0,
      },

      reason: {
        type: String,
        default: "",
      },
    },

    // =================================================
    // 🏢 DEPARTMENT
    // =================================================

    department: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Department",

      default: null,
    },

    // =================================================
    // 👮 ASSIGNED OFFICER
    // =================================================

    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      default: null,
    },

    // =================================================
    // 🔄 COMPLAINT STATUS
    // =================================================

    status: {
      type: String,

      enum: [
        "SUBMITTED",
        "AI_ANALYZING",
        "PENDING_ASSIGNMENT",
        "ASSIGNED",
        "ACCEPTED",
        "WORK_STARTED",
        "WORK_50_PERCENT",
        "RESOLVED",
        "CITIZEN_VERIFIED",
        "CLOSED",
        "REOPENED",
      ],

      default: "SUBMITTED",

      index: true,
    },

    // =================================================
    // 🔄 TIMELINE
    // =================================================

    timeline: {
      type: [timelineSchema],

      default: [],
    },

    // =================================================
    // 🔁 DUPLICATE DETECTION
    // =================================================

    duplicateInfo: {
      isDuplicate: {
        type: Boolean,

        default: false,
      },

      duplicateOf: {
        type: mongoose.Schema.Types.ObjectId,

        ref: "Complaint",

        default: null,
      },

      similarityScore: {
        type: Number,

        min: 0,
        max: 1,

        default: null,
      },
    },

    // =================================================
    // ⭐ CITIZEN SERVICE RATING
    // =================================================

    serviceRating: {
      overall: {
        type: Number,

        min: 1,
        max: 5,

        default: null,
      },

      resolutionQuality: {
        type: Number,

        min: 1,
        max: 5,

        default: null,
      },

      officerBehaviour: {
        type: Number,

        min: 1,
        max: 5,

        default: null,
      },

      timeTaken: {
        type: Number,

        min: 1,
        max: 5,

        default: null,
      },

      feedback: {
        type: String,

        trim: true,

        maxlength: 1000,

        default: "",
      },

      submittedAt: {
        type: Date,

        default: null,
      },
    },
  },

  {
    timestamps: true,
  }
);

// =====================================================
// 📊 INDEXES
// =====================================================

complaintSchema.index({
  "location.latitude": 1,
  "location.longitude": 1,
});

complaintSchema.index({
  category: 1,
  status: 1,
});

complaintSchema.index({
  "priority.level": 1,
  status: 1,
});

// =====================================================
// EXPORT
// =====================================================

const Complaint = mongoose.model(
  "Complaint",
  complaintSchema
);

module.exports = Complaint;