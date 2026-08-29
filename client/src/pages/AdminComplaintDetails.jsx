
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Brain,
  Building2,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Image as ImageIcon,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  ShieldAlert,
  User,
} from "lucide-react";

import api from "../api/axios";

const AdminComplaintDetails = () => {
  const { id } = useParams();

  const [complaint, setComplaint] = useState(null);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [departmentLoading, setDepartmentLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const [selectedDepartment, setSelectedDepartment] =
    useState("");

  // =====================================================
  // FORMAT LABEL
  // =====================================================

  const formatLabel = (value) => {
    if (!value) return "Unknown";

    return String(value)
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "Unknown";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // FORMAT DATE + TIME
  // =====================================================

  const formatDateTime = (date) => {
    if (!date) return "Unknown";

    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // =====================================================
  // GET BACKEND BASE URL
  // =====================================================
  // Example:
  // VITE_API_BASE_URL = http://localhost:5000/api
  //
  // Image path:
  // uploads/complaints/example.jpg
  //
  // Final image URL:
  // http://localhost:5000/uploads/complaints/example.jpg
  // =====================================================

  const getBackendBaseUrl = () => {
    const baseURL =
      api?.defaults?.baseURL ||
      import.meta.env.VITE_API_BASE_URL ||
      "http://localhost:5000/api";

    return baseURL.replace(/\/api\/?$/, "");
  };

  // =====================================================
  // BUILD MEDIA URL
  // =====================================================

  const getMediaUrl = (value) => {
    if (!value) return null;

    // If backend somehow returns an object
    if (typeof value === "object") {
      value =
        value.url ||
        value.path ||
        value.imageUrl ||
        value.secure_url ||
        value.src ||
        null;
    }

    if (!value || typeof value !== "string") {
      return null;
    }

    const cleanValue = value.trim();

    if (!cleanValue) {
      return null;
    }

    // Already a complete URL
    if (
      cleanValue.startsWith("http://") ||
      cleanValue.startsWith("https://") ||
      cleanValue.startsWith("blob:") ||
      cleanValue.startsWith("data:")
    ) {
      return cleanValue;
    }

    const backendBaseUrl = getBackendBaseUrl();

    // Remove accidental leading slash
    const normalizedPath = cleanValue.replace(/^\/+/, "");

    // If backend path already starts with uploads/
    if (normalizedPath.startsWith("uploads/")) {
      return `${backendBaseUrl}/${normalizedPath}`;
    }

    // If backend path is something like /uploads/...
    if (normalizedPath.startsWith("api/uploads/")) {
      return `${backendBaseUrl}/${normalizedPath.replace(
        /^api\//,
        ""
      )}`;
    }

    // Generic relative media path
    return `${backendBaseUrl}/${normalizedPath}`;
  };

  // =====================================================
  // PRIORITY STYLE
  // =====================================================

  const getPriorityStyle = (level) => {
    switch (level) {
      case "CRITICAL":
        return "bg-red-50 text-red-700 border-red-200";

      case "HIGH":
        return "bg-orange-50 text-orange-700 border-orange-200";

      case "MEDIUM":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";

      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  // =====================================================
  // STATUS STYLE
  // =====================================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "ASSIGNED":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "ACCEPTED":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";

      case "WORK_STARTED":
        return "bg-purple-50 text-purple-700 border-purple-200";

      case "WORK_50_PERCENT":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";

      case "RESOLVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "CITIZEN_VERIFIED":
        return "bg-green-50 text-green-700 border-green-200";

      case "CLOSED":
        return "bg-slate-100 text-slate-700 border-slate-200";

      case "PENDING_ASSIGNMENT":
        return "bg-orange-50 text-orange-700 border-orange-200";

      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // =====================================================
  // FETCH COMPLAINT
  // =====================================================

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/admin/complaints/${id}`
      );

      const data = response.data;

      console.log(
        "📄 [AstraOS] ADMIN COMPLAINT:",
        data.data
      );

      if (!data.success) {
        throw new Error(
          data.message || "Failed to load complaint"
        );
      }

      const complaintData = data.data?.complaint;

      setComplaint(complaintData);

      if (complaintData?.department?._id) {
        setSelectedDepartment(
          complaintData.department._id
        );
      } else {
        setSelectedDepartment("");
      }
    } catch (err) {
      console.error(
        "❌ [AstraOS] Admin complaint details error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load complaint."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH DEPARTMENTS
  // =====================================================

  const fetchDepartments = async () => {
    try {
      setDepartmentLoading(true);

      const response = await api.get(
        "/admin/departments"
      );

      if (response.data.success) {
        setDepartments(
          response.data.data?.departments || []
        );
      }
    } catch (err) {
      console.error(
        "❌ [AstraOS] Departments error:",
        err
      );
    } finally {
      setDepartmentLoading(false);
    }
  };

  // =====================================================
  // INITIAL FETCH
  // =====================================================

  useEffect(() => {
    if (!id) return;

    fetchComplaint();
    fetchDepartments();
  }, [id]);

  // =====================================================
  // REASSIGN DEPARTMENT
  // =====================================================

  const handleReassignDepartment = async () => {
    if (!selectedDepartment) {
      setActionMessage(
        "Please select a department."
      );
      return;
    }

    if (
      complaint?.department?._id ===
      selectedDepartment
    ) {
      setActionMessage(
        "Complaint is already assigned to this department."
      );
      return;
    }

    try {
      setActionLoading(true);
      setActionMessage("");
      setError("");

      const response = await api.patch(
        `/admin/complaints/${id}/department`,
        {
          departmentId: selectedDepartment,
        }
      );

      const data = response.data;

      if (!data.success) {
        throw new Error(
          data.message ||
            "Failed to reassign complaint"
        );
      }

      setActionMessage(
        "Complaint reassigned successfully."
      );

      await fetchComplaint();
    } catch (err) {
      console.error(
        "❌ [AstraOS] Reassign complaint error:",
        err
      );

      setActionMessage(
        err.response?.data?.message ||
          err.message ||
          "Unable to reassign complaint."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // CLOSE COMPLAINT
  // =====================================================

  const handleCloseComplaint = async () => {
    if (!complaint) return;

    if (complaint.status !== "CITIZEN_VERIFIED") {
      setActionMessage(
        "Only citizen-verified complaints can be closed."
      );
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to officially close this complaint?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setActionMessage("");
      setError("");

      const response = await api.post(
        `/admin/complaints/${id}/close`
      );

      const data = response.data;

      if (!data.success) {
        throw new Error(
          data.message ||
            "Failed to close complaint"
        );
      }

      setActionMessage(
        "Complaint officially closed successfully."
      );

      setComplaint(
        data.data?.complaint || complaint
      );
    } catch (err) {
      console.error(
        "❌ [AstraOS] Close complaint error:",
        err
      );

      setActionMessage(
        err.response?.data?.message ||
          err.message ||
          "Unable to close complaint."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin" />

          <span>
            Loading complaint...
          </span>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error && !complaint) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="max-w-5xl mx-auto">

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

            <div className="flex items-start gap-3">

              <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />

              <div>

                <h2 className="font-semibold text-red-800">
                  Unable to load complaint
                </h2>

                <p className="text-sm text-red-700 mt-1">
                  {error}
                </p>

                <div className="flex flex-wrap gap-3 mt-4">

                  <button
                    onClick={fetchComplaint}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try again
                  </button>

                  <Link
                    to="/admin/complaints"
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to complaints
                  </Link>

                </div>

              </div>

            </div>

          </div>

        </div>
      </div>
    );
  }

  if (!complaint) return null;

  // =====================================================
  // DATA
  // =====================================================

  const citizen = complaint.citizen;
  const department = complaint.department;
  const officer = complaint.assignedOfficer;

  const canClose =
    complaint.status === "CITIZEN_VERIFIED";

  const canReassign =
    complaint.status === "PENDING_ASSIGNMENT" ||
    complaint.status === "ASSIGNED";

  // =====================================================
  // COMPLAINT IMAGE
  // =====================================================

  const getImageValue = (image) => {
    if (!image) return null;

    if (typeof image === "string") {
      return image;
    }

    return (
      image.url ||
      image.path ||
      image.imageUrl ||
      image.secure_url ||
      image.src ||
      null
    );
  };

  const complaintImage = getMediaUrl(
    getImageValue(complaint.image) ||
      getImageValue(complaint.imageUrl) ||
      getImageValue(complaint.images?.[0])
  );

  // =====================================================
  // VISION DATA
  // =====================================================

  const vision =
    complaint.visionAnalysis ||
    complaint.visionAI ||
    complaint.vision ||
    null;

  const detections =
    vision?.detections ||
    vision?.detectedIssues ||
    [];

  // =====================================================
  // VISION ANNOTATED IMAGE
  // =====================================================

  const annotatedVisionImage = getMediaUrl(
    vision?.annotatedImageUrl ||
      vision?.annotatedImage ||
      vision?.annotated_image ||
      vision?.image
  );

  // =====================================================
  // DUPLICATE DATA
  // =====================================================

  const duplicate =
    complaint.duplicateDetection ||
    complaint.duplicate ||
    complaint.duplicateInfo ||
    null;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* =================================================
            BACK
        ================================================= */}

        <div className="mb-6">

          <Link
            to="/admin/complaints"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />

            Back to complaints
          </Link>

        </div>

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-6">

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

            <div className="min-w-0">

              <p className="text-sm font-semibold text-blue-600 mb-2">
                AstraOS Administration
              </p>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                {complaint.title ||
                  "Untitled Complaint"}
              </h1>

              <p className="text-sm text-slate-500 mt-2 break-all">
                Complaint ID: {complaint._id}
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-4">

                <span
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                    complaint.status
                  )}`}
                >
                  {formatLabel(
                    complaint.status
                  )}
                </span>

                <span
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${getPriorityStyle(
                    complaint.priority?.level
                  )}`}
                >
                  {formatLabel(
                    complaint.priority?.level
                  )}{" "}
                  Priority
                </span>

                <span className="rounded-full bg-blue-50 text-blue-700 px-3 py-1.5 text-xs font-semibold">
                  {formatLabel(
                    complaint.category
                  )}
                </span>

              </div>

            </div>

            <div className="flex flex-wrap gap-2">

              <button
                onClick={fetchComplaint}
                disabled={
                  loading ||
                  actionLoading
                }
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />

                Refresh
              </button>

              {canClose && (
                <button
                  onClick={
                    handleCloseComplaint
                  }
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}

                  Close Complaint
                </button>
              )}

            </div>

          </div>

        </section>

        {/* =================================================
            ACTION MESSAGE
        ================================================= */}

        {actionMessage && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            {actionMessage}
          </div>
        )}

        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* =================================================
              LEFT
          ================================================= */}

          <div className="lg:col-span-2 space-y-6">

            {/* =================================================
                COMPLAINT IMAGE
            ================================================= */}

            {complaintImage && (
              <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                <div className="p-6 pb-4">

                  <div className="flex items-center gap-2">

                    <ImageIcon className="w-5 h-5 text-blue-600" />

                    <div>

                      <h2 className="text-lg font-bold text-slate-900">
                        Complaint Image
                      </h2>

                      <p className="text-xs text-slate-400 mt-1">
                        Image submitted by the citizen
                      </p>

                    </div>

                  </div>

                </div>

                <div className="px-6 pb-6">

                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">

                    <img
                      src={complaintImage}
                      alt={
                        complaint.title ||
                        "Complaint"
                      }
                      className="w-full max-h-[500px] object-contain"
                      onError={(event) => {
                        console.error(
                          "❌ [AstraOS] Complaint image failed to load:",
                          complaintImage
                        );

                        event.currentTarget.style.display =
                          "none";

                        const parent =
                          event.currentTarget.parentElement;

                        if (parent) {
                          parent.innerHTML = `
                            <div class="min-h-[250px] flex flex-col items-center justify-center p-8 text-center">
                              <div class="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
                                <span class="text-2xl">🖼️</span>
                              </div>
                              <p class="text-sm font-semibold text-slate-700">
                                Unable to display complaint image
                              </p>
                              <p class="text-xs text-slate-400 mt-2 break-all">
                                ${complaintImage}
                              </p>
                            </div>
                          `;
                        }
                      }}
                    />

                  </div>

                </div>

              </section>
            )}

            {/* =================================================
                COMPLAINT DETAILS
            ================================================= */}

            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

              <SectionHeader
                icon={
                  <FileText className="w-5 h-5" />
                }
                title="Complaint Information"
                subtitle="Basic complaint details"
              />

              <div className="space-y-5">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                    Description
                  </p>

                  <p className="text-sm leading-7 text-slate-700 whitespace-pre-wrap">
                    {complaint.description ||
                      "No description provided."}
                  </p>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                  <InfoItem
                    label="Category"
                    value={
                      formatLabel(
                        complaint.category
                      )
                    }
                  />

                  <InfoItem
                    label="Created"
                    value={formatDateTime(
                      complaint.createdAt
                    )}
                  />

                  <InfoItem
                    label="Priority Level"
                    value={
                      complaint.priority
                        ?.level || "Unknown"
                    }
                  />

                  <InfoItem
                    label="Priority Score"
                    value={
                      complaint.priority
                        ?.score ?? 0
                    }
                  />

                  <InfoItem
                    label="Status"
                    value={formatLabel(
                      complaint.status
                    )}
                  />

                  <InfoItem
                    label="Complaint ID"
                    value={complaint._id}
                  />

                </div>

                {complaint.priority?.reason && (
                  <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">

                    <div className="flex items-center gap-2">

                      <ShieldAlert className="w-4 h-4 text-orange-600" />

                      <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
                        Priority Reason
                      </p>

                    </div>

                    <p className="text-sm text-orange-800 mt-2 leading-6">
                      {complaint.priority.reason}
                    </p>

                  </div>
                )}

              </div>

            </section>

            {/* =================================================
                LOCATION
            ================================================= */}

            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

              <SectionHeader
                icon={
                  <MapPin className="w-5 h-5" />
                }
                title="Location"
                subtitle="Complaint location information"
              />

              <div className="space-y-5">

                <InfoItem
                  label="Address"
                  value={
                    complaint.location
                      ?.address ||
                    complaint.address ||
                    "Not provided"
                  }
                />

                <InfoItem
                  label="Landmark"
                  value={
                    complaint.location
                      ?.landmark ||
                    "Not provided"
                  }
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                  <InfoItem
                    label="Latitude"
                    value={
                      complaint.location
                        ?.latitude ??
                      "Not provided"
                    }
                  />

                  <InfoItem
                    label="Longitude"
                    value={
                      complaint.location
                        ?.longitude ??
                      "Not provided"
                    }
                  />

                </div>

              </div>

            </section>

            {/* =================================================
                AI ANALYSIS
            ================================================= */}

            {complaint.aiAnalysis && (
              <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

                <SectionHeader
                  icon={
                    <Brain className="w-5 h-5" />
                  }
                  title="AI Analysis"
                  subtitle="AstraOS intelligence analysis"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                  <InfoItem
                    label="AI Category"
                    value={
                      complaint.aiAnalysis.category ||
                      "Not available"
                    }
                  />

                  <InfoItem
                    label="Recommended Department"
                    value={
                      complaint.aiAnalysis.department ||
                      complaint.aiAnalysis.recommendedDepartment ||
                      "Not available"
                    }
                  />

                  <InfoItem
                    label="AI Severity"
                    value={
                      complaint.aiAnalysis.severity !=
                      null
                        ? `${complaint.aiAnalysis.severity}/10`
                        : "Not available"
                    }
                  />

                  <InfoItem
                    label="AI Confidence"
                    value={
                      complaint.aiAnalysis.confidence !=
                      null
                        ? `${Math.round(
                            complaint.aiAnalysis
                              .confidence * 100
                          )}%`
                        : "Not available"
                    }
                  />

                  <InfoItem
                    label="Model"
                    value={
                      complaint.aiAnalysis.model ||
                      "Not available"
                    }
                  />

                  <InfoItem
                    label="Analyzed At"
                    value={formatDateTime(
                      complaint.aiAnalysis.analyzedAt
                    )}
                  />

                </div>

                {complaint.aiAnalysis.summary && (
                  <div className="mt-5 rounded-xl bg-slate-50 border border-slate-200 p-4">

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      AI Summary
                    </p>

                    <p className="text-sm text-slate-700 mt-2 leading-6">
                      {complaint.aiAnalysis.summary}
                    </p>

                  </div>
                )}

                {complaint.aiAnalysis.suggestedAction && (
                  <div className="mt-4 rounded-xl bg-blue-50 border border-blue-100 p-4">

                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                      Suggested Action
                    </p>

                    <p className="text-sm text-blue-900 mt-2 leading-6">
                      {complaint.aiAnalysis.suggestedAction}
                    </p>

                  </div>
                )}

              </section>
            )}

            {/* =================================================
                VISION AI
            ================================================= */}

            {vision && (
              <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

                <SectionHeader
                  icon={
                    <Eye className="w-5 h-5" />
                  }
                  title="Vision AI Analysis"
                  subtitle="Computer vision detection results"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

                  <InfoItem
                    label="Detected Issues"
                    value={
                      vision.detectedCount ??
                      vision.detectionCount ??
                      vision.issueCount ??
                      detections.length
                    }
                  />

                  <InfoItem
                    label="Overall Severity"
                    value={
                      vision.overallSeverity ||
                      vision.severity ||
                      "Not available"
                    }
                  />

                  <InfoItem
                    label="Detection Confidence"
                    value={
                      vision.confidence != null
                        ? `${Math.round(
                            vision.confidence * 100
                          )}%`
                        : vision.detectionConfidence !=
                          null
                        ? `${Math.round(
                            vision.detectionConfidence *
                              100
                          )}%`
                        : "Not available"
                    }
                  />

                </div>

                {detections.length > 0 && (
                  <div className="mt-6">

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
                      Detected Issues
                    </p>

                    <div className="space-y-3">

                      {detections.map(
                        (detection, index) => (
                          <div
                            key={index}
                            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                          >

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                              <div>

                                <p className="text-sm font-semibold text-slate-800">
                                  {index + 1}.{" "}
                                  {formatLabel(
                                    detection.class ||
                                      detection.label ||
                                      detection.object ||
                                      "Detected issue"
                                  )}
                                </p>

                              </div>

                              <div className="flex flex-wrap gap-2">

                                {detection.confidence !=
                                  null && (
                                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                    {Math.round(
                                      detection.confidence *
                                        100
                                    )}
                                    %
                                  </span>
                                )}

                                {detection.severity && (
                                  <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                                    {formatLabel(
                                      detection.severity
                                    )}
                                  </span>
                                )}

                              </div>

                            </div>

                          </div>
                        )
                      )}

                    </div>

                  </div>
                )}

                {vision.primaryDetection && (
                  <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Primary Detection
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">

                      <InfoItem
                        label="Detected Object"
                        value={
                          vision.primaryDetection
                            .class ||
                          vision.primaryDetection
                            .label ||
                          vision.primaryDetection
                            .object
                        }
                      />

                      <InfoItem
                        label="Confidence"
                        value={
                          vision.primaryDetection
                            .confidence != null
                            ? `${Math.round(
                                vision
                                  .primaryDetection
                                  .confidence * 100
                              )}%`
                            : "Not available"
                        }
                      />

                      <InfoItem
                        label="Severity"
                        value={
                          vision.primaryDetection
                            .severity ||
                          "Not available"
                        }
                      />

                    </div>

                  </div>
                )}

                {/* =================================================
                    ANNOTATED VISION IMAGE
                ================================================= */}

                {annotatedVisionImage && (
                  <div className="mt-5">

                    <div className="flex items-center justify-between mb-3">

                      <div>

                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Annotated Vision Result
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          Computer vision detection output
                        </p>

                      </div>

                      <Eye className="w-4 h-4 text-slate-400" />

                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100">

                      <img
                        src={annotatedVisionImage}
                        alt="Annotated vision result"
                        className="w-full max-h-[500px] object-contain"
                        onError={(event) => {
                          console.error(
                            "❌ [AstraOS] Annotated image failed to load:",
                            annotatedVisionImage
                          );

                          event.currentTarget.style.display =
                            "none";

                          const parent =
                            event.currentTarget.parentElement;

                          if (parent) {
                            parent.innerHTML = `
                              <div class="min-h-[250px] flex flex-col items-center justify-center p-8 text-center">
                                <div class="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
                                  <span class="text-2xl">🔍</span>
                                </div>
                                <p class="text-sm font-semibold text-slate-700">
                                  Unable to display annotated image
                                </p>
                                <p class="text-xs text-slate-400 mt-2 break-all">
                                  ${annotatedVisionImage}
                                </p>
                              </div>
                            `;
                          }
                        }}
                      />

                    </div>

                  </div>
                )}

                {vision.analyzedAt && (
                  <p className="text-xs text-slate-400 mt-4">
                    Vision analysis completed{" "}
                    {formatDateTime(
                      vision.analyzedAt
                    )}
                  </p>
                )}

              </section>
            )}

            {/* =================================================
                DUPLICATE DETECTION
            ================================================= */}

            {duplicate && (
              <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

                <SectionHeader
                  icon={
                    <RefreshCw className="w-5 h-5" />
                  }
                  title="Duplicate Detection"
                  subtitle="AstraOS similarity analysis"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

                  <InfoItem
                    label="Duplicate Detected"
                    value={
                      duplicate.isDuplicate ??
                      duplicate.detected ??
                      duplicate.duplicateDetected
                        ? "Yes"
                        : "No"
                    }
                  />

                  <InfoItem
                    label="Similarity Score"
                    value={
                      duplicate.similarityScore !=
                      null
                        ? `${Math.round(
                            duplicate.similarityScore <=
                              1
                              ? duplicate.similarityScore *
                                  100
                              : duplicate.similarityScore
                          )}%`
                        : "Not available"
                    }
                  />

                  <InfoItem
                    label="Duplicate Of"
                    value={
                      duplicate.duplicateOf ||
                      duplicate.originalComplaintId ||
                      "None"
                    }
                  />

                </div>

                {(duplicate.isDuplicate ||
                  duplicate.detected ||
                  duplicate.duplicateDetected) && (
                  <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4">

                    <p className="text-sm font-semibold text-orange-800">
                      Similar complaint detected
                    </p>

                    <p className="text-sm text-orange-700 mt-1">
                      This complaint may represent the same
                      civic issue already reported in AstraOS.
                    </p>

                  </div>
                )}

              </section>
            )}

            {/* =================================================
                TIMELINE
            ================================================= */}

            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

              <SectionHeader
                icon={
                  <Clock3 className="w-5 h-5" />
                }
                title="Complaint Timeline"
                subtitle="Complete complaint lifecycle"
              />

              {!complaint.timeline?.length ? (
                <p className="text-sm text-slate-500">
                  No timeline entries available.
                </p>
              ) : (
                <div className="space-y-5">

                  {complaint.timeline.map(
                    (entry, index) => (
                      <div
                        key={`${entry.timestamp}-${index}`}
                        className="flex gap-4"
                      >

                        <div className="flex flex-col items-center">

                          <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">

                            <CheckCircle2 className="w-4 h-4" />

                          </div>

                          {index !==
                            complaint.timeline.length -
                              1 && (
                            <div className="w-px flex-1 bg-slate-200 mt-2" />
                          )}

                        </div>

                        <div className="pb-2 min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            <p className="font-semibold text-slate-800">
                              {formatLabel(
                                entry.status
                              )}
                            </p>

                            {entry.actor && (
                              <span className="text-xs rounded-full bg-slate-100 px-2 py-1 text-slate-500">
                                {entry.actor}
                              </span>
                            )}

                          </div>

                          <p className="text-sm text-slate-600 mt-1">
                            {entry.message ||
                              "Status updated."}
                          </p>

                          <p className="text-xs text-slate-400 mt-2">
                            {formatDateTime(
                              entry.timestamp
                            )}
                          </p>

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

            </section>

          </div>

          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <div className="space-y-6">

            {/* =================================================
                PRIORITY
            ================================================= */}

            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

              <SectionHeader
                icon={
                  <ShieldAlert className="w-5 h-5" />
                }
                title="Priority"
                subtitle="AstraOS priority assessment"
              />

              <div className="text-center rounded-2xl bg-slate-50 border border-slate-200 p-5">

                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Priority Score
                </p>

                <p className="text-4xl font-bold text-slate-900 mt-2">
                  {complaint.priority?.score ??
                    0}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  out of 100
                </p>

                <span
                  className={`inline-flex mt-4 rounded-full border px-3 py-1.5 text-xs font-semibold ${getPriorityStyle(
                    complaint.priority?.level
                  )}`}
                >
                  {complaint.priority?.level ||
                    "LOW"}
                </span>

              </div>

            </section>

            {/* =================================================
                CITIZEN
            ================================================= */}

            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

              <SectionHeader
                icon={
                  <User className="w-5 h-5" />
                }
                title="Citizen"
                subtitle="Complaint submitted by"
              />

              <div className="space-y-4">

                <InfoItem
                  label="Name"
                  value={
                    citizen?.name ||
                    "Unknown"
                  }
                />

                <div className="flex items-start gap-3">

                  <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />

                  <div className="min-w-0">

                    <p className="text-xs text-slate-400">
                      Email
                    </p>

                    <p className="text-sm text-slate-700 break-all mt-1">
                      {citizen?.email ||
                        "Not available"}
                    </p>

                  </div>

                </div>

                {citizen?.phoneNumber && (
                  <div className="flex items-start gap-3">

                    <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />

                    <div>

                      <p className="text-xs text-slate-400">
                        Phone
                      </p>

                      <p className="text-sm text-slate-700 mt-1">
                        {citizen.phoneNumber}
                      </p>

                    </div>

                  </div>
                )}

              </div>

            </section>

            {/* =================================================
                DEPARTMENT
            ================================================= */}

            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

              <SectionHeader
                icon={
                  <Building2 className="w-5 h-5" />
                }
                title="Department"
                subtitle="Responsible department"
              />

              {department ? (
                <div className="rounded-xl bg-slate-50 p-4 mb-5">

                  <p className="font-semibold text-slate-800">
                    {department.name}
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    {department.code}
                  </p>

                </div>
              ) : (
                <div className="rounded-xl bg-orange-50 p-4 mb-5">

                  <p className="text-sm font-semibold text-orange-700">
                    No department assigned
                  </p>

                </div>
              )}

              {canReassign && (
                <div>

                  <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                    Reassign Department
                  </label>

                  <select
                    value={
                      selectedDepartment
                    }
                    onChange={(e) =>
                      setSelectedDepartment(
                        e.target.value
                      )
                    }
                    disabled={
                      departmentLoading ||
                      actionLoading
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:bg-slate-50"
                  >

                    <option value="">
                      {departmentLoading
                        ? "Loading departments..."
                        : "Select department"}
                    </option>

                    {departments
                      .filter(
                        (item) =>
                          item.isActive
                      )
                      .map((item) => (
                        <option
                          key={item._id}
                          value={item._id}
                        >
                          {item.name} (
                          {item.code})
                        </option>
                      ))}

                  </select>

                  <button
                    onClick={
                      handleReassignDepartment
                    }
                    disabled={
                      actionLoading ||
                      departmentLoading ||
                      !selectedDepartment
                    }
                    className="w-full mt-3 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Building2 className="w-4 h-4" />
                    )}

                    Reassign Department

                  </button>

                  <p className="text-xs text-slate-400 mt-3 leading-5">
                    Reassignment is available only while
                    the complaint is pending assignment or
                    currently assigned.
                  </p>

                </div>
              )}

              {!canReassign && (
                <div className="rounded-xl bg-slate-50 p-4">

                  <p className="text-xs text-slate-500 leading-5">
                    Department reassignment is unavailable
                    at the current complaint status.
                  </p>

                </div>
              )}

            </section>

            {/* =================================================
                OFFICER
            ================================================= */}

            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

              <SectionHeader
                icon={
                  <ShieldAlert className="w-5 h-5" />
                }
                title="Assigned Officer"
                subtitle="Officer responsible for resolution"
              />

              {officer ? (
                <div className="space-y-4">

                  <InfoItem
                    label="Name"
                    value={officer.name}
                  />

                  <div className="flex items-start gap-3">

                    <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />

                    <div className="min-w-0">

                      <p className="text-xs text-slate-400">
                        Email
                      </p>

                      <p className="text-sm text-slate-700 break-all mt-1">
                        {officer.email ||
                          "Not available"}
                      </p>

                    </div>

                  </div>

                  {officer.phoneNumber && (
                    <div className="flex items-start gap-3">

                      <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />

                      <div>

                        <p className="text-xs text-slate-400">
                          Phone
                        </p>

                        <p className="text-sm text-slate-700 mt-1">
                          {officer.phoneNumber}
                        </p>

                      </div>

                    </div>
                  )}

                </div>
              ) : (
                <div className="rounded-xl bg-orange-50 p-4">

                  <p className="text-sm font-semibold text-orange-700">
                    No officer assigned
                  </p>

                  <p className="text-xs text-orange-600 mt-1">
                    This complaint is currently waiting
                    for officer assignment.
                  </p>

                </div>
              )}

            </section>

            {/* =================================================
                WORKFLOW STATUS
            ================================================= */}

            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">

              <SectionHeader
                icon={
                  <Clock3 className="w-5 h-5" />
                }
                title="Progress"
                subtitle="Current complaint lifecycle"
              />

              <ProgressStep
                label="Assigned"
                active={[
                  "ASSIGNED",
                  "ACCEPTED",
                  "WORK_STARTED",
                  "WORK_50_PERCENT",
                  "RESOLVED",
                  "CITIZEN_VERIFIED",
                  "CLOSED",
                ].includes(
                  complaint.status
                )}
              />

              <ProgressStep
                label="Accepted"
                active={[
                  "ACCEPTED",
                  "WORK_STARTED",
                  "WORK_50_PERCENT",
                  "RESOLVED",
                  "CITIZEN_VERIFIED",
                  "CLOSED",
                ].includes(
                  complaint.status
                )}
              />

              <ProgressStep
                label="Work Started"
                active={[
                  "WORK_STARTED",
                  "WORK_50_PERCENT",
                  "RESOLVED",
                  "CITIZEN_VERIFIED",
                  "CLOSED",
                ].includes(
                  complaint.status
                )}
              />

              <ProgressStep
                label="50% Progress"
                active={[
                  "WORK_50_PERCENT",
                  "RESOLVED",
                  "CITIZEN_VERIFIED",
                  "CLOSED",
                ].includes(
                  complaint.status
                )}
              />

              <ProgressStep
                label="Resolved"
                active={[
                  "RESOLVED",
                  "CITIZEN_VERIFIED",
                  "CLOSED",
                ].includes(
                  complaint.status
                )}
              />

              <ProgressStep
                label="Citizen Verified"
                active={[
                  "CITIZEN_VERIFIED",
                  "CLOSED",
                ].includes(
                  complaint.status
                )}
              />

              <ProgressStep
                label="Closed"
                active={
                  complaint.status ===
                  "CLOSED"
                }
              />

            </section>

          </div>

        </div>

      </main>
    </div>
  );
};

// =========================================================
// SECTION HEADER
// =========================================================

function SectionHeader({
  icon,
  title,
  subtitle,
}) {
  return (
    <div className="flex items-center gap-3 mb-5">

      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
        {icon}
      </div>

      <div>

        <h2 className="text-lg font-bold text-slate-900">
          {title}
        </h2>

        <p className="text-xs text-slate-400 mt-0.5">
          {subtitle}
        </p>

      </div>

    </div>
  );
}

// =========================================================
// INFO ITEM
// =========================================================

function InfoItem({ label, value }) {
  return (
    <div>

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="text-sm text-slate-700 mt-1 break-words">
        {value ?? "Not available"}
      </p>

    </div>
  );
}

// =========================================================
// PROGRESS STEP
// =========================================================

function ProgressStep({ label, active }) {
  return (
    <div className="flex items-center gap-3 mb-4 last:mb-0">

      <div
        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
          active
            ? "border-blue-500 bg-blue-500"
            : "border-slate-300 bg-white"
        }`}
      >

        {active && (
          <CheckCircle2
            size={13}
            className="text-white"
          />
        )}

      </div>

      <p
        className={`text-sm ${
          active
            ? "text-slate-800 font-medium"
            : "text-slate-400"
        }`}
      >
        {label}
      </p>

    </div>
  );
}

export default AdminComplaintDetails;

