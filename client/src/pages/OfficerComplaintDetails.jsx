
import { useEffect, useState } from "react";
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
  MapPin,
  RefreshCw,
  Repeat2,
  ShieldAlert,
  UserRound,
  Wrench,
} from "lucide-react";

import api from "../api/axios";

export default function OfficerComplaintDetails() {
  const { id } = useParams();

  const [complaint, setComplaint] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // IMAGE URL HELPER
  // =====================================================

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // Already a complete URL
    if (
      imagePath.startsWith("http://") ||
      imagePath.startsWith("https://")
    ) {
      return imagePath;
    }

    /*
     * api.defaults.baseURL is normally:
     * http://localhost:5000/api
     *
     * Uploaded files are served from:
     * http://localhost:5000/uploads/...
     */

    const baseURL = api.defaults.baseURL || "";

    const serverURL = baseURL.replace(/\/api\/?$/, "");

    const cleanPath = imagePath.replace(/^\/+/, "");

    return `${serverURL}/${cleanPath}`;
  };

  // =====================================================
  // FETCH ASSIGNED COMPLAINT
  // =====================================================

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/officer/complaints/${id}`
      );

      if (!response.data?.success) {
        setError(
          response.data?.message ||
            "Unable to load complaint details."
        );
        return;
      }

      setComplaint(
        response.data.data?.complaint || null
      );
    } catch (err) {
      console.error(
        "Officer complaint details error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load complaint details."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    if (!id) return;

    fetchComplaint();
  }, [id]);

  // =====================================================
  // ACTION HANDLER
  // =====================================================

  const handleAction = async (action) => {
    try {
      setActionLoading(true);
      setActionError("");
      setSuccess("");

      let endpoint = "";
      let body = undefined;

      switch (action) {
        case "accept":
          endpoint = `/officer/complaints/${id}/accept`;
          break;

        case "start":
          endpoint = `/officer/complaints/${id}/start`;
          break;

        case "progress":
          endpoint = `/officer/complaints/${id}/progress`;
          body = {
            progress: 50,
          };
          break;

        case "resolve":
          endpoint = `/officer/complaints/${id}/resolve`;
          break;

        default:
          return;
      }

      const response = await api.post(
        endpoint,
        body
      );

      if (!response.data?.success) {
        setActionError(
          response.data?.message ||
            "Action could not be completed."
        );
        return;
      }

      setSuccess(
        response.data.message ||
          "Complaint updated successfully."
      );

      await fetchComplaint();
    } catch (err) {
      console.error(
        "Officer complaint action error:",
        err
      );

      setActionError(
        err.response?.data?.message ||
          "Failed to update complaint."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // STATUS HELPERS
  // =====================================================

  const getPriorityStyle = (level) => {
    switch (level) {
      case "CRITICAL":
        return "border-red-500/30 bg-red-500/10 text-red-300";

      case "HIGH":
        return "border-orange-500/30 bg-orange-500/10 text-orange-300";

      case "MEDIUM":
        return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";

      default:
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "ASSIGNED":
        return "border-blue-500/30 bg-blue-500/10 text-blue-300";

      case "ACCEPTED":
        return "border-cyan-500/30 bg-cyan-500/10 text-cyan-300";

      case "WORK_STARTED":
        return "border-purple-500/30 bg-purple-500/10 text-purple-300";

      case "WORK_50_PERCENT":
        return "border-indigo-500/30 bg-indigo-500/10 text-indigo-300";

      case "RESOLVED":
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";

      case "CITIZEN_VERIFIED":
        return "border-teal-500/30 bg-teal-500/10 text-teal-300";

      case "CLOSED":
        return "border-slate-500/30 bg-slate-500/10 text-slate-300";

      default:
        return "border-slate-700 bg-slate-800/50 text-slate-300";
    }
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const formatDateTime = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const formatConfidence = (confidence) => {
    if (confidence == null) return "Not available";

    return `${Math.round(confidence * 100)}%`;
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2
            size={20}
            className="animate-spin text-blue-400"
          />

          Loading complaint details...
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
        <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center">

          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertCircle
              size={28}
              className="text-red-400"
            />
          </div>

          <h1 className="text-xl font-bold mt-5">
            Unable to load complaint
          </h1>

          <p className="text-sm text-slate-400 mt-2">
            {error ||
              "The requested complaint could not be found."}
          </p>

          <div className="flex justify-center gap-3 mt-6">

            <button
              onClick={fetchComplaint}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold hover:bg-blue-500 transition"
            >
              <RefreshCw size={16} />
              Try Again
            </button>

            <Link
              to="/officer/complaints"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              <ArrowLeft size={16} />
              Back
            </Link>

          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // ACTION AVAILABILITY
  // =====================================================

  const canAccept =
    complaint.status === "ASSIGNED";

  const canStart =
    complaint.status === "ACCEPTED";

  const canProgress =
    complaint.status === "WORK_STARTED";

  const canResolve =
    complaint.status === "WORK_50_PERCENT";

  // =====================================================
  // VISION DATA
  // =====================================================

  const vision = complaint.visionAnalysis;

  const firstDetection =
    vision?.detections?.[0];

  // =====================================================
  // DUPLICATE DATA
  // =====================================================

  const duplicate =
    complaint.duplicateInfo;

  // =====================================================
  // IMAGE URLS
  // =====================================================

  const originalImageUrl = getImageUrl(
    complaint.image
  );

  const annotatedImageUrl = getImageUrl(
    vision?.annotatedImage
  );

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-5">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div className="flex items-center gap-4">

              <Link
                to="/officer/complaints"
                className="w-10 h-10 rounded-xl border border-slate-700 bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-600 transition"
              >
                <ArrowLeft size={19} />
              </Link>

              <div>

                <p className="text-xs uppercase tracking-wider text-blue-400 font-semibold">
                  Officer Portal
                </p>

                <h1 className="text-xl font-bold mt-1">
                  Complaint Details
                </h1>

                <p className="text-sm text-slate-400 mt-1">
                  {complaint.department?.name ||
                    "Department"}

                  {complaint.department?.code
                    ? ` • ${complaint.department.code}`
                    : ""}
                </p>

              </div>

            </div>

            <button
              onClick={fetchComplaint}
              disabled={
                loading || actionLoading
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-700 transition disabled:opacity-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>

          </div>

        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* SUCCESS */}

        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 flex items-start gap-3 text-emerald-300">

            <CheckCircle2
              size={20}
              className="shrink-0 mt-0.5"
            />

            <div>
              <p className="font-semibold">
                Success
              </p>

              <p className="text-sm mt-1">
                {success}
              </p>
            </div>

          </div>
        )}

        {/* ACTION ERROR */}

        {actionError && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 flex items-start gap-3 text-red-300">

            <AlertCircle
              size={20}
              className="shrink-0 mt-0.5"
            />

            <div>
              <p className="font-semibold">
                Action Failed
              </p>

              <p className="text-sm mt-1">
                {actionError}
              </p>
            </div>

          </div>
        )}

        {/* =====================================================
            TITLE
        ===================================================== */}

        <div className="mb-7">

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

            <div className="flex-1">

              <div className="flex flex-wrap items-center gap-2 mb-3">

                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${getPriorityStyle(
                    complaint.priority?.level
                  )}`}
                >
                  <ShieldAlert
                    size={14}
                    className="mr-1.5"
                  />

                  {complaint.priority?.level ||
                    "LOW"}
                </span>

                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                    complaint.status
                  )}`}
                >
                  {formatStatus(
                    complaint.status
                  )}
                </span>

                <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-300">
                  {complaint.category ||
                    "GENERAL"}
                </span>

              </div>

              <h2 className="text-3xl font-bold">
                {complaint.title ||
                  "Untitled Complaint"}
              </h2>

              <p className="text-slate-400 mt-3 max-w-4xl">
                {complaint.description ||
                  "No description available."}
              </p>

            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-6 py-4 min-w-[160px]">

              <p className="text-xs text-slate-500">
                Priority Score
              </p>

              <p className="text-3xl font-bold mt-1">
                {complaint.priority?.score ??
                  0}
              </p>

              <p className="text-xs text-slate-500 mt-1">
                out of 100
              </p>

            </div>

          </div>

        </div>

        {/* =====================================================
            MAIN GRID
        ===================================================== */}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* =====================================================
              LEFT COLUMN
          ===================================================== */}

          <div className="xl:col-span-2 space-y-6">

            {/* =================================================
                ORIGINAL COMPLAINT IMAGE
            ================================================= */}

            {originalImageUrl && (
              <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">

                <SectionHeader
                  icon={<ImageIcon size={19} />}
                  iconClass="bg-blue-500/10 border-blue-500/20 text-blue-400"
                  title="Complaint Image"
                  subtitle="Image submitted by the citizen"
                />

                <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">

                  <img
                    src={originalImageUrl}
                    alt={
                      complaint.title ||
                      "Complaint"
                    }
                    className="w-full max-h-[520px] object-contain"
                    onError={(event) => {
                      event.currentTarget.style.display =
                        "none";
                    }}
                  />

                </div>

              </section>
            )}

            {/* =================================================
                COMPLAINT INFORMATION
            ================================================= */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">

              <SectionHeader
                icon={<FileText size={19} />}
                iconClass="bg-blue-500/10 border-blue-500/20 text-blue-400"
                title="Complaint Information"
                subtitle="Basic complaint details"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <InfoItem
                  label="Category"
                  value={complaint.category}
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
                    complaint.priority?.level ||
                    "LOW"
                  }
                />

                <InfoItem
                  label="Priority Score"
                  value={
                    complaint.priority?.score ??
                    0
                  }
                />

                <InfoItem
                  label="Status"
                  value={formatStatus(
                    complaint.status
                  )}
                />

                <InfoItem
                  label="Complaint ID"
                  value={complaint._id}
                />

              </div>

              {complaint.priority?.reason && (
                <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/50 p-4">

                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Priority Reason
                  </p>

                  <p className="text-sm text-slate-300 mt-2">
                    {complaint.priority.reason}
                  </p>

                </div>
              )}

            </section>

            {/* =================================================
                LOCATION
            ================================================= */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">

              <SectionHeader
                icon={<MapPin size={19} />}
                iconClass="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                title="Location"
                subtitle="Complaint location information"
              />

              <div className="space-y-4">

                <InfoItem
                  label="Address"
                  value={
                    complaint.location?.address ||
                    "Not provided"
                  }
                />

                <InfoItem
                  label="Landmark"
                  value={
                    complaint.location?.landmark ||
                    "Not provided"
                  }
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <InfoItem
                    label="Latitude"
                    value={
                      complaint.location?.latitude ??
                      "Not provided"
                    }
                  />

                  <InfoItem
                    label="Longitude"
                    value={
                      complaint.location?.longitude ??
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
              <section className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6">

                <SectionHeader
                  icon={<Brain size={19} />}
                  iconClass="bg-purple-500/10 border-purple-500/20 text-purple-400"
                  title="AI Analysis"
                  subtitle="AstraOS intelligence analysis"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

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
                    value={formatConfidence(
                      complaint.aiAnalysis.confidence
                    )}
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
                  <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/50 p-4">

                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      AI Summary
                    </p>

                    <p className="text-sm text-slate-300 mt-2 leading-6">
                      {complaint.aiAnalysis.summary}
                    </p>

                  </div>
                )}

                {complaint.aiAnalysis.suggestedAction && (
                  <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">

                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                      Suggested Action
                    </p>

                    <p className="text-sm text-slate-300 mt-2 leading-6">
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
              <section className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6">

                <SectionHeader
                  icon={<Eye size={19} />}
                  iconClass="bg-orange-500/10 border-orange-500/20 text-orange-400"
                  title="Vision AI Analysis"
                  subtitle="Computer vision detection results"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  <MetricCard
                    label="Detected Issues"
                    value={
                      vision.detectionCount ?? 0
                    }
                  />

                  <MetricCard
                    label="Overall Severity"
                    value={
                      vision.overallSeverity ||
                      "Not available"
                    }
                  />

                  <MetricCard
                    label="Detection Confidence"
                    value={
                      firstDetection
                        ? formatConfidence(
                            firstDetection.confidence
                          )
                        : "Not available"
                    }
                  />

                </div>

                {firstDetection && (
                  <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/50 p-5">

                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
                      Primary Detection
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                      <InfoItem
                        label="Detected Object"
                        value={
                          firstDetection.object ||
                          "Unknown"
                        }
                      />

                      <InfoItem
                        label="Confidence"
                        value={formatConfidence(
                          firstDetection.confidence
                        )}
                      />

                      <InfoItem
                        label="Severity"
                        value={
                          firstDetection.severity ||
                          "Not available"
                        }
                      />

                    </div>

                  </div>
                )}

                {vision.detections?.length > 1 && (
                  <div className="mt-5">

                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                      All Detections
                    </p>

                    <div className="space-y-2">

                      {vision.detections.map(
                        (detection, index) => (
                          <div
                            key={`${detection.object}-${index}`}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950/50 p-4"
                          >

                            <div>
                              <p className="text-sm font-semibold text-slate-200">
                                {detection.object ||
                                  "Unknown object"}
                              </p>

                              <p className="text-xs text-slate-500 mt-1">
                                Confidence:{" "}
                                {formatConfidence(
                                  detection.confidence
                                )}
                              </p>
                            </div>

                            <span className="text-xs font-semibold text-orange-300">
                              {detection.severity ||
                                "UNKNOWN"}
                            </span>

                          </div>
                        )
                      )}

                    </div>

                  </div>
                )}

                {annotatedImageUrl && (
                  <div className="mt-6">

                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                      Annotated Vision Result
                    </p>

                    <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">

                      <img
                        src={annotatedImageUrl}
                        alt="Vision AI annotated result"
                        className="w-full max-h-[520px] object-contain"
                        onError={(event) => {
                          event.currentTarget.style.display =
                            "none";
                        }}
                      />

                    </div>

                    <p className="text-xs text-slate-600 mt-2">
                      Vision analysis completed{" "}
                      {formatDateTime(
                        vision.analyzedAt
                      )}
                    </p>

                  </div>
                )}

              </section>
            )}

            {/* =================================================
                DUPLICATE DETECTION
            ================================================= */}

            {duplicate && (
              <section className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6">

                <SectionHeader
                  icon={<Repeat2 size={19} />}
                  iconClass="bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                  title="Duplicate Detection"
                  subtitle="AstraOS similarity analysis"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                  <InfoItem
                    label="Duplicate Detected"
                    value={
                      duplicate.isDuplicate
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
                            duplicate.similarityScore *
                              100
                          )}%`
                        : "Not available"
                    }
                  />

                  <InfoItem
                    label="Duplicate Of"
                    value={
                      duplicate.duplicateOf ||
                      "None"
                    }
                  />

                </div>

                <div
                  className={`mt-5 rounded-xl border p-4 ${
                    duplicate.isDuplicate
                      ? "border-yellow-500/20 bg-yellow-500/10"
                      : "border-emerald-500/20 bg-emerald-500/10"
                  }`}
                >

                  <p
                    className={`text-sm font-semibold ${
                      duplicate.isDuplicate
                        ? "text-yellow-300"
                        : "text-emerald-300"
                    }`}
                  >
                    {duplicate.isDuplicate
                      ? "Similar complaint detected"
                      : "No duplicate complaint detected"}
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    {duplicate.isDuplicate
                      ? "This complaint may represent the same civic issue already reported in AstraOS."
                      : "This complaint appears to be unique."}
                  </p>

                </div>

              </section>
            )}

            {/* =================================================
                TIMELINE
            ================================================= */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">

              <SectionHeader
                icon={<Clock3 size={19} />}
                iconClass="bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                title="Complaint Timeline"
                subtitle="Complete complaint lifecycle"
              />

              {complaint.timeline?.length ? (
                <div className="space-y-0">

                  {complaint.timeline.map(
                    (event, index) => (
                      <div
                        key={`${event.status}-${index}`}
                        className="relative flex gap-4 pb-6 last:pb-0"
                      >

                        {index !==
                          complaint.timeline.length -
                            1 && (
                          <div className="absolute left-[9px] top-5 bottom-0 w-px bg-slate-800" />
                        )}

                        <div className="relative z-10 w-5 h-5 rounded-full border-2 border-slate-700 bg-slate-950 flex items-center justify-center">

                          <div className="w-2 h-2 rounded-full bg-blue-400" />

                        </div>

                        <div className="flex-1">

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">

                            <p className="text-sm font-semibold text-white">
                              {formatStatus(
                                event.status
                              )}
                            </p>

                            <p className="text-xs text-slate-500">
                              {formatDateTime(
                                event.timestamp
                              )}
                            </p>

                          </div>

                          {event.message && (
                            <p className="text-sm text-slate-400 mt-1">
                              {event.message}
                            </p>
                          )}

                          {event.actor && (
                            <p className="text-xs text-slate-600 mt-1">
                              Actor: {event.actor}
                            </p>
                          )}

                        </div>

                      </div>
                    )
                  )}

                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No timeline events available.
                </p>
              )}

            </section>

          </div>

          {/* =====================================================
              RIGHT SIDEBAR
          ===================================================== */}

          <div className="space-y-6">

            {/* =================================================
                WORKFLOW
            ================================================= */}

            <section className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">

              <SectionHeader
                icon={<Wrench size={19} />}
                iconClass="bg-blue-500/10 border-blue-500/20 text-blue-400"
                title="Complaint Workflow"
                subtitle="Update complaint progress"
              />

              <div className="space-y-3">

                {canAccept && (
                  <ActionButton
                    onClick={() =>
                      handleAction("accept")
                    }
                    loading={actionLoading}
                    icon={
                      <CheckCircle2 size={17} />
                    }
                    text="Accept Complaint"
                  />
                )}

                {canStart && (
                  <ActionButton
                    onClick={() =>
                      handleAction("start")
                    }
                    loading={actionLoading}
                    icon={<Wrench size={17} />}
                    text="Start Work"
                  />
                )}

                {canProgress && (
                  <ActionButton
                    onClick={() =>
                      handleAction("progress")
                    }
                    loading={actionLoading}
                    icon={<Clock3 size={17} />}
                    text="Mark 50% Progress"
                  />
                )}

                {canResolve && (
                  <ActionButton
                    onClick={() =>
                      handleAction("resolve")
                    }
                    loading={actionLoading}
                    icon={
                      <CheckCircle2 size={17} />
                    }
                    text="Resolve Complaint"
                  />
                )}

                {complaint.status ===
                  "RESOLVED" && (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">

                    <div className="flex items-center gap-2 text-emerald-300">

                      <CheckCircle2 size={18} />

                      <p className="text-sm font-semibold">
                        Complaint Resolved
                      </p>

                    </div>

                    <p className="text-xs text-slate-500 mt-2">
                      Waiting for the citizen to verify
                      the resolution.
                    </p>

                  </div>
                )}

                {complaint.status ===
                  "CITIZEN_VERIFIED" && (
                  <div className="rounded-xl border border-teal-500/20 bg-teal-500/10 p-4">

                    <div className="flex items-center gap-2 text-teal-300">

                      <CheckCircle2 size={18} />

                      <p className="text-sm font-semibold">
                        Citizen Verified
                      </p>

                    </div>

                    <p className="text-xs text-slate-500 mt-2">
                      The citizen has verified the
                      resolution. The complaint is awaiting
                      official closure.
                    </p>

                  </div>
                )}

                {complaint.status ===
                  "CLOSED" && (
                  <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">

                    <p className="text-sm font-semibold text-slate-200">
                      Complaint Closed
                    </p>

                    <p className="text-xs text-slate-500 mt-2">
                      This complaint lifecycle is complete.
                    </p>

                  </div>
                )}

              </div>

            </section>

            {/* =================================================
                STATUS PROGRESS
            ================================================= */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">

              <SectionHeader
                icon={<Clock3 size={19} />}
                iconClass="bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                title="Progress"
                subtitle="Current workflow stage"
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
                ].includes(complaint.status)}
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
                ].includes(complaint.status)}
              />

              <ProgressStep
                label="Work Started"
                active={[
                  "WORK_STARTED",
                  "WORK_50_PERCENT",
                  "RESOLVED",
                  "CITIZEN_VERIFIED",
                  "CLOSED",
                ].includes(complaint.status)}
              />

              <ProgressStep
                label="50% Progress"
                active={[
                  "WORK_50_PERCENT",
                  "RESOLVED",
                  "CITIZEN_VERIFIED",
                  "CLOSED",
                ].includes(complaint.status)}
              />

              <ProgressStep
                label="Resolved"
                active={[
                  "RESOLVED",
                  "CITIZEN_VERIFIED",
                  "CLOSED",
                ].includes(complaint.status)}
              />

              <ProgressStep
                label="Citizen Verified"
                active={[
                  "CITIZEN_VERIFIED",
                  "CLOSED",
                ].includes(complaint.status)}
              />

              <ProgressStep
                label="Closed"
                active={
                  complaint.status === "CLOSED"
                }
              />

            </section>

            {/* =================================================
                ASSIGNED OFFICER
            ================================================= */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">

              <SectionHeader
                icon={<UserRound size={19} />}
                iconClass="bg-blue-500/10 border-blue-500/20 text-blue-400"
                title="Assigned Officer"
                subtitle="Officer responsible for resolution"
              />

              <InfoItem
                label="Officer"
                value={
                  complaint.assignedOfficer?.name ||
                  complaint.assignedOfficer?.fullName ||
                  complaint.assignedOfficer?._id ||
                  complaint.assignedOfficer ||
                  "Not available"
                }
              />

            </section>

            {/* =================================================
                CITIZEN
            ================================================= */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">

              <SectionHeader
                icon={<UserRound size={19} />}
                iconClass="bg-slate-800 border-slate-700 text-slate-300"
                title="Citizen"
                subtitle="Complaint submitted by"
              />

              <div className="space-y-4">

                <InfoItem
                  label="Name"
                  value={
                    complaint.citizen?.name ||
                    "Not available"
                  }
                />

                <InfoItem
                  label="Email"
                  value={
                    complaint.citizen?.email ||
                    "Not available"
                  }
                />

                <InfoItem
                  label="Phone"
                  value={
                    complaint.citizen?.phoneNumber ||
                    "Not available"
                  }
                />

              </div>

            </section>

            {/* =================================================
                DEPARTMENT
            ================================================= */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">

              <SectionHeader
                icon={<Building2 size={19} />}
                iconClass="bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                title="Department"
                subtitle="Responsible department"
              />

              <div className="space-y-4">

                <InfoItem
                  label="Department"
                  value={
                    complaint.department?.name ||
                    "Not available"
                  }
                />

                <InfoItem
                  label="Code"
                  value={
                    complaint.department?.code ||
                    "Not available"
                  }
                />

              </div>

            </section>

          </div>

        </div>

      </main>
    </div>
  );
}

// =========================================================
// SECTION HEADER
// =========================================================

function SectionHeader({
  icon,
  iconClass,
  title,
  subtitle,
}) {
  return (
    <div className="flex items-center gap-3 mb-5">

      <div
        className={`w-10 h-10 rounded-xl border flex items-center justify-center ${iconClass}`}
      >
        {icon}
      </div>

      <div>
        <h3 className="font-semibold">
          {title}
        </h3>

        <p className="text-xs text-slate-500">
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

      <p className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="text-sm text-slate-200 mt-1 break-words">
        {value ?? "Not available"}
      </p>

    </div>
  );
}

// =========================================================
// METRIC CARD
// =========================================================

function MetricCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">

      <p className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="text-2xl font-bold text-white mt-2">
        {value}
      </p>

    </div>
  );
}

// =========================================================
// ACTION BUTTON
// =========================================================

function ActionButton({
  onClick,
  loading,
  icon,
  text,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2
            size={17}
            className="animate-spin"
          />

          Updating...
        </>
      ) : (
        <>
          {icon}
          {text}
        </>
      )}
    </button>
  );
}

// =========================================================
// PROGRESS STEP
// =========================================================

function ProgressStep({ label, active }) {
  return (
    <div className="flex items-center gap-3 mb-4 last:mb-0">

      <div
        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
          active
            ? "border-blue-400 bg-blue-500"
            : "border-slate-700 bg-slate-950"
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
            ? "text-white font-medium"
            : "text-slate-500"
        }`}
      >
        {label}
      </p>

    </div>
  );
}

