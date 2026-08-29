import api from "../api/axios";

/*
|--------------------------------------------------------------------------
| ASTRAOS — COMPLAINT SERVICE
|--------------------------------------------------------------------------
|
| Backend base:
| /api/complaints
|
| This service connects the React frontend with:
|
| complaint.routes.js
| complaint.controller.js
|
|--------------------------------------------------------------------------
*/


// ============================================================
// CREATE COMPLAINT
// POST /api/complaints
// ============================================================

export const createComplaint = async (complaintData) => {
  const response = await api.post(
    "/complaints",
    complaintData
  );

  return response.data;
};


// ============================================================
// GET MY COMPLAINTS
// GET /api/complaints/my
// ============================================================

export const getMyComplaints = async () => {
  const response = await api.get(
    "/complaints/my"
  );

  return response.data;
};


// ============================================================
// GET SINGLE COMPLAINT
// GET /api/complaints/:id
// ============================================================

export const getComplaintById = async (complaintId) => {
  const response = await api.get(
    `/complaints/${complaintId}`
  );

  return response.data;
};


// ============================================================
// GET CITIZEN DASHBOARD
// GET /api/complaints/dashboard
// ============================================================

export const getCitizenDashboard = async () => {
  const response = await api.get(
    "/complaints/dashboard"
  );

  return response.data;
};


// ============================================================
// VERIFY RESOLVED COMPLAINT
// POST /api/complaints/:complaintId/verify
// ============================================================

export const verifyComplaint = async (complaintId) => {
  const response = await api.post(
    `/complaints/${complaintId}/verify`
  );

  return response.data;
};


// ============================================================
// REOPEN RESOLVED COMPLAINT
// POST /api/complaints/:complaintId/reopen
// ============================================================

export const reopenComplaint = async (complaintId) => {
  const response = await api.post(
    `/complaints/${complaintId}/reopen`
  );

  return response.data;
};


// ============================================================
// CLOSE VERIFIED COMPLAINT
// POST /api/complaints/:complaintId/close
// ============================================================

export const closeComplaint = async (complaintId) => {
  const response = await api.post(
    `/complaints/${complaintId}/close`
  );

  return response.data;
};


// ============================================================
// RATE COMPLAINT
// POST /api/complaints/:complaintId/rating
// ============================================================

export const rateComplaint = async (
  complaintId,
  ratingData
) => {
  const response = await api.post(
    `/complaints/${complaintId}/rating`,
    ratingData
  );

  return response.data;
};