





const Complaint = require("../models/Complaint");

const {
  analyzeComplaint,
} = require("../services/ai/groq.service");

const {
  analyzeImageWithPythonAI,
} = require("../services/ai/pythonAI.service");

const {
  calculatePriority,
} = require("../services/priority.service");

const {
  findDepartmentByName,
} = require("../services/department.service");

const {
  detectDuplicateComplaint,
} = require("../services/duplicate.service");

const {
  addRewardPoints,
} = require("../services/reward.service");

const {
  notifyCitizen,
  notifyOfficer,
  notifyDepartmentUsers,
} = require("../services/notification.service");

const path = require("path");

// =====================================================
// SANITIZE COMPLAINT
// =====================================================

const sanitizeComplaint = (complaint) => {
  return {
    id: complaint._id,
    citizen: complaint.citizen,
    title: complaint.title,
    description: complaint.description,
    category: complaint.category,
    image: complaint.image,
    video: complaint.video,
    location: complaint.location,
    aiAnalysis: complaint.aiAnalysis,
    // Vision / YOLO AI result
    visionAnalysis: complaint.visionAnalysis,
    priority: complaint.priority,
    department: complaint.department,
    assignedOfficer: complaint.assignedOfficer,
    status: complaint.status,
    timeline: complaint.timeline,
    duplicateInfo: complaint.duplicateInfo,
    serviceRating: complaint.serviceRating,
    createdAt: complaint.createdAt,
    updatedAt: complaint.updatedAt,
  };
};

// =====================================================
// CREATE COMPLAINT
// POST /api/complaints
// CITIZEN ONLY
// =====================================================

const createComplaint = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      image,
      video,
      location,
    } = req.body;

    // =================================================
    // BASIC VALIDATION
    // =================================================

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, and category are required",
      });
    }

    // =================================================
    // IMAGE FROM MULTER
    // =================================================

    let complaintImage = image || "";

    if (req.file) {
      complaintImage = path
        .join(
          "uploads",
          "complaints",
          req.file.filename
        )
        .replace(/\\/g, "/");

      console.log(
        "📸 [AstraOS Upload] Complaint image stored:",
        req.file.path
      );

      console.log(
        "📸 [AstraOS Upload] Complaint image URL:",
        complaintImage
      );
    } else {
      console.log(
        "📸 [AstraOS Upload] No complaint image uploaded."
      );
    }

    // =================================================
    // SAFE LOCATION PARSING
    // =================================================

    let parsedLocation = {};

    if (typeof location === "string") {
      try {
        parsedLocation = JSON.parse(location);
      } catch (locationError) {
        console.warn(
          "[AstraOS Location] Invalid JSON location received. Using empty location."
        );

        parsedLocation = {};
      }
    } else if (
      location &&
      typeof location === "object"
    ) {
      parsedLocation = location;
    }

    // =================================================
    // CREATE INITIAL COMPLAINT
    // =================================================

    const complaint = await Complaint.create({
      citizen: req.user._id,
      title: title.trim(),
      description: description.trim(),
      category,
      image: complaintImage,
      video: video || "",
      location: parsedLocation,
      status: "SUBMITTED",
      timeline: [
        {
          status: "CREATED",
          message:
            "Complaint submitted successfully",
          actor: "CITIZEN",
          timestamp: new Date(),
        },
      ],
    });

    // =================================================
    // 🏆 REWARD — COMPLAINT SUBMITTED
    // =================================================
    // Award points only AFTER the complaint has been
    // successfully created.
    //
    // The reward service already handles:
    // - +10 points
    // - FIRST_REPORT badge
    // - duplicate reward protection
    // =================================================

    try {
      const rewardResult = await addRewardPoints({
        citizenId: req.user._id,
        action: "COMPLAINT_SUBMITTED",
        complaintId: complaint._id,
      });

      console.log(
        `🏆 [AstraOS Rewards] Complaint ${complaint._id} → +${rewardResult.pointsAdded || 10} Civic Points`
      );

      if (
        Array.isArray(rewardResult.earnedBadges) &&
        rewardResult.earnedBadges.length > 0
      ) {
        console.log(
          `🎖️ [AstraOS Rewards] New badge(s): ${rewardResult.earnedBadges.join(
            ", "
          )}`
        );
      }
    } catch (rewardError) {
      // Reward failure must NEVER prevent the complaint
      // from being successfully created.
      console.error(
        "[AstraOS Rewards] Failed to award complaint submission reward:",
        rewardError.message
      );
    }

    // =================================================
    // 🔔 NOTIFICATION — COMPLAINT CREATED
    // =================================================

    await notifyCitizen({
      complaint,
      type: "COMPLAINT_CREATED",
      title: "Complaint Submitted",
      message:
        `Your complaint "${complaint.title}" has been submitted successfully.`,
      metadata: {
        status: complaint.status,
      },
    });

    // =================================================
    // RUN AI + VISION + PRIORITY + DUPLICATE + ROUTING
    // =================================================

    try {
      console.log(
        `🤖 [AstraOS AI] Analyzing complaint ${complaint._id}`
      );

      // =================================================
      // AI TEXT ANALYSIS
      // =================================================

      const aiResult = await analyzeComplaint({
        title: complaint.title,
        description:
          complaint.description,
        category:
          complaint.category,
        location:
          complaint.location,
      });

      // =================================================
      // STORE TEXT AI RESULT
      // =================================================

      complaint.aiAnalysis = {
        category:
          aiResult.category || "",
        department:
          aiResult.department || "",
        summary:
          aiResult.summary || "",
        severity:
          aiResult.severity !== undefined
            ? aiResult.severity
            : null,
        confidence:
          aiResult.confidence !== undefined
            ? aiResult.confidence
            : null,
        suggestedAction:
          aiResult.suggestedAction || "",
        model:
          aiResult.model || "groq",
        analyzedAt:
          new Date(),
      };

      // =================================================
      // AI TIMELINE
      // =================================================

      complaint.timeline.push({
        status: "AI_ANALYZED",
        message:
          `AI analysis completed. Recommended department: ${
            aiResult.department ||
            "Not determined"
          }`,
        actor: "AI",
        timestamp: new Date(),
      });

      // =================================================
      // VISION AI / YOLO
      // =================================================

      if (req.file) {
        try {
          console.log(
            `👁️ [AstraOS Vision] Analyzing image for complaint ${complaint._id}`
          );

          console.log(
            "👁️ [AstraOS Vision] Image path:",
            req.file.path
          );

          // =================================================
          // SEND IMAGE TO PYTHON YOLO
          // =================================================

          const visionResult =
            await analyzeImageWithPythonAI(
              req.file.path,
              req.file.originalname
            );

          console.log(
            "👁️ [AstraOS Vision] Python response received"
          );

          console.log(
            "👁️ [AstraOS Vision] Detection count:",
            visionResult.detection_count
          );

          console.log(
            "👁️ [AstraOS Vision] Overall severity:",
            visionResult.overall_severity
          );

          // =================================================
          // STORE VISION RESULT
          // =================================================

          complaint.visionAnalysis = {
            detectionCount:
              visionResult.detection_count || 0,

            overallSeverity:
              visionResult.overall_severity ||
              null,

            annotatedImage:
              visionResult.annotated_image ||
              "",

            analyzedAt:
              new Date(),

            detections:
              Array.isArray(
                visionResult.detections
              )
                ? visionResult.detections.map(
                    (detection) => ({
                      object:
                        detection.object ||
                        "",

                      confidence:
                        detection.confidence !==
                        undefined
                          ? detection.confidence
                          : null,

                      severity:
                        detection.severity ||
                        null,

                      boundingBox:
                        detection.bounding_box ||
                        {},
                    })
                  )
                : [],
          };

          // =================================================
          // VISION TIMELINE
          // =================================================

          complaint.timeline.push({
            status: "AI_ANALYZED",
            message:
              `Vision AI detected ${
                visionResult.detection_count ||
                0
              } civic issue(s). Overall severity: ${
                visionResult.overall_severity ||
                "NONE"
              }`,
            actor: "AI",
            timestamp: new Date(),
          });

          // =================================================
          // 🔔 NOTIFICATION — AI ANALYZED
          // =================================================

          await notifyCitizen({
            complaint,
            type: "AI_ANALYZED",
            title: "Complaint Analyzed",
            message:
              `AstraOS AI has analyzed your complaint and identified ${
                aiResult.department ||
                "the appropriate department"
              } for further processing.`,
            metadata: {
              category:
                aiResult.category ||
                complaint.category,

              department:
                aiResult.department || "",

              severity:
                aiResult.severity ?? null,

              confidence:
                aiResult.confidence ?? null,
            },
          });

          console.log(
            `👁️ [AstraOS Vision] ${
              complaint._id
            } → ${
              visionResult.detection_count ||
              0
            } detection(s)`
          );

          // =================================================
          // LOG EACH DETECTION
          // =================================================

          if (
            Array.isArray(
              visionResult.detections
            )
          ) {
            visionResult.detections.forEach(
              (detection) => {
                console.log(
                  `👁️ [AstraOS Vision] ${
                    detection.object
                  } → ${
                    detection.confidence
                  } → ${
                    detection.severity
                  }`
                );
              }
            );
          }
        } catch (visionError) {
          // =================================================
          // VISION FAILURE SHOULD NOT KILL COMPLAINT
          // =================================================

          console.error(
            "[AstraOS Vision] Vision analysis failed:",
            visionError.message
          );

          complaint.visionAnalysis = {
            detectionCount: 0,
            overallSeverity: null,
            annotatedImage: "",
            analyzedAt:
              new Date(),
            detections: [],
          };

          console.log(
            "[AstraOS Vision] Continuing complaint processing without Vision AI."
          );
        }
      } else {
        // =================================================
        // NO IMAGE
        // =================================================

        console.log(
          "👁️ [AstraOS Vision] No complaint image uploaded. Skipping Vision AI."
        );

        complaint.visionAnalysis = {
          detectionCount: 0,
          overallSeverity: null,
          annotatedImage: "",
          analyzedAt: null,
          detections: [],
        };
      }

      // =================================================
      // CALCULATE PRIORITY
      // =================================================

      console.log(
        `🎯 [AstraOS Priority] Calculating priority for ${complaint._id}`
      );

      const priorityResult =
        calculatePriority(complaint);

      // =================================================
      // STORE PRIORITY
      // =================================================

      complaint.priority = {
        level:
          priorityResult.level,

        score:
          priorityResult.score,

        reason:
          priorityResult.reason,
      };

      // =================================================
      // PRIORITY TIMELINE
      // =================================================

      complaint.timeline.push({
        status:
          "PRIORITY_ASSIGNED",

        message:
          `Priority assigned: ${
            priorityResult.level
          } (${
            priorityResult.score
          }/100)`,

        actor: "SYSTEM",
        timestamp: new Date(),
      });

      // =================================================
      // 🔔 NOTIFICATION — PRIORITY ASSIGNED
      // =================================================

      await notifyCitizen({
        complaint,
        type:
          "PRIORITY_ASSIGNED",

        title:
          `Complaint Priority: ${priorityResult.level}`,

        message:
          `Your complaint has been assigned ${priorityResult.level} priority by the AstraOS priority engine.`,

        metadata: {
          priority:
            priorityResult.level,

          score:
            priorityResult.score,

          reason:
            priorityResult.reason,
        },
      });

      // =================================================
      // DUPLICATE COMPLAINT DETECTION
      // =================================================

      console.log(
        `🔎 [AstraOS Duplicate] Checking complaint ${complaint._id}`
      );

      const duplicateResult =
        await detectDuplicateComplaint({
          title:
            complaint.title,

          description:
            complaint.description,

          category:
            complaint.category,

          complaintId:
            complaint._id,
        });

      // =================================================
      // STORE DUPLICATE INFORMATION
      // =================================================

      complaint.duplicateInfo = {
        isDuplicate:
          duplicateResult.isDuplicate ||
          false,

        duplicateOf:
          duplicateResult.duplicateOf ||
          null,

        similarityScore:
          duplicateResult.similarityScore !==
            null &&
          duplicateResult.similarityScore !==
            undefined
            ? duplicateResult.similarityScore
            : null,
      };

      // =================================================
      // DUPLICATE TIMELINE
      // =================================================

      if (
        duplicateResult.isDuplicate
      ) {
        // =================================================
        // CALCULATE SIMILARITY FIRST
        // IMPORTANT:
        // Must happen BEFORE notification uses it.
        // =================================================

        const similarityPercentage =
          Math.round(
            (duplicateResult.similarityScore ||
              0) * 100
          );

        // =================================================
        // 🔔 NOTIFICATION — DUPLICATE DETECTED
        // =================================================

        await notifyCitizen({
          complaint,
          type:
            "DUPLICATE_DETECTED",

          title:
            "Similar Complaint Detected",

          message:
            `AstraOS detected a similar complaint with ${similarityPercentage}% similarity.`,

          metadata: {
            duplicateOf:
              duplicateResult.duplicateOf,

            similarityScore:
              duplicateResult.similarityScore,
          },
        });

        // =================================================
        // TIMELINE
        // =================================================

        complaint.timeline.push({
          status:
            "DUPLICATE_DETECTED",

          message:
            `Similar complaint detected with ${similarityPercentage}% similarity`,

          actor: "SYSTEM",
          timestamp: new Date(),
        });

        console.log(
          `🔎 [AstraOS Duplicate] Duplicate found → ${
            duplicateResult.duplicateOf
          }`
        );

        console.log(
          `🔎 [AstraOS Duplicate] Similarity → ${similarityPercentage}%`
        );
      } else {
        console.log(
          "🔎 [AstraOS Duplicate] No duplicate detected"
        );
      }

      // =================================================
      // DEPARTMENT ROUTING
      // =================================================

      const recommendedDepartment =
        complaint.aiAnalysis?.department;

      if (recommendedDepartment) {
        const department =
          await findDepartmentByName(
            recommendedDepartment
          );

        if (department) {
          complaint.department =
            department._id;

          complaint.timeline.push({
            status:
              "DEPARTMENT_ASSIGNED",

            message:
              `Complaint routed to ${department.name}`,

            actor: "SYSTEM",
            timestamp: new Date(),
          });

          // =================================================
          // 🔔 NOTIFICATION — CITIZEN
          // =================================================

          await notifyCitizen({
            complaint,
            type:
              "DEPARTMENT_ASSIGNED",

            title:
              "Department Assigned",

            message:
              `Your complaint has been routed to the ${department.name} department.`,

            metadata: {
              departmentId:
                department._id,

              departmentName:
                department.name,
            },
          });

          // =================================================
          // 🔔 NOTIFICATION — DEPARTMENT USERS
          // =================================================

          await notifyDepartmentUsers({
            complaint,

            departmentId:
              department._id,

            type:
              "DEPARTMENT_ASSIGNED",

            title:
              "New Complaint Assigned",

            message:
              `A new complaint "${complaint.title}" has been routed to your department.`,

            metadata: {
              departmentName:
                department.name,

              priority:
                complaint.priority.level,

              priorityScore:
                complaint.priority.score,
            },
          });

          console.log(
            `🏢 [AstraOS Routing] Complaint ${complaint._id} routed to ${department.name}`
          );
        } else {
          console.log(
            `⚠️ [AstraOS Routing] Department not found: ${recommendedDepartment}`
          );
        }
      }

      // =================================================
      // MOVE TO ASSIGNMENT QUEUE
      // =================================================

      complaint.status =
        "PENDING_ASSIGNMENT";

      complaint.timeline.push({
        status:
          "PENDING_ASSIGNMENT",

        message:
          "Complaint is waiting for officer assignment",

        actor: "SYSTEM",
        timestamp: new Date(),
      });

      // =================================================
      // SAVE EVERYTHING
      // =================================================

      await complaint.save();

      // =================================================
      // FINAL LOGS
      // =================================================

      console.log(
        `🎯 [AstraOS Priority] ${
          complaint._id
        } → ${
          priorityResult.level
        } (${
          priorityResult.score
        }/100)`
      );

      console.log(
        `🏢 [AstraOS Routing] Recommended department → ${
          aiResult.department ||
          "Not determined"
        }`
      );

      console.log(
        `🔎 [AstraOS Duplicate] Duplicate → ${
          duplicateResult.isDuplicate
            ? "YES"
            : "NO"
        }`
      );

      console.log(
        `👁️ [AstraOS Vision] Detection count → ${
          complaint.visionAnalysis
            ?.detectionCount || 0
        }`
      );

      console.log(
        `👁️ [AstraOS Vision] Overall severity → ${
          complaint.visionAnalysis
            ?.overallSeverity ||
          "NONE"
        }`
      );

      console.log(
        `✅ [AstraOS AI] Complaint ${complaint._id} processed successfully`
      );
    } catch (aiError) {
      // =================================================
      // AI PROCESSING FAILED
      // =================================================

      console.error(
        "[AstraOS AI] Complaint analysis failed:",
        aiError.message
      );

      if (aiError.response) {
        console.error(
          "[AstraOS AI] AI status:",
          aiError.response.status
        );

        console.error(
          "[AstraOS AI] AI response:",
          aiError.response.data
        );
      }

      // =================================================
      // AI FAILURE TIMELINE
      // =================================================

      complaint.timeline.push({
        status:
          "AI_ANALYSIS_FAILED",

        message:
          "AI analysis could not be completed",

        actor: "SYSTEM",
        timestamp: new Date(),
      });

      // =================================================
      // MOVE TO MANUAL ASSIGNMENT
      // =================================================

      complaint.status =
        "PENDING_ASSIGNMENT";

      complaint.timeline.push({
        status:
          "PENDING_ASSIGNMENT",

        message:
          "AI analysis failed. Complaint moved to manual assignment queue",

        actor: "SYSTEM",
        timestamp: new Date(),
      });

      // =================================================
      // SAVE FAILED AI STATE
      // =================================================

      await complaint.save();
    }

    // =================================================
    // RETURN COMPLAINT
    // =================================================

    return res.status(201).json({
      success: true,

      message:
        "Complaint created successfully",

      data: {
        complaint:
          sanitizeComplaint(
            complaint
          ),
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET MY COMPLAINTS
// GET /api/complaints/my
// CITIZEN ONLY
// =====================================================

const getMyComplaints = async (
  req,
  res,
  next
) => {
  try {
    const complaints =
      await Complaint.find({
        citizen: req.user._id,
      }).sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,

      message:
        "Complaints retrieved successfully",

      data: {
        complaints:
          complaints.map(
            sanitizeComplaint
          ),

        count:
          complaints.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET SINGLE COMPLAINT
// GET /api/complaints/:id
// CITIZEN ONLY
// =====================================================

const getComplaintById = async (
  req,
  res,
  next
) => {
  try {
    const complaint =
      await Complaint.findById(
        req.params.id
      );

    if (!complaint) {
      return res.status(404).json({
        success: false,

        message:
          "Complaint not found",
      });
    }

    if (
      complaint.citizen.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,

        message:
          "You do not have permission to access this complaint",
      });
    }

    return res.status(200).json({
      success: true,

      message:
        "Complaint retrieved successfully",

      data: {
        complaint:
          sanitizeComplaint(
            complaint
          ),
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// VERIFY RESOLVED COMPLAINT
// POST /api/complaints/:complaintId/verify
// CITIZEN ONLY
// =====================================================

const verifyComplaint = async (
  req,
  res,
  next
) => {
  try {
    const {
      complaintId,
    } = req.params;

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

    if (
      !complaint.citizen ||
      complaint.citizen.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,

        message:
          "You are not allowed to verify this complaint",
      });
    }

    if (
      complaint.status !==
      "RESOLVED"
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Only resolved complaints can be verified",
      });
    }

    complaint.status =
      "CITIZEN_VERIFIED";

    complaint.timeline.push({
      status:
        "CITIZEN_VERIFIED",

      message:
        "Complaint verified as resolved by citizen",

      actor: "CITIZEN",
      timestamp: new Date(),
    });

    // =================================================
    // 🔔 NOTIFICATION — OFFICER
    // =================================================

    await notifyOfficer({
      complaint,

      type:
        "CITIZEN_VERIFIED",

      title:
        "Resolution Verified",

      message:
        `Citizen has verified that complaint "${complaint.title}" has been resolved.`,

      metadata: {
        status:
          complaint.status,
      },
    });

    await complaint.save();

    return res.status(200).json({
      success: true,

      message:
        "Complaint verified successfully",

      data: {
        complaint:
          sanitizeComplaint(
            complaint
          ),
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// CLOSE VERIFIED COMPLAINT
// POST /api/complaints/:complaintId/close
// CITIZEN ONLY
// =====================================================

const closeComplaint = async (
  req,
  res,
  next
) => {
  try {
    const {
      complaintId,
    } = req.params;

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

    if (
      !complaint.citizen ||
      complaint.citizen.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,

        message:
          "You are not allowed to close this complaint",
      });
    }

    if (
      complaint.status !==
      "CITIZEN_VERIFIED"
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Only citizen-verified complaints can be closed",
      });
    }

    complaint.status =
      "CLOSED";

    // =================================================
    // 🔔 NOTIFICATION — OFFICER
    // =================================================

    await notifyOfficer({
      complaint,

      type:
        "COMPLAINT_CLOSED",

      title:
        "Complaint Closed",

      message:
        `Complaint "${complaint.title}" has been officially closed after citizen verification.`,

      metadata: {
        status:
          complaint.status,
      },
    });

    complaint.timeline.push({
      status: "CLOSED",

      message:
        "Complaint closed after citizen verification",

      actor: "CITIZEN",
      timestamp: new Date(),
    });

    await complaint.save();

    return res.status(200).json({
      success: true,

      message:
        "Complaint closed successfully",

      data: {
        complaint:
          sanitizeComplaint(
            complaint
          ),
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// REOPEN RESOLVED COMPLAINT
// POST /api/complaints/:complaintId/reopen
// CITIZEN ONLY
// =====================================================

const reopenComplaint = async (
  req,
  res,
  next
) => {
  try {
    const {
      complaintId,
    } = req.params;

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

    if (
      !complaint.citizen ||
      complaint.citizen.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,

        message:
          "You are not allowed to reopen this complaint",
      });
    }

    if (
      complaint.status !==
      "RESOLVED"
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Only resolved complaints can be reopened",
      });
    }

    complaint.status =
      "REOPENED";

    // =================================================
    // 🔔 NOTIFICATION — OFFICER
    // =================================================

    await notifyOfficer({
      complaint,

      type:
        "COMPLAINT_REOPENED",

      title:
        "Complaint Reopened",

      message:
        `Citizen has reopened complaint "${complaint.title}" because the issue is still not resolved.`,

      metadata: {
        status:
          complaint.status,
      },
    });

    complaint.timeline.push({
      status: "REOPENED",

      message:
        "Citizen reported that the issue is still not resolved",

      actor: "CITIZEN",
      timestamp: new Date(),
    });

    await complaint.save();

    return res.status(200).json({
      success: true,

      message:
        "Complaint reopened successfully",

      data: {
        complaint:
          sanitizeComplaint(
            complaint
          ),
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET CITIZEN DASHBOARD
// GET /api/complaints/dashboard
// CITIZEN ONLY
// =====================================================

const getCitizenDashboard = async (
  req,
  res,
  next
) => {
  try {
    const complaints =
      await Complaint.find({
        citizen: req.user._id,
      });

    const statusCounts = {
      submitted: 0,
      pendingAssignment: 0,
      assigned: 0,
      accepted: 0,
      workStarted: 0,
      work50Percent: 0,
      reopened: 0,
      resolved: 0,
      citizenVerified: 0,
      closed: 0,
    };

    complaints.forEach(
      (complaint) => {
        switch (
          complaint.status
        ) {
          case "SUBMITTED":
            statusCounts.submitted++;
            break;

          case "PENDING_ASSIGNMENT":
            statusCounts.pendingAssignment++;
            break;

          case "ASSIGNED":
            statusCounts.assigned++;
            break;

          case "ACCEPTED":
            statusCounts.accepted++;
            break;

          case "WORK_STARTED":
            statusCounts.workStarted++;
            break;

          case "WORK_50_PERCENT":
            statusCounts.work50Percent++;
            break;

          case "REOPENED":
            statusCounts.reopened++;
            break;

          case "RESOLVED":
            statusCounts.resolved++;
            break;

          case "CITIZEN_VERIFIED":
            statusCounts.citizenVerified++;
            break;

          case "CLOSED":
            statusCounts.closed++;
            break;

          default:
            break;
        }
      }
    );

    return res.status(200).json({
      success: true,

      message:
        "Citizen dashboard retrieved successfully",

      data: {
        totalComplaints:
          complaints.length,

        statusCounts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// RATE COMPLAINT SERVICE
// POST /api/complaints/:complaintId/rating
// CITIZEN ONLY
// =====================================================

const rateComplaint = async (
  req,
  res,
  next
) => {
  try {
    const {
      complaintId,
    } = req.params;

    const {
      overall,
      resolutionQuality,
      officerBehaviour,
      timeTaken,
      feedback,
    } = req.body;

    // =================================================
    // RATING VALIDATION
    // =================================================

    if (
      overall === undefined ||
      resolutionQuality ===
        undefined ||
      officerBehaviour ===
        undefined ||
      timeTaken === undefined
    ) {
      return res.status(400).json({
        success: false,

        message:
          "All rating fields are required",
      });
    }

    const ratings = [
      overall,
      resolutionQuality,
      officerBehaviour,
      timeTaken,
    ];

    if (
      ratings.some(
        (rating) =>
          Number(rating) < 1 ||
          Number(rating) > 5
      )
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Ratings must be between 1 and 5",
      });
    }

    // =================================================
    // FIND COMPLAINT
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
    // OWNERSHIP CHECK
    // =================================================

    if (
      !complaint.citizen ||
      complaint.citizen.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,

        message:
          "You are not allowed to rate this complaint",
      });
    }

    // =================================================
    // STATUS CHECK
    // =================================================

    if (
      complaint.status !==
      "CLOSED"
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Complaint must be closed before rating",
      });
    }

    // =================================================
    // PREVENT MULTIPLE RATINGS
    // =================================================

    if (
      complaint.serviceRating
        ?.submittedAt
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Service rating has already been submitted",
      });
    }

    // =================================================
    // STORE SERVICE RATING
    // =================================================

    complaint.serviceRating = {
      overall:
        Number(overall),

      resolutionQuality:
        Number(
          resolutionQuality
        ),

      officerBehaviour:
        Number(
          officerBehaviour
        ),

      timeTaken:
        Number(timeTaken),

      feedback:
        feedback || "",

      submittedAt:
        new Date(),
    };

    // =================================================
    // RATING TIMELINE
    // =================================================

    complaint.timeline.push({
      status: "RATED",

      message:
        "Citizen submitted service rating and feedback",

      actor: "CITIZEN",
      timestamp: new Date(),
    });

    await complaint.save();

    // =================================================
    // 🔔 NOTIFICATION — OFFICER RATING
    // =================================================

    await notifyOfficer({
      complaint,

      type:
        "SYSTEM",

      title:
        "Citizen Submitted Feedback",

      message:
        `Citizen submitted a ${overall}/5 service rating for complaint "${complaint.title}".`,

      metadata: {
        overall:
          Number(overall),

        resolutionQuality:
          Number(resolutionQuality),

        officerBehaviour:
          Number(officerBehaviour),

        timeTaken:
          Number(timeTaken),

        feedback:
          feedback || "",
      },
    });

    return res.status(200).json({
      success: true,

      message:
        "Service rating submitted successfully",

      data: {
        complaint:
          sanitizeComplaint(
            complaint
          ),
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  verifyComplaint,
  closeComplaint,
  reopenComplaint,
  getCitizenDashboard,
  rateComplaint,
};