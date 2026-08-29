

const User = require("../models/User");
const Department = require("../models/Department");
const Complaint = require("../models/Complaint");

const {
  getDepartmentPriorityQueue,
  getDepartmentComplaintQueue,
} = require("../services/department.service");

// =====================================================
// GET MY DEPARTMENT PRIORITY QUEUE
// GET /api/departments/my/queue
// =====================================================

const getMyDepartmentPriorityQueue = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.department) {
      return res.status(400).json({
        success: false,
        message: "User is not assigned to a department",
      });
    }

    const department = await Department.findById(user.department);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const complaints = await getDepartmentPriorityQueue(
      department._id
    );

    return res.status(200).json({
      success: true,
      message: "Department priority queue retrieved successfully",
      data: {
        department: {
          id: department._id,
          name: department.name,
          code: department.code,
        },
        complaints,
        count: complaints.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET MY DEPARTMENT COMPLAINTS
// GET /api/departments/my/complaints
// =====================================================

const getMyDepartmentComplaints = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.department) {
      return res.status(400).json({
        success: false,
        message: "User is not assigned to a department",
      });
    }

    const department = await Department.findById(user.department);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const complaints = await getDepartmentComplaintQueue(
      department._id
    );

    return res.status(200).json({
      success: true,
      message: "Department complaints retrieved successfully",
      data: {
        department: {
          id: department._id,
          name: department.name,
          code: department.code,
        },
        complaints,
        count: complaints.length,
      },
    });
  } catch (error) {
    next(error);
  }
};


// =====================================================
// ASSIGN COMPLAINT TO OFFICER
// PUT /api/departments/complaints/:complaintId/assign
// DEPARTMENT HEAD ONLY
// =====================================================

const assignComplaintToOfficer = async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const { officerId } = req.body;

    // 1. Validate officer ID
    if (!officerId) {
      return res.status(400).json({
        success: false,
        message: "Officer ID is required",
      });
    }

    // 2. Get logged-in department head's department
    const departmentId = req.user.department;

    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: "Department head is not assigned to a department",
      });
    }

    // 3. Find complaint
    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    // 4. Make sure complaint belongs to this department
    if (
  !complaint.department ||
  complaint.department.toString() !==
    departmentId.toString()
) {
  return res.status(403).json({
    success: false,
    message:
      "You can only assign complaints from your department",
  });
}

    // 5. Find officer
    const officer = await User.findById(officerId);

    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "Officer not found",
      });
    }

    // 6. Make sure selected user is actually an officer
    if (officer.role !== "OFFICER") {
      return res.status(400).json({
        success: false,
        message: "Selected user is not an officer",
      });
    }

    // 7. Make sure officer belongs to same department
    if (
      !officer.department ||
      officer.department.toString() !== departmentId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Officer does not belong to your department",
      });
    }

    // 8. Make sure officer is active
    if (!officer.isActive) {
      return res.status(400).json({
        success: false,
        message: "Officer account is inactive",
      });
    }

    // 9. Assign officer
    complaint.assignedOfficer = officer._id;

    // 10. Update status
    complaint.status = "ASSIGNED";

    // 11. Add timeline entry
    complaint.timeline.push({
      status: "OFFICER_ASSIGNED",
      message: `Complaint assigned to ${officer.name}`,
      actor: "DEPARTMENT_HEAD",
      timestamp: new Date(),
    });

    await complaint.save();

    // 12. Response
    return res.status(200).json({
      success: true,
      message: "Complaint assigned to officer successfully",
      data: {
        complaint,
        officer: {
          id: officer._id,
          name: officer.name,
          email: officer.email,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET DEPARTMENT OFFICERS
// GET /api/departments/officers
// DEPARTMENT HEAD ONLY
// =====================================================

const getDepartmentOfficers = async (req, res, next) => {
  try {
    // =================================================
    // 1. CHECK DEPARTMENT HEAD'S DEPARTMENT
    // =================================================

    if (!req.user.department) {
      return res.status(400).json({
        success: false,
        message: "Department head is not assigned to a department",
      });
    }

    // =================================================
    // 2. FIND ACTIVE OFFICERS IN SAME DEPARTMENT
    // =================================================

    const officers = await User.find({
      role: "OFFICER",
      department: req.user.department,
      isActive: true,
    })
      .select("name email phoneNumber department isActive")
      .sort({ name: 1 });

    // =================================================
    // 3. RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,
      message: "Department officers retrieved successfully",
      data: {
        officers,
        count: officers.length,
      },
    });
  } catch (error) {
    next(error);
  }
};


// =====================================================
// GET DEPARTMENT DASHBOARD
// GET /api/departments/dashboard
// DEPARTMENT HEAD ONLY
// =====================================================

const getDepartmentDashboard = async (req, res, next) => {
  try {
    // =================================================
    // 1. CHECK DEPARTMENT
    // =================================================

    if (!req.user.department) {
      return res.status(400).json({
        success: false,
        message: "Department head is not assigned to a department",
      });
    }

    // =================================================
    // 2. GET COMPLAINT COUNTS
    // =================================================

    const departmentId = req.user.department;

    const [
      totalComplaints,
      pendingAssignment,
      assigned,
      accepted,
      workStarted,
      work50Percent,
      resolved,
      citizenVerified,
      closed,
    ] = await Promise.all([
      Complaint.countDocuments({
        department: departmentId,
      }),

      Complaint.countDocuments({
        department: departmentId,
        status: "PENDING_ASSIGNMENT",
      }),

      Complaint.countDocuments({
        department: departmentId,
        status: "ASSIGNED",
      }),

      Complaint.countDocuments({
        department: departmentId,
        status: "ACCEPTED",
      }),

      Complaint.countDocuments({
        department: departmentId,
        status: "WORK_STARTED",
      }),

      Complaint.countDocuments({
        department: departmentId,
        status: "WORK_50_PERCENT",
      }),

      Complaint.countDocuments({
        department: departmentId,
        status: "RESOLVED",
      }),

      Complaint.countDocuments({
        department: departmentId,
        status: "CITIZEN_VERIFIED",
      }),

      Complaint.countDocuments({
        department: departmentId,
        status: "CLOSED",
      }),
    ]);

    // =================================================
    // 3. RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,
      message: "Department dashboard retrieved successfully",
      data: {
        totalComplaints,
        pendingAssignment,
        assigned,
        accepted,
        workStarted,
        work50Percent,
        resolved,
        citizenVerified,
        closed,
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
  getMyDepartmentPriorityQueue,
  getMyDepartmentComplaints,
   assignComplaintToOfficer,
   getDepartmentOfficers,
   getDepartmentDashboard,
};