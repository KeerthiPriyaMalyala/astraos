const express = require("express");

const {
    getMyAssignedComplaints,
    getAssignedComplaintById,
  acceptComplaint,
  startComplaintWork,
   updateComplaintProgress,
   resolveComplaint,
} = require("../controllers/officer.controller");

const {
  protect,
  requireRole,
} = require("../middleware/auth.middleware");

const router = express.Router();

// =====================================================
// ACCEPT ASSIGNED COMPLAINT
// OFFICER ONLY
// =====================================================

router.post(
  "/complaints/:complaintId/accept",
  protect,
  requireRole("OFFICER"),
  acceptComplaint
);


// =====================================================
// START WORK ON COMPLAINT
// OFFICER ONLY
// =====================================================

router.post(
  "/complaints/:complaintId/start",
  protect,
  requireRole("OFFICER"),
  startComplaintWork
);

// =====================================================
// UPDATE COMPLAINT PROGRESS
// OFFICER ONLY
// =====================================================

router.post(
  "/complaints/:complaintId/progress",
  protect,
  requireRole("OFFICER"),
  updateComplaintProgress
);


// =====================================================
// RESOLVE COMPLAINT
// OFFICER ONLY
// =====================================================

router.post(
  "/complaints/:complaintId/resolve",
  protect,
  requireRole("OFFICER"),
  resolveComplaint
);


// =====================================================
// GET MY ASSIGNED COMPLAINTS
// OFFICER ONLY
// =====================================================

router.get(
  "/complaints",
  protect,
  requireRole("OFFICER"),
  getMyAssignedComplaints
);



// =====================================================
// GET SINGLE ASSIGNED COMPLAINT
// OFFICER ONLY
// =====================================================

router.get(
  "/complaints/:complaintId",
  protect,
  requireRole("OFFICER"),
  getAssignedComplaintById
);



module.exports = router;