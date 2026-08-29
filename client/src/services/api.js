





import api from "../api/axios";

/*
# AstraOS API Service

This file contains reusable API helpers.

IMPORTANT:

- axios.js is responsible for:
  • Base URL
  • JWT token
  • Request interceptor
  • Authentication error handling

- complaintService.js is responsible for:
  • Complaint-specific API calls
*/

// ============================================================
// AUTHENTICATION
// Backend: /api/auth
// ============================================================

export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

// ============================================================
// PROFILE
// Backend: /api/profile
// ============================================================

export const getProfile = async () => {
  const response = await api.get("/profile");
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.put("/profile", profileData);
  return response.data;
};

// ============================================================
// DEPARTMENTS
// Backend: /api/departments
// ============================================================

export const getDepartments = async () => {
  const response = await api.get("/departments");
  return response.data;
};

// ============================================================
// ADMIN
// Backend: /api/admin
// ============================================================

export const getAdminDashboard = async () => {
  const response = await api.get("/admin/dashboard");
  return response.data;
};

// ============================================================
// OFFICER
// Backend: /api/officer
// ============================================================

export const getOfficerDashboard = async () => {
  const response = await api.get("/officer/dashboard");
  return response.data;
};

// ============================================================
// HEALTH CHECK
// Backend: /api/health
// ============================================================

export const checkBackendHealth = async () => {
  const response = await api.get("/health");
  return response.data;
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default api;