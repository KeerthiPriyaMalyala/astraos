const express = require("express");

const {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  getCitizenDashboard,
  verifyComplaint,
  reopenComplaint,
  closeComplaint,
  rateComplaint,
} = require("../controllers/complaint.controller");

const {
  protect,
} = require("../middleware/auth.middleware");

const {
  complaintUpload,
} = require("../middleware/upload.middleware");

const router = express.Router();

// =====================================================
// CREATE COMPLAINT
// POST /api/complaints
// CITIZEN ONLY
// =====================================================

router.post(
  "/",
  protect,
  complaintUpload.single("image"),
  createComplaint
);

// =====================================================
// GET MY COMPLAINTS
// GET /api/complaints/my
// CITIZEN ONLY
// =====================================================

router.get(
  "/my",
  protect,
  getMyComplaints
);

// =====================================================
// GET CITIZEN DASHBOARD
// GET /api/complaints/dashboard
// CITIZEN ONLY
// =====================================================

router.get(
  "/dashboard",
  protect,
  getCitizenDashboard
);

// =====================================================
// VERIFY RESOLVED COMPLAINT
// POST /api/complaints/:complaintId/verify
// CITIZEN ONLY
// =====================================================

router.post(
  "/:complaintId/verify",
  protect,
  verifyComplaint
);

// =====================================================
// REOPEN RESOLVED COMPLAINT
// POST /api/complaints/:complaintId/reopen
// CITIZEN ONLY
// =====================================================

router.post(
  "/:complaintId/reopen",
  protect,
  reopenComplaint
);

// =====================================================
// CLOSE VERIFIED COMPLAINT
// POST /api/complaints/:complaintId/close
// CITIZEN ONLY
// =====================================================

router.post(
  "/:complaintId/close",
  protect,
  closeComplaint
);

// =====================================================
// RATE COMPLAINT
// POST /api/complaints/:complaintId/rating
// CITIZEN ONLY
// =====================================================

router.post(
  "/:complaintId/rating",
  protect,
  rateComplaint
);

// =====================================================
// GET SINGLE COMPLAINT
// GET /api/complaints/:id
// CITIZEN ONLY
// =====================================================

router.get(
  "/:id",
  protect,
  getComplaintById
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;