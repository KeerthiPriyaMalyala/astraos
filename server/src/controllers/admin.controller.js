const User = require("../models/User");
const Department = require("../models/Department");
const Complaint = require("../models/Complaint");
const { hashPassword } = require("../utils/password");

// =====================================================
// CREATE GOVERNMENT USER
// POST /api/admin/users
// =====================================================

const createGovernmentUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phoneNumber,
      role,
      department,
    } = req.body;

    // =================================================
    // 1. VALIDATION
    // =================================================

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, and role are required",
      });
    }

    // Only government roles can be created here
    if (!["OFFICER", "DEPARTMENT_HEAD"].includes(role)) {
      return res.status(400).json({
        success: false,
        message:
          "Only OFFICER or DEPARTMENT_HEAD users can be created",
      });
    }

    // Government users must belong to a department
    if (!department) {
      return res.status(400).json({
        success: false,
        message: "Department is required",
      });
    }

    // =================================================
    // 2. NORMALIZE EMAIL
    // =================================================

    const normalizedEmail = email.trim().toLowerCase();

    // =================================================
    // 3. CHECK DUPLICATE EMAIL
    // =================================================

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // =================================================
    // 4. CHECK DEPARTMENT
    // =================================================

    const departmentDoc = await Department.findById(department);

    if (!departmentDoc) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    if (!departmentDoc.isActive) {
      return res.status(400).json({
        success: false,
        message: "Department is inactive",
      });
    }

    // =================================================
    // 5. HASH PASSWORD
    // =================================================

    const hashedPassword = await hashPassword(password);

    // =================================================
    // 6. CREATE GOVERNMENT USER
    // =================================================

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phoneNumber,
      role,
      department: departmentDoc._id,
    });

    // =================================================
    // 7. RESPONSE
    // =================================================

    return res.status(201).json({
      success: true,
      message: "Government user created successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          department: {
            id: departmentDoc._id,
            name: departmentDoc.name,
            code: departmentDoc.code,
          },
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    // Handle duplicate email race condition
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    next(error);
  }
};


// =====================================================
// GET ALL / FILTER COMPLAINTS
// GET /api/admin/complaints
// ADMIN ONLY
// =====================================================

const getAllComplaints = async (req, res, next) => {
  try {
    const {
      status,
      priority,
      category,
      department,
      page = 1,
      limit = 10,
    } = req.query;

    // =================================================
    // 1. BUILD FILTER
    // =================================================

    const filter = {};

    if (status) {
      filter.status = status.toUpperCase();
    }

    if (priority) {
      filter["priority.level"] = priority.toUpperCase();
    }

    if (category) {
      filter.category = category.toUpperCase();
    }

    if (department) {
      filter.department = department;
    }

    // =================================================
    // 2. PAGINATION
    // =================================================

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);

    const limitNumber = Math.min(
      Math.max(parseInt(limit, 10) || 10, 1),
      100
    );

    const skip = (pageNumber - 1) * limitNumber;

    // =================================================
    // 3. GET TOTAL COUNT
    // =================================================

    const totalComplaints = await Complaint.countDocuments(filter);

    // =================================================
    // 4. GET COMPLAINTS
    // =================================================

    const complaints = await Complaint.find(filter)
      .populate("citizen", "name email phoneNumber")
      .populate("department", "name code")
      .populate("assignedOfficer", "name email")
      .sort({
        "priority.score": -1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(limitNumber);

    // =================================================
    // 5. RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,
      message: "Complaints retrieved successfully",
      data: {
        complaints,
        count: complaints.length,

        pagination: {
          currentPage: pageNumber,
          limit: limitNumber,
          totalComplaints,
          totalPages: Math.ceil(
            totalComplaints / limitNumber
          ),
          hasNextPage:
            pageNumber < Math.ceil(
              totalComplaints / limitNumber
            ),
          hasPreviousPage: pageNumber > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
// =====================================================
// GET SINGLE COMPLAINT
// GET /api/admin/complaints/:complaintId
// ADMIN ONLY
// =====================================================

const getComplaintById = async (req, res, next) => {
  try {
    const { complaintId } = req.params;

    // =================================================
    // 1. FIND COMPLAINT
    // =================================================

    const complaint = await Complaint.findById(complaintId)
      .populate("citizen", "name email phoneNumber")
      .populate("department", "name code")
      .populate("assignedOfficer", "name email phoneNumber");

    // =================================================
    // 2. CHECK COMPLAINT
    // =================================================

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    // =================================================
    // 3. RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,
      message: "Complaint retrieved successfully",
      data: {
        complaint,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// CLOSE VERIFIED COMPLAINT
// POST /api/admin/complaints/:complaintId/close
// ADMIN ONLY
// =====================================================

const closeComplaint = async (req, res, next) => {
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
    // 2. CHECK CURRENT STATUS
    // =================================================

    if (complaint.status !== "CITIZEN_VERIFIED") {
      return res.status(400).json({
        success: false,
        message: "Only citizen-verified complaints can be closed",
      });
    }

    // =================================================
    // 3. UPDATE STATUS
    // =================================================

    complaint.status = "CLOSED";

    // =================================================
    // 4. ADD TIMELINE ENTRY
    // =================================================

    complaint.timeline.push({
      status: "CLOSED",
      message: "Complaint officially closed by AstraOS",
      actor: "ADMIN",
    });

    // =================================================
    // 5. SAVE
    // =================================================

    await complaint.save();

    // =================================================
    // 6. RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,
      message: "Complaint closed successfully",
      data: {
        complaint,
      },
    });
  } catch (error) {
    next(error);
  }
};

/// =====================================================
// GET ADMIN DASHBOARD
// GET /api/admin/dashboard
// ADMIN ONLY
// =====================================================

const getAdminDashboard = async (req, res, next) => {
  try {
    // =================================================
    // 1. BASIC COUNTS
    // =================================================

    const [
      totalComplaints,
      totalGovernmentUsers,
      activeGovernmentUsers,
      totalDepartments,
      activeDepartments,
    ] = await Promise.all([
      Complaint.countDocuments(),

      User.countDocuments({
        role: {
          $in: ["OFFICER", "DEPARTMENT_HEAD"],
        },
      }),

      User.countDocuments({
        role: {
          $in: ["OFFICER", "DEPARTMENT_HEAD"],
        },
        isActive: true,
      }),

      Department.countDocuments(),

      Department.countDocuments({
        isActive: true,
      }),
    ]);

    // =================================================
    // 2. COMPLAINT COUNTS BY STATUS
    // =================================================

    const statusStats = await Complaint.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    // =================================================
    // 3. HIGH PRIORITY COMPLAINTS
    // =================================================

    const highPriority = await Complaint.countDocuments({
      "priority.level": "HIGH",
    });

    // =================================================
    // 4. COMPLAINTS BY PRIORITY
    // =================================================

    const complaintsByPriority = await Complaint.aggregate([
      {
        $group: {
          _id: "$priority.level",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    // =================================================
    // 5. COMPLAINTS BY CATEGORY
    // =================================================

    const complaintsByCategory = await Complaint.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    // =================================================
    // 6. COMPLAINTS BY DEPARTMENT
    // =================================================

    const complaintsByDepartment = await Complaint.aggregate([
      {
        $match: {
          department: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "departments",
          localField: "_id",
          foreignField: "_id",
          as: "department",
        },
      },
      {
        $unwind: "$department",
      },
      {
        $project: {
          _id: 0,
          departmentId: "$department._id",
          name: "$department.name",
          code: "$department.code",
          count: 1,
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    // =================================================
    // 7. RECENT COMPLAINTS
    // =================================================

    const recentComplaints = await Complaint.find()
      .populate("citizen", "name email")
      .populate("department", "name code")
      .populate("assignedOfficer", "name email")
      .sort({
        createdAt: -1,
      })
      .limit(5);

    // =================================================
    // 8. PENDING ASSIGNMENTS
    // =================================================

    const pendingAssignments = await Complaint.countDocuments({
      status: "PENDING_ASSIGNMENT",
    });

    // =================================================
    // 9. RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,
      message: "Admin dashboard retrieved successfully",

      data: {
        overview: {
          totalComplaints,
          totalGovernmentUsers,
          activeGovernmentUsers,
          totalDepartments,
          activeDepartments,
          highPriority,
          pendingAssignments,
        },

        complaints: {
          byStatus: statusStats,
          byPriority: complaintsByPriority,
          byCategory: complaintsByCategory,
          byDepartment: complaintsByDepartment,
        },

        recentComplaints,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET ALL GOVERNMENT USERS
// GET /api/admin/users
// ADMIN ONLY
// =====================================================

const getAllGovernmentUsers = async (req, res, next) => {
  try {
    const users = await User.find({
      role: {
        $in: ["OFFICER", "DEPARTMENT_HEAD"],
      },
    })
      .populate("department", "name code")
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Government users retrieved successfully",
      data: {
        users,
        count: users.length,
      },
    });
  } catch (error) {
    next(error);
  }
};



// =====================================================
// GET SINGLE GOVERNMENT USER
// GET /api/admin/users/:userId
// ADMIN ONLY
// =====================================================

const getGovernmentUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // =================================================
    // 1. FIND USER
    // =================================================

    const user = await User.findById(userId)
      .populate("department", "name code")
      .select("-password");

    // =================================================
    // 2. CHECK USER EXISTS
    // =================================================

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Government user not found",
      });
    }

    // =================================================
    // 3. ONLY GOVERNMENT USERS
    // =================================================

    if (!["OFFICER", "DEPARTMENT_HEAD"].includes(user.role)) {
      return res.status(400).json({
        success: false,
        message: "This user is not a government user",
      });
    }

    // =================================================
    // 4. RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,
      message: "Government user retrieved successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// UPDATE GOVERNMENT USER STATUS
// PATCH /api/admin/users/:userId/status
// ADMIN ONLY
// =====================================================

const updateGovernmentUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    // =================================================
    // 1. VALIDATION
    // =================================================

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean",
      });
    }

    // =================================================
    // 2. FIND USER
    // =================================================

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Government user not found",
      });
    }

    // =================================================
    // 3. CHECK GOVERNMENT ROLE
    // =================================================

    if (!["OFFICER", "DEPARTMENT_HEAD"].includes(user.role)) {
      return res.status(400).json({
        success: false,
        message: "This user is not a government user",
      });
    }

    // =================================================
    // 4. UPDATE STATUS
    // =================================================

    user.isActive = isActive;

    await user.save();

    // =================================================
    // 5. RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,
      message: `Government user ${
        isActive ? "activated" : "deactivated"
      } successfully`,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          isActive: user.isActive,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};


// =====================================================
// CREATE DEPARTMENT
// POST /api/admin/departments
// ADMIN ONLY
// =====================================================

const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description } = req.body;

    // =================================================
    // 1. VALIDATION
    // =================================================

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Department name and code are required",
      });
    }

    // =================================================
    // 2. NORMALIZE
    // =================================================

    const normalizedName = name.trim();
    const normalizedCode = code.trim().toUpperCase();

    // =================================================
    // 3. CHECK DUPLICATE
    // =================================================

    const existingDepartment = await Department.findOne({
      $or: [
        { name: normalizedName },
        { code: normalizedCode },
      ],
    });

    if (existingDepartment) {
      return res.status(409).json({
        success: false,
        message: "A department with this name or code already exists",
      });
    }

    // =================================================
    // 4. CREATE DEPARTMENT
    // =================================================

    const department = await Department.create({
      name: normalizedName,
      code: normalizedCode,
      description: description ? description.trim() : "",
      isActive: true,
    });

    // =================================================
    // 5. RESPONSE
    // =================================================

    return res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: {
        department: {
          id: department._id,
          name: department.name,
          code: department.code,
          description: department.description,
          isActive: department.isActive,
          createdAt: department.createdAt,
          updatedAt: department.updatedAt,
        },
      },
    });
  } catch (error) {
    // Handle duplicate key race condition
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A department with this name or code already exists",
      });
    }

    next(error);
  }
};

const getAllDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find()
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Departments retrieved successfully",
      data: {
        departments,
        count: departments.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getDepartmentById = async (req, res, next) => {
  try {
    const { departmentId } = req.params;

    // =================================================
    // 1. FIND DEPARTMENT
    // =================================================

    const department = await Department.findById(departmentId);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // =================================================
    // 2. RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,
      message: "Department retrieved successfully",
      data: {
        department,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateDepartmentStatus = async (req, res, next) => {
  try {
    const { departmentId } = req.params;
    const { isActive } = req.body;

    // =================================================
    // 1. VALIDATION
    // =================================================

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean",
      });
    }

    // =================================================
    // 2. FIND DEPARTMENT
    // =================================================

    const department = await Department.findById(departmentId);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // =================================================
    // 3. UPDATE STATUS
    // =================================================

    department.isActive = isActive;

    await department.save();

    // =================================================
    // 4. RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,
      message: isActive
        ? "Department activated successfully"
        : "Department deactivated successfully",
      data: {
        department: {
          id: department._id,
          name: department.name,
          code: department.code,
          isActive: department.isActive,
          updatedAt: department.updatedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};


const updateDepartment = async (req, res, next) => {
  try {
    const { departmentId } = req.params;
    const { name, code, description } = req.body;

    // =================================================
    // 1. FIND DEPARTMENT
    // =================================================

    const department = await Department.findById(departmentId);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // =================================================
    // 2. VALIDATION
    // =================================================

    if (!name && !code && !description) {
      return res.status(400).json({
        success: false,
        message:
          "At least one field (name, code, or description) is required",
      });
    }

    // =================================================
    // 3. NORMALIZE VALUES
    // =================================================

    const updatedName = name
      ? name.trim()
      : department.name;

    const updatedCode = code
      ? code.trim().toUpperCase()
      : department.code;

    const updatedDescription =
      description !== undefined
        ? description.trim()
        : department.description;

    // =================================================
    // 4. CHECK DUPLICATE NAME / CODE
    // =================================================

    const duplicateDepartment = await Department.findOne({
      _id: { $ne: departmentId },
      $or: [
        { name: updatedName },
        { code: updatedCode },
      ],
    });

    if (duplicateDepartment) {
      return res.status(409).json({
        success: false,
        message:
          "A department with this name or code already exists",
      });
    }

    // =================================================
    // 5. UPDATE
    // =================================================

    department.name = updatedName;
    department.code = updatedCode;
    department.description = updatedDescription;

    await department.save();

    // =================================================
    // 6. RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,
      message: "Department updated successfully",
      data: {
        department: {
          id: department._id,
          name: department.name,
          code: department.code,
          description: department.description,
          isActive: department.isActive,
          updatedAt: department.updatedAt,
        },
      },
    });
  } catch (error) {
    // Handle MongoDB duplicate-key race condition
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A department with this name or code already exists",
      });
    }

    next(error);
  }
};


const reassignComplaintDepartment = async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const { departmentId } = req.body;

    // =================================================
    // 1. VALIDATION
    // =================================================

    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: "Department ID is required",
      });
    }

    // =================================================
    // 2. FIND COMPLAINT
    // =================================================

    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    // =================================================
    // 3. CHECK STATUS
    // =================================================

    const allowedStatuses = [
      "PENDING_ASSIGNMENT",
      "ASSIGNED",
    ];

    if (!allowedStatuses.includes(complaint.status)) {
      return res.status(400).json({
        success: false,
        message:
          "Complaint cannot be reassigned at its current status",
      });
    }

    // =================================================
    // 4. FIND NEW DEPARTMENT
    // =================================================

    const department = await Department.findById(departmentId);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    // =================================================
    // 5. CHECK DEPARTMENT STATUS
    // =================================================

    if (!department.isActive) {
      return res.status(400).json({
        success: false,
        message: "Department is inactive",
      });
    }

    // =================================================
    // 6. UPDATE DEPARTMENT
    // =================================================

    complaint.department = department._id;

    // Old officer should no longer remain assigned
    complaint.assignedOfficer = null;

    // Complaint goes back to assignment queue
    complaint.status = "PENDING_ASSIGNMENT";

    // =================================================
    // 7. ADD TIMELINE
    // =================================================

   complaint.timeline.push({
  status: "DEPARTMENT_ASSIGNED",
  message: `Complaint reassigned by Admin to ${department.name}`,
  actor: "ADMIN",
  timestamp: new Date(),
});

    // =================================================
    // 8. SAVE
    // =================================================

    await complaint.save();

    // =================================================
    // 9. RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,
      message: "Complaint reassigned successfully",
      data: {
        complaint: {
          id: complaint._id,
          department: {
            id: department._id,
            name: department.name,
            code: department.code,
          },
          assignedOfficer: complaint.assignedOfficer,
          status: complaint.status,
          updatedAt: complaint.updatedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET COMPLAINT STATISTICS
// ADMIN ONLY
// =====================================================

const getComplaintStats = async (req, res, next) => {
  try {
    // =================================================
    // 1. TOTAL COMPLAINTS
    // =================================================

    const totalComplaints = await Complaint.countDocuments();

    // =================================================
    // 2. COMPLAINTS BY STATUS
    // =================================================

    const statusStats = await Complaint.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    // =================================================
    // 3. COMPLAINTS BY PRIORITY
    // =================================================

    const priorityStats = await Complaint.aggregate([
      {
        $group: {
          _id: "$priority.level",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    // =================================================
    // 4. COMPLAINTS BY CATEGORY
    // =================================================

    const categoryStats = await Complaint.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    // =================================================
    // 5. COMPLAINTS BY DEPARTMENT
    // =================================================

    const departmentStats = await Complaint.aggregate([
      {
        $match: {
          department: { $ne: null },
        },
      },
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "departments",
          localField: "_id",
          foreignField: "_id",
          as: "department",
        },
      },
      {
        $unwind: "$department",
      },
      {
        $project: {
          _id: 0,
          departmentId: "$department._id",
          name: "$department.name",
          code: "$department.code",
          count: 1,
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    // =================================================
    // 6. RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,
      message: "Complaint statistics retrieved successfully",
      data: {
        totalComplaints,

        byStatus: statusStats,

        byPriority: priorityStats,

        byCategory: categoryStats,

        byDepartment: departmentStats,
      },
    });
  } catch (error) {
    next(error);
  }
};



// =====================================================
// 🌍 GET COMMUNITY IMPACT DASHBOARD
// GET /api/admin/community-impact
// ADMIN ONLY
// =====================================================

const getCommunityImpact = async (req, res, next) => {
  try {
    // =================================================
    // 1. TOTAL ISSUES
    // =================================================

    const totalIssues = await Complaint.countDocuments();

    // =================================================
    // 2. RESOLVED ISSUES
    // =================================================

    const resolvedIssues = await Complaint.countDocuments({
      status: {
        $in: [
          "RESOLVED",
          "CITIZEN_VERIFIED",
          "CLOSED",
        ],
      },
    });

    // =================================================
    // 3. RESOLUTION RATE
    // =================================================

    const resolutionRate =
      totalIssues > 0
        ? Number(
            ((resolvedIssues / totalIssues) * 100).toFixed(1)
          )
        : 0;

    // =================================================
    // 4. AVERAGE RESOLUTION TIME
    // =================================================
    // Uses the first RESOLVED timeline event.

    const resolutionTimeResult =
      await Complaint.aggregate([
        {
          $match: {
            status: {
              $in: [
                "RESOLVED",
                "CITIZEN_VERIFIED",
                "CLOSED",
              ],
            },
          },
        },

        {
          $project: {
            createdAt: 1,

            resolvedEvent: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$timeline",
                    as: "event",
                    cond: {
                      $eq: [
                        "$$event.status",
                        "RESOLVED",
                      ],
                    },
                  },
                },
                0,
              ],
            },
          },
        },

        {
          $match: {
            "resolvedEvent.timestamp": {
              $exists: true,
            },
          },
        },

        {
          $project: {
            resolutionTimeMs: {
              $subtract: [
                "$resolvedEvent.timestamp",
                "$createdAt",
              ],
            },
          },
        },

        {
          $group: {
            _id: null,
            averageResolutionTimeMs: {
              $avg: "$resolutionTimeMs",
            },
          },
        },
      ]);

    let averageResolutionTimeDays = 0;

    if (resolutionTimeResult.length > 0) {
      averageResolutionTimeDays = Number(
        (
          resolutionTimeResult[0]
            .averageResolutionTimeMs /
          (1000 * 60 * 60 * 24)
        ).toFixed(1)
      );
    }

    // =================================================
    // 5. TOP CIVIC ISSUES
    // =================================================

    const topCivicIssues = await Complaint.aggregate([
      {
        $group: {
          _id: "$category",
          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          count: -1,
        },
      },

      {
        $limit: 10,
      },
    ]);

    // =================================================
    // 6. CITIZENS ENGAGED
    // =================================================

    const citizensEngagedResult =
      await Complaint.aggregate([
        {
          $group: {
            _id: "$citizen",
          },
        },

        {
          $count: "count",
        },
      ]);

    const citizensEngaged =
      citizensEngagedResult.length > 0
        ? citizensEngagedResult[0].count
        : 0;

    // =================================================
    // 7. AI DECISIONS
    // =================================================
    // Count complaints that received AI analysis.

    const aiDecisions = await Complaint.countDocuments({
      $or: [
        {
          "aiAnalysis.analyzedAt": {
            $exists: true,
            $ne: null,
          },
        },

        {
          "visionAnalysis.analyzedAt": {
            $exists: true,
            $ne: null,
          },
        },
      ],
    });

    // =================================================
    // 8. IMPACT BY STATUS
    // =================================================

    const statusBreakdown = await Complaint.aggregate([
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          count: -1,
        },
      },
    ]);

    // =================================================
    // 9. RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,

      message:
        "Community impact data retrieved successfully",

      data: {
        overview: {
          totalIssues,
          resolvedIssues,
          resolutionRate,
          averageResolutionTimeDays,
          citizensEngaged,
          aiDecisions,
        },

        topCivicIssues,

        statusBreakdown,

        impactStatement:
          "AstraOS helped identify the highest-impact civic problems across regions.",
      },
    });
  } catch (error) {
    next(error);
  }
};



module.exports = {
  createGovernmentUser,
  getAllComplaints,
  closeComplaint,

   getAdminDashboard,
getComplaintById,

 getAllGovernmentUsers,
 getGovernmentUserById,
 updateGovernmentUserStatus,
createDepartment,
getAllDepartments,

getDepartmentById,
updateDepartmentStatus,
updateDepartment,
reassignComplaintDepartment,
getComplaintStats,
getCommunityImpact,

};