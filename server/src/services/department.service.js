const Department = require("../models/Department");
const Complaint = require("../models/Complaint");

// =====================================================
// FIND DEPARTMENT BY NAME
// =====================================================

const findDepartmentByName = async (departmentName) => {
  if (!departmentName) {
    return null;
  }

  const department = await Department.findOne({
    name: {
      $regex: `^${departmentName.trim()}$`,
      $options: "i",
    },
    isActive: true,
  });

  return department;
};

// =====================================================
// GET DEPARTMENT PRIORITY QUEUE
// =====================================================

const getDepartmentPriorityQueue = async (departmentId) => {
  if (!departmentId) {
    return [];
  }

  const complaints = await Complaint.find({
    department: departmentId,

    // Only complaints that still need department/officer work
    status: {
      $in: [
        "PENDING_ASSIGNMENT",
        "ASSIGNED",
        "ACCEPTED",
        "WORK_STARTED",
        "WORK_50_PERCENT",
      ],
    },
  })
    .populate("citizen", "name email phoneNumber")
    .populate("assignedOfficer", "name email")
    .sort({
      "priority.score": -1,
      createdAt: 1,
    });

  return complaints;
};

// =====================================================
// GET DEPARTMENT COMPLAINT QUEUE
// =====================================================

const getDepartmentComplaintQueue = async (departmentId) => {
  if (!departmentId) {
    return [];
  }

  const complaints = await Complaint.find({
    department: departmentId,

    // Show everything except closed complaints
    status: {
      $nin: ["CLOSED"],
    },
  })
    .populate("citizen", "name email phoneNumber")
    .populate("assignedOfficer", "name email")
    .sort({
      "priority.score": -1,
      createdAt: 1,
    });

  return complaints;
};

// =====================================================
// EXPORT SERVICES
// =====================================================

module.exports = {
  findDepartmentByName,
  getDepartmentPriorityQueue,
  getDepartmentComplaintQueue,
};