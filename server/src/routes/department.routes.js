const express = require("express");

const {
  getMyDepartmentPriorityQueue,
  getMyDepartmentComplaints,
  assignComplaintToOfficer,
   getDepartmentOfficers,
     getDepartmentDashboard,
} = require("../controllers/department.controller");

const {
  protect,
  requireRole,
} = require("../middleware/auth.middleware");

const router = express.Router();

// =====================================================
// GET MY DEPARTMENT PRIORITY QUEUE
// DEPARTMENT HEAD ONLY
// =====================================================

router.get(
  "/my/queue",
  protect,
  requireRole("DEPARTMENT_HEAD"),
  getMyDepartmentPriorityQueue
);



// =====================================================
// GET MY DEPARTMENT COMPLAINTS
// DEPARTMENT HEAD ONLY
// =====================================================

router.get(
  "/my/complaints",
  protect,
  requireRole("DEPARTMENT_HEAD"),
  getMyDepartmentComplaints
);

// =====================================================
// GET DEPARTMENT OFFICERS
// DEPARTMENT HEAD ONLY
// =====================================================

router.get(
  "/officers",
  protect,
  requireRole("DEPARTMENT_HEAD"),
  getDepartmentOfficers
);

// =====================================================
// ASSIGN COMPLAINT TO OFFICER
// DEPARTMENT HEAD ONLY
// =====================================================


// =====================================================
// GET DEPARTMENT DASHBOARD
// DEPARTMENT HEAD ONLY
// =====================================================

router.get(
  "/dashboard",
  protect,
  requireRole("DEPARTMENT_HEAD"),
  getDepartmentDashboard
);

router.put(
  "/complaints/:complaintId/assign",
  protect,
  requireRole("DEPARTMENT_HEAD"),
  assignComplaintToOfficer
);



module.exports = router;