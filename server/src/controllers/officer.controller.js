const Complaint = require("../models/Complaint");
const User = require("../models/User");

const {
  notifyCitizen,
} = require("../services/notification.service");

const {
  sendComplaintResolvedEmail,
} = require("../services/email.service");

// =====================================================
// ACCEPT ASSIGNED COMPLAINT
// POST /api/officer/complaints/:complaintId/accept
// OFFICER ONLY
// =====================================================

const acceptComplaint = async (req, res, next) => {
  try {
    const { complaintId } = req.params;

    // =================================================
    // 1. FIND COMPLAINT
    // =================================================

    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    // =================================================
    // 2. CHECK ASSIGNED OFFICER
    // =================================================

    if (!complaint.assignedOfficer) {
      return res.status(400).json({
        success: false,
        message:
          "This complaint has not been assigned to an officer",
      });
    }

    // =================================================
    // 3. ONLY ASSIGNED OFFICER CAN ACCEPT
    // =================================================

    if (
      complaint.assignedOfficer.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not assigned to this complaint",
      });
    }

    // =================================================
    // 4. CHECK CURRENT STATUS
    // =================================================

    if (complaint.status !== "ASSIGNED") {
      return res.status(400).json({
        success: false,
        message:
          `Complaint cannot be accepted from ${complaint.status} status`,
      });
    }

    // =================================================
    // 5. UPDATE STATUS
    // =================================================

    complaint.status = "ACCEPTED";

    // =================================================
    // 6. ADD TIMELINE
    // =================================================

    complaint.timeline.push({
      status: "ACCEPTED",
      message:
        "Complaint accepted by assigned officer",
      actor: "OFFICER",
      timestamp: new Date(),
    });

    // =================================================
    // 7. SAVE
    // =================================================

    await complaint.save();

    // =================================================
    // 🔔 NOTIFICATION — CITIZEN
    // =================================================

    await notifyCitizen({
      complaint,

      type:
        "COMPLAINT_ACCEPTED",

      title:
        "Complaint Accepted",

      message:
        `Your complaint "${complaint.title}" has been accepted by the assigned officer.`,

      metadata: {
        status:
          complaint.status,

        officerId:
          req.user._id,
      },
    });

    // =================================================
    // 8. RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,
      message:
        "Complaint accepted successfully",
      data: {
        complaint,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// START WORK ON COMPLAINT
// POST /api/officer/complaints/:complaintId/start
// OFFICER ONLY
// =====================================================

const startComplaintWork = async (
  req,
  res,
  next
) => {
  try {
    const { complaintId } = req.params;

    // =================================================
    // 1. FIND COMPLAINT
    // =================================================

    const complaint =
      await Complaint.findById(
        complaintId
      );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message:
          "Complaint not found",
      });
    }

    // =================================================
    // 2. VERIFY ASSIGNED OFFICER
    // =================================================

    if (
      !complaint.assignedOfficer ||
      complaint.assignedOfficer.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "This complaint is not assigned to you",
      });
    }

    // =================================================
    // 3. CHECK STATUS
    // =================================================

    if (
      complaint.status !==
      "ACCEPTED"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Complaint must be accepted before starting work",
      });
    }

    // =================================================
    // 4. UPDATE STATUS
    // =================================================

    complaint.status =
      "WORK_STARTED";

    // =================================================
    // 5. ADD TIMELINE
    // =================================================

    complaint.timeline.push({
      status:
        "WORK_STARTED",

      message:
        "Work started by assigned officer",

      actor: "OFFICER",

      timestamp: new Date(),
    });

    // =================================================
    // 6. SAVE
    // =================================================

    await complaint.save();

    // =================================================
    // 🔔 NOTIFICATION — CITIZEN
    // =================================================

    await notifyCitizen({
      complaint,

      type:
        "WORK_STARTED",

      title:
        "Work Started",

      message:
        `Work has started on your complaint "${complaint.title}".`,

      metadata: {
        status:
          complaint.status,
      },
    });

    // =================================================
    // 7. RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      message:
        "Complaint work started successfully",

      data: {
        complaint,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// UPDATE COMPLAINT PROGRESS TO 50%
// POST /api/officer/complaints/:complaintId/progress
// OFFICER ONLY
// =====================================================

const updateComplaintProgress = async (
  req,
  res,
  next
) => {
  try {
    const {
      complaintId,
    } = req.params;

    const {
      progress,
    } = req.body;

    // =================================================
    // 1. VALIDATE PROGRESS
    // =================================================

    if (Number(progress) !== 50) {
      return res.status(400).json({
        success: false,
        message:
          "Only 50% progress can be reported at this stage",
      });
    }

    // =================================================
    // 2. FIND COMPLAINT
    // =================================================

    const complaint =
      await Complaint.findById(
        complaintId
      );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message:
          "Complaint not found",
      });
    }

    // =================================================
    // 3. VERIFY ASSIGNED OFFICER
    // =================================================

    if (
      !complaint.assignedOfficer ||
      complaint.assignedOfficer.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "This complaint is not assigned to you",
      });
    }

    // =================================================
    // 4. CHECK CURRENT STATUS
    // =================================================

    if (
      complaint.status !==
      "WORK_STARTED"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Work must be started before reporting 50% progress",
      });
    }

    // =================================================
    // 5. UPDATE STATUS
    // =================================================

    complaint.status =
      "WORK_50_PERCENT";

    // =================================================
    // 6. ADD TIMELINE ENTRY
    // =================================================

    complaint.timeline.push({
      status:
        "WORK_50_PERCENT",

      message:
        "Work progress reached 50%",

      actor: "OFFICER",

      timestamp: new Date(),
    });

    // =================================================
    // 7. SAVE
    // =================================================

    await complaint.save();

    // =================================================
    // 🔔 NOTIFICATION — CITIZEN
    // =================================================

    await notifyCitizen({
      complaint,

      type:
        "WORK_PROGRESS",

      title:
        "Work Progress Updated",

      message:
        `Work on your complaint "${complaint.title}" has reached 50% progress.`,

      metadata: {
        progress: 50,

        status:
          complaint.status,
      },
    });

    // =================================================
    // 8. RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      message:
        "Complaint progress updated to 50%",

      data: {
        complaint,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// RESOLVE COMPLAINT
// POST /api/officer/complaints/:complaintId/resolve
// OFFICER ONLY
// =====================================================

const resolveComplaint = async (
  req,
  res,
  next
) => {
  try {
    const {
      complaintId,
    } = req.params;

    // =================================================
    // 1. FIND COMPLAINT
    // =================================================

    const complaint =
      await Complaint.findById(
        complaintId
      );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message:
          "Complaint not found",
      });
    }

    // =================================================
    // 2. VERIFY ASSIGNED OFFICER
    // =================================================

    if (
      !complaint.assignedOfficer ||
      complaint.assignedOfficer.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "This complaint is not assigned to you",
      });
    }

    // =================================================
    // 3. CHECK CURRENT STATUS
    // =================================================

    if (
      complaint.status !==
      "WORK_50_PERCENT"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Complaint must be at 50% progress before resolving",
      });
    }

    // =================================================
    // 4. UPDATE STATUS
    // =================================================

    complaint.status =
      "RESOLVED";

    // =================================================
    // 5. ADD TIMELINE ENTRY
    // =================================================

    complaint.timeline.push({
      status:
        "RESOLVED",

      message:
        "Complaint resolved by assigned officer",

      actor: "OFFICER",

      timestamp: new Date(),
    });

    // =================================================
    // 6. NOTIFY CITIZEN
    // =================================================

    await notifyCitizen({
      complaint,

      type:
        "COMPLAINT_RESOLVED",

      title:
        "Complaint Resolved",

      message:
        `Your complaint "${complaint.title}" has been marked as resolved. Please verify the resolution.`,

      metadata: {
        status:
          complaint.status,
      },
    });

    // =================================================
    // 7. SAVE COMPLAINT
    // =================================================

    await complaint.save();

    // =================================================
    // 8. GET CITIZEN DETAILS
    // =================================================

    const citizen =
      await User.findById(
        complaint.citizen
      ).select(
        "name email"
      );

    // =================================================
    // 9. SEND RESOLUTION EMAIL
    // =================================================

    if (
      citizen &&
      citizen.email
    ) {
      try {
        await sendComplaintResolvedEmail({
          citizenEmail:
            citizen.email,

          citizenName:
            citizen.name,

          complaintId:
            complaint._id.toString(),

          complaintTitle:
            complaint.title,
        });
      } catch (emailError) {
        // =================================================
        // EMAIL FAILURE SHOULD NOT FAIL RESOLUTION
        // =================================================

        console.error(
          "⚠️ [AstraOS Email] Failed to send resolution email:",
          emailError.message
        );
      }
    }

    // =================================================
    // 10. RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      message:
        "Complaint resolved successfully. Citizen has been notified to verify the resolution.",

      data: {
        complaint,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET MY ASSIGNED COMPLAINTS
// GET /api/officer/complaints
// OFFICER ONLY
// =====================================================

const getMyAssignedComplaints = async (
  req,
  res,
  next
) => {
  try {
    // =================================================
    // 1. FIND COMPLAINTS ASSIGNED TO LOGGED-IN OFFICER
    // =================================================

    const complaints =
      await Complaint.find({
        assignedOfficer:
          req.user._id,
      })
        .populate(
          "citizen",
          "name email phoneNumber"
        )
        .populate(
          "department",
          "name code"
        )
        .sort({
          "priority.score": -1,
          createdAt: -1,
        });

    // =================================================
    // 2. RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      message:
        "Assigned complaints retrieved successfully",

      data: {
        complaints,

        count:
          complaints.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET SINGLE ASSIGNED COMPLAINT
// GET /api/officer/complaints/:complaintId
// OFFICER ONLY
// =====================================================

const getAssignedComplaintById = async (
  req,
  res,
  next
) => {
  try {
    const {
      complaintId,
    } = req.params;

    // =================================================
    // 1. FIND COMPLAINT
    // =================================================

    const complaint =
      await Complaint.findById(
        complaintId
      )
        .populate(
          "citizen",
          "name email phoneNumber"
        )
        .populate(
          "department",
          "name code"
        )
        .populate(
          "assignedOfficer",
          "name email phoneNumber"
        );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message:
          "Complaint not found",
      });
    }

    // =================================================
    // 2. VERIFY ASSIGNED OFFICER
    // =================================================

    if (
      !complaint.assignedOfficer ||
      complaint.assignedOfficer._id.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "This complaint is not assigned to you",
      });
    }

    // =================================================
    // 3. RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      message:
        "Assigned complaint retrieved successfully",

      data: {
        complaint,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  acceptComplaint,

  startComplaintWork,

  updateComplaintProgress,

  resolveComplaint,

  getMyAssignedComplaints,

  getAssignedComplaintById,
};