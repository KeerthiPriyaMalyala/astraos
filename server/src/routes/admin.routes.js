const express = require("express");

const {
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



} = require("../controllers/admin.controller");

const {
  protect,
  requireRole,
} = require("../middleware/auth.middleware");

const router = express.Router();

// =====================================================
// CREATE GOVERNMENT USER
// ADMIN ONLY
// =====================================================

router.post(
  "/users",
  protect,
  requireRole("ADMIN"),
  createGovernmentUser
);

// =====================================================
// GET SINGLE GOVERNMENT USER
// ADMIN ONLY
// =====================================================

router.get(
  "/users/:userId",
  protect,
  requireRole("ADMIN"),
  getGovernmentUserById
);


// =====================================================
// UPDATE GOVERNMENT USER STATUS
// ADMIN ONLY
// =====================================================

router.patch(
  "/users/:userId/status",
  protect,
  requireRole("ADMIN"),
  updateGovernmentUserStatus
);
// =====================================================
// GET ALL COMPLAINTS
// ADMIN ONLY
// =====================================================

router.get(
  "/complaints",
  protect,
  requireRole("ADMIN"),
  getAllComplaints
);


// =====================================================
// GET ADMIN DASHBOARD
// ADMIN ONLY
// =====================================================

router.get(
  "/dashboard",
  protect,
  requireRole("ADMIN"),
  getAdminDashboard
);

// =====================================================
// 🌍 GET COMMUNITY IMPACT DASHBOARD
// ADMIN ONLY
// =====================================================

router.get(
  "/community-impact",
  protect,
  requireRole("ADMIN"),
  getCommunityImpact
);



// =====================================================
// GET ALL GOVERNMENT USERS
// ADMIN ONLY
// =====================================================

router.get(
  "/users",
  protect,
  requireRole("ADMIN"),
  getAllGovernmentUsers
);


// =====================================================
// GET COMPLAINT STATISTICS
// ADMIN ONLY
// =====================================================

router.get(
  "/complaints/stats",
  protect,
  requireRole("ADMIN"),
  getComplaintStats
);



// =====================================================
// GET SINGLE COMPLAINT
// ADMIN ONLY
// =====================================================

router.get(
  "/complaints/:complaintId",
  protect,
  requireRole("ADMIN"),
  getComplaintById
);




router.post(
  "/complaints/:complaintId/close",
  protect,
  requireRole("ADMIN"),
  closeComplaint
);

// =====================================================
// CREATE DEPARTMENT
// ADMIN ONLY
// =====================================================

router.post(
  "/departments",
  protect,
  requireRole("ADMIN"),
  createDepartment
);



// =====================================================
// GET ALL DEPARTMENTS
// ADMIN ONLY
// =====================================================

router.get(
  "/departments",
  protect,
  requireRole("ADMIN"),
  getAllDepartments
);



// =====================================================
// GET SINGLE DEPARTMENT
// ADMIN ONLY
// =====================================================

router.get(
  "/departments/:departmentId",
  protect,
  requireRole("ADMIN"),
  getDepartmentById
);


router.patch(
  "/departments/:departmentId/status",
  protect,
  requireRole("ADMIN"),
  updateDepartmentStatus
);


// =====================================================
// UPDATE DEPARTMENT
// ADMIN ONLY
// =====================================================

router.put(
  "/departments/:departmentId",
  protect,
  requireRole("ADMIN"),
  updateDepartment
);


// =====================================================
// REASSIGN COMPLAINT DEPARTMENT
// ADMIN ONLY
// =====================================================

router.patch(
  "/complaints/:complaintId/department",
  protect,
  requireRole("ADMIN"),
  reassignComplaintDepartment
);



module.exports = router;