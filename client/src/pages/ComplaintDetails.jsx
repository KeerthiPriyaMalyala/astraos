


import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  Bot,
  Building2,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  ShieldCheck,
  UserRound,
  RotateCcw,
  Star,
  XCircle,
  Sparkles,
  Activity,
  BrainCircuit,
  Target,
  Navigation,
  FileText,
  CalendarDays,
  Zap,
  MessageSquare,
  Check,
} from "lucide-react";

import {
  getComplaintById,
  verifyComplaint,
  reopenComplaint,
  closeComplaint,
  rateComplaint,
} from "../services/complaintService";

// ============================================================
// COMPONENT
// ============================================================

const ComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ==========================================================
  // STATE
  // ==========================================================

  const [complaint, setComplaint] = useState(null);

  const [loading, setLoading] = useState(true);

  const [verifying, setVerifying] = useState(false);
  const [reopening, setReopening] = useState(false);
  const [closing, setClosing] = useState(false);
  const [rating, setRating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================================
  // RATING STATE
  // ==========================================================

  const [ratingData, setRatingData] = useState({
    overall: 0,
    resolutionQuality: 0,
    officerBehaviour: 0,
    timeTaken: 0,
    feedback: "",
  });

  // ==========================================================
  // FETCH COMPLAINT
  // ==========================================================

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getComplaintById(id);

        console.log(
          "📋 [AstraOS] Complaint details response:",
          response
        );

        if (!response.success) {
          throw new Error(
            response.message || "Unable to load complaint."
          );
        }

        const complaintData = response.data?.complaint;

        if (!complaintData) {
          throw new Error("Complaint data not found.");
        }

        setComplaint(complaintData);
      } catch (err) {
        console.error(
          "❌ [AstraOS] Complaint details error:",
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

    if (id) {
      fetchComplaint();
    }
  }, [id]);

  // ==========================================================
  // VERIFY COMPLAINT
  // ==========================================================

  const handleVerify = async () => {
    try {
      setVerifying(true);
      setError("");
      setSuccess("");

      const response = await verifyComplaint(id);

      console.log(
        "✅ [AstraOS] Complaint verification response:",
        response
      );

      if (!response.success) {
        throw new Error(
          response.message || "Unable to verify complaint."
        );
      }

      const updatedComplaint = response.data?.complaint;

      if (updatedComplaint) {
        setComplaint(updatedComplaint);
      } else {
        setComplaint((previous) => ({
          ...previous,
          status: "CITIZEN_VERIFIED",
        }));
      }

      setSuccess(
        "Complaint verified successfully. Thank you for confirming the resolution."
      );
    } catch (err) {
      console.error(
        "❌ [AstraOS] Complaint verification error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to verify complaint."
      );
    } finally {
      setVerifying(false);
    }
  };

  // ==========================================================
  // REOPEN COMPLAINT
  // ==========================================================

  const handleReopen = async () => {
    try {
      setReopening(true);
      setError("");
      setSuccess("");

      const response = await reopenComplaint(id);

      console.log(
        "🔄 [AstraOS] Complaint reopen response:",
        response
      );

      if (!response.success) {
        throw new Error(
          response.message || "Unable to reopen complaint."
        );
      }

      const updatedComplaint = response.data?.complaint;

      if (updatedComplaint) {
        setComplaint(updatedComplaint);
      } else {
        setComplaint((previous) => ({
          ...previous,
          status: "REOPENED",
        }));
      }

      setSuccess(
        "Complaint reopened successfully. The issue has been sent back for further action."
      );
    } catch (err) {
      console.error(
        "❌ [AstraOS] Complaint reopen error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to reopen complaint."
      );
    } finally {
      setReopening(false);
    }
  };

  // ==========================================================
  // CLOSE COMPLAINT
  // ==========================================================

  const handleClose = async () => {
    try {
      setClosing(true);
      setError("");
      setSuccess("");

      const response = await closeComplaint(id);

      console.log(
        "🔒 [AstraOS] Complaint close response:",
        response
      );

      if (!response.success) {
        throw new Error(
          response.message || "Unable to close complaint."
        );
      }

      const updatedComplaint = response.data?.complaint;

      if (updatedComplaint) {
        setComplaint(updatedComplaint);
      } else {
        setComplaint((previous) => ({
          ...previous,
          status: "CLOSED",
        }));
      }

      setSuccess("Complaint closed successfully.");
    } catch (err) {
      console.error(
        "❌ [AstraOS] Complaint close error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to close complaint."
      );
    } finally {
      setClosing(false);
    }
  };

  // ==========================================================
  // RATING HANDLER
  // ==========================================================

  const handleRatingChange = (field, value) => {
    setRatingData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // ==========================================================
  // SUBMIT RATING
  // ==========================================================

  const handleSubmitRating = async (event) => {
    event.preventDefault();

    try {
      setRating(true);
      setError("");
      setSuccess("");

      if (
        !ratingData.overall ||
        !ratingData.resolutionQuality ||
        !ratingData.officerBehaviour ||
        !ratingData.timeTaken
      ) {
        setError(
          "Please provide all four ratings before submitting."
        );

        setRating(false);

        return;
      }

      const response = await rateComplaint(
        id,
        ratingData
      );

      console.log(
        "⭐ [AstraOS] Rating response:",
        response
      );

      if (!response.success) {
        throw new Error(
          response.message || "Unable to submit rating."
        );
      }

      const updatedComplaint = response.data?.complaint;

      if (updatedComplaint) {
        setComplaint(updatedComplaint);
      }

      setSuccess(
        "Thank you! Your service rating has been submitted successfully."
      );

      setRatingData({
        overall: 0,
        resolutionQuality: 0,
        officerBehaviour: 0,
        timeTaken: 0,
        feedback: "",
      });
    } catch (err) {
      console.error(
        "❌ [AstraOS] Rating submission error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to submit rating."
      );
    } finally {
      setRating(false);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07111f] text-white flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.10),transparent_35%)]" />

        <div className="relative flex flex-col items-center gap-5">
          <div className="w-16 h-16 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 flex items-center justify-center">
            <Loader2 className="w-7 h-7 text-cyan-400 animate-spin" />
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold text-white">
              Loading Complaint Intelligence
            </p>

            <p className="text-xs text-slate-500 mt-1">
              AstraOS is retrieving your complaint data
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error && !complaint) {
    return (
      <div className="min-h-screen bg-[#07111f] px-4 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(239,68,68,0.08),transparent_40%)]" />

        <div className="relative w-full max-w-md bg-[#0b1728] border border-red-500/20 rounded-3xl p-8 text-center shadow-2xl">

          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-red-400" />
          </div>

          <h2 className="text-xl font-bold text-white mt-5">
            Unable to load complaint
          </h2>

          <p className="text-sm text-slate-400 mt-2 leading-6">
            {error}
          </p>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return null;
  }

  // ==========================================================
  // HELPERS
  // ==========================================================

  const getStatusLabel = (status) => {
    if (!status) return "Unknown";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getCategoryLabel = (category) => {
    if (!category) return "Not available";

    return category
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getPriorityClasses = (level) => {
    switch (level) {
      case "CRITICAL":
        return "bg-red-500/10 text-red-400 border-red-500/20";

      case "HIGH":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";

      case "MEDIUM":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

      default:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "CLOSED":
      case "CITIZEN_VERIFIED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

      case "RESOLVED":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";

      case "REOPENED":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";

      default:
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const location = complaint.location || {};
  const ai = complaint.aiAnalysis || {};
  const priority = complaint.priority || {};
  const serviceRating = complaint.serviceRating || {};

  // ==========================================================
  // STAR RATING COMPONENT
  // ==========================================================

  const StarRating = ({ field, label }) => {
    const currentValue = ratingData[field] || 0;

    return (
      <div className="rounded-2xl border border-slate-800 bg-[#0a1627] p-5">
        <p className="text-sm font-semibold text-slate-300 mb-3">
          {label}
        </p>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() =>
                handleRatingChange(field, star)
              }
              className="p-1 transition hover:scale-110"
              aria-label={`${star} star`}
            >
              <Star
                className={`w-7 h-7 ${
                  star <= currentValue
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-slate-700"
                }`}
              />
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-600 mt-2">
          {currentValue
            ? `${currentValue}/5 selected`
            : "Select your rating"}
        </p>
      </div>
    );
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#07111f] text-white relative overflow-hidden">

      {/* BACKGROUND GLOW */}

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ==================================================
            TOP BAR
        ================================================== */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-cyan-400 transition w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-2">

            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />

              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                AstraOS Civic Intelligence
              </span>
            </div>

          </div>

        </div>

        {/* ==================================================
            SUCCESS
        ================================================== */}

        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">

            <div className="flex items-start gap-3">

              <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>

              <div>
                <p className="text-sm font-bold text-emerald-300">
                  Action Completed
                </p>

                <p className="text-sm text-emerald-400/80 mt-0.5">
                  {success}
                </p>
              </div>

            </div>

          </div>
        )}

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">

            <div className="flex items-start gap-3">

              <div className="w-8 h-8 rounded-lg bg-red-400/10 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4 text-red-400" />
              </div>

              <div>
                <p className="text-sm font-bold text-red-300">
                  Action Failed
                </p>

                <p className="text-sm text-red-400/80 mt-0.5">
                  {error}
                </p>
              </div>

            </div>

          </div>
        )}

        {/* ==================================================
            HERO / COMPLAINT HEADER
        ================================================== */}

        <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#0b1728] shadow-2xl">

          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 blur-3xl rounded-full" />

          <div className="relative p-6 sm:p-8 lg:p-10">

            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-8">

              <div className="max-w-4xl">

                <div className="flex flex-wrap items-center gap-2 mb-4">

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                    <FileText className="w-3.5 h-3.5" />
                    Citizen Complaint
                  </span>

                  <span className="text-xs text-slate-600">
                    ID: {String(id).slice(-12)}
                  </span>

                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                  {complaint.title}
                </h1>

                <div className="mt-5 max-w-3xl">
                  <p className="text-sm sm:text-base text-slate-400 leading-7">
                    {complaint.description}
                  </p>
                </div>

              </div>

              <div className="flex flex-wrap xl:flex-col gap-2 xl:items-end shrink-0">

                <span className="inline-flex items-center justify-center rounded-full border border-blue-400/20 bg-blue-400/5 px-4 py-2 text-xs font-bold text-blue-400">
                  {getCategoryLabel(complaint.category)}
                </span>

                <span
                  className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-xs font-bold ${getPriorityClasses(
                    priority.level
                  )}`}
                >
                  {priority.level || "LOW"} Priority
                </span>

                <span
                  className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-xs font-bold ${getStatusClasses(
                    complaint.status
                  )}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse" />
                  {getStatusLabel(complaint.status)}
                </span>

              </div>

            </div>

            {/* META */}

            <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-5">

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-xl bg-slate-800/70 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4 text-slate-400" />
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-600">
                    Submitted
                  </p>

                  <p className="text-sm text-slate-300 mt-0.5">
                    {formatDate(complaint.createdAt)}
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-xl bg-slate-800/70 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-600">
                    Current Status
                  </p>

                  <p className="text-sm text-slate-300 mt-0.5">
                    {getStatusLabel(complaint.status)}
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-xl bg-slate-800/70 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-blue-400" />
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-600">
                    Priority Score
                  </p>

                  <p className="text-sm text-slate-300 mt-0.5">
                    {priority.score ?? 0}/100
                  </p>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* ==================================================
            AI + PRIORITY
        ================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

          {/* AI */}

          <section className="rounded-3xl border border-cyan-400/10 bg-[#0b1728] shadow-xl overflow-hidden">

            <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-transparent" />

            <div className="p-6 sm:p-7">

              <div className="flex items-start justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div className="w-11 h-11 rounded-2xl bg-cyan-400/10 border border-cyan-400/10 flex items-center justify-center">
                    <BrainCircuit className="w-5 h-5 text-cyan-400" />
                  </div>

                  <div>
                    <h2 className="font-bold text-white">
                      Astra Intelligence
                    </h2>

                    <p className="text-xs text-slate-500 mt-1">
                      AI-powered complaint analysis
                    </p>
                  </div>

                </div>

                <Sparkles className="w-5 h-5 text-cyan-400/50" />

              </div>

              <div className="mt-7 space-y-5">

                <div className="rounded-2xl border border-slate-800 bg-[#091423] p-4">

                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    AI Category
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-200">
                    {ai.category
                      ? getCategoryLabel(ai.category)
                      : "Not available"}
                  </p>

                </div>

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    Intelligence Summary
                  </p>

                  <p className="mt-2 text-sm text-slate-400 leading-6">
                    {ai.summary ||
                      "AI summary not available yet."}
                  </p>

                </div>

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    Suggested Action
                  </p>

                  <p className="mt-2 text-sm text-slate-400 leading-6">
                    {ai.suggestedAction ||
                      "Not available"}
                  </p>

                </div>

                <div className="grid grid-cols-2 gap-4">

                  <div className="rounded-2xl border border-slate-800 bg-[#091423] p-4">

                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-orange-400" />

                      <p className="text-xs text-slate-500">
                        Severity
                      </p>
                    </div>

                    <p className="mt-2 text-xl font-black text-white">
                      {ai.severity ?? "—"}

                      {ai.severity !== null &&
                      ai.severity !== undefined
                        ? "/10"
                        : ""}
                    </p>

                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-[#091423] p-4">

                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />

                      <p className="text-xs text-slate-500">
                        Confidence
                      </p>
                    </div>

                    <p className="mt-2 text-xl font-black text-white">
                      {ai.confidence !== null &&
                      ai.confidence !== undefined
                        ? `${Math.round(
                            ai.confidence * 100
                          )}%`
                        : "—"}
                    </p>

                  </div>

                </div>

              </div>

            </div>
          </section>

          {/* PRIORITY */}

          <section className="rounded-3xl border border-slate-800 bg-[#0b1728] shadow-xl p-6 sm:p-7">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-2xl bg-blue-400/10 border border-blue-400/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-400" />
              </div>

              <div>
                <h2 className="font-bold text-white">
                  Priority Assessment
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  AstraOS priority engine
                </p>
              </div>

            </div>

            <div className="mt-7">

              <div className="flex items-center justify-between gap-4">

                <div
                  className={`inline-flex rounded-full border px-4 py-2 text-xs font-black ${getPriorityClasses(
                    priority.level
                  )}`}
                >
                  {priority.level || "LOW"} PRIORITY
                </div>

                <span className="text-2xl font-black text-white">
                  {priority.score ?? 0}
                  <span className="text-sm text-slate-600">
                    /100
                  </span>
                </span>

              </div>

              <div className="mt-6">

                <div className="h-3 rounded-full bg-slate-800 overflow-hidden">

                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        Math.max(
                          priority.score || 0,
                          0
                        ),
                        100
                      )}%`,
                    }}
                  />

                </div>

                <div className="flex justify-between mt-2 text-[10px] text-slate-600">
                  <span>LOW</span>
                  <span>MEDIUM</span>
                  <span>HIGH</span>
                  <span>CRITICAL</span>
                </div>

              </div>

              <div className="mt-7 rounded-2xl border border-slate-800 bg-[#091423] p-5">

                <div className="flex items-center gap-2">

                  <Target className="w-4 h-4 text-cyan-400" />

                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    Assessment Reason
                  </p>

                </div>

                <p className="mt-3 text-sm text-slate-400 leading-6">
                  {priority.reason ||
                    "Priority reason not available."}
                </p>

              </div>

            </div>

          </section>

        </div>

        {/* ==================================================
            DEPARTMENT + LOCATION
        ================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

          {/* DEPARTMENT */}

          <section className="rounded-3xl border border-slate-800 bg-[#0b1728] shadow-xl p-6 sm:p-7">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-2xl bg-purple-400/10 border border-purple-400/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-400" />
              </div>

              <div>
                <h2 className="font-bold text-white">
                  Department Assignment
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Complaint routing & ownership
                </p>
              </div>

            </div>

            <div className="mt-7 space-y-5">

              <div className="rounded-2xl border border-slate-800 bg-[#091423] p-5">

                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Assigned Department
                </p>

                <p className="mt-2 text-sm font-bold text-slate-200">
                  {complaint.department
                    ? typeof complaint.department ===
                      "object"
                      ? complaint.department.name
                      : complaint.department
                    : ai.department ||
                      "Pending assignment"}
                </p>

              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#091423] p-5">

                <div className="flex items-center gap-2">

                  <UserRound className="w-4 h-4 text-purple-400" />

                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    Assigned Officer
                  </p>

                </div>

                <p className="mt-2 text-sm font-bold text-slate-200">
                  {complaint.assignedOfficer
                    ? typeof complaint.assignedOfficer ===
                      "object"
                      ? complaint.assignedOfficer.name ||
                        complaint.assignedOfficer.email
                      : complaint.assignedOfficer
                    : "Not assigned yet"}
                </p>

              </div>

            </div>

          </section>

          {/* LOCATION */}

          <section className="rounded-3xl border border-slate-800 bg-[#0b1728] shadow-xl p-6 sm:p-7">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-2xl bg-emerald-400/10 border border-emerald-400/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-emerald-400" />
              </div>

              <div>
                <h2 className="font-bold text-white">
                  Reported Location
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Civic issue coordinates
                </p>
              </div>

            </div>

            <div className="mt-7 space-y-5">

              <div className="rounded-2xl border border-slate-800 bg-[#091423] p-5">

                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Address
                </p>

                <p className="mt-2 text-sm text-slate-300 leading-6">
                  {location.address ||
                    "Not provided"}
                </p>

              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#091423] p-5">

                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Landmark
                </p>

                <p className="mt-2 text-sm text-slate-300">
                  {location.landmark ||
                    "Not provided"}
                </p>

              </div>

              <div className="grid grid-cols-2 gap-4">

                <div className="rounded-2xl border border-slate-800 bg-[#091423] p-4">

                  <div className="flex items-center gap-2">
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      Latitude
                    </p>
                  </div>

                  <p className="mt-2 text-sm text-slate-300 break-all">
                    {location.latitude ?? "—"}
                  </p>

                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#091423] p-4">

                  <div className="flex items-center gap-2">
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      Longitude
                    </p>
                  </div>

                  <p className="mt-2 text-sm text-slate-300 break-all">
                    {location.longitude ?? "—"}
                  </p>

                </div>

              </div>

            </div>

          </section>

        </div>

        {/* ==================================================
            DUPLICATE INFORMATION
        ================================================== */}

        {complaint.duplicateInfo && (
          <section className="mt-6 rounded-3xl border border-orange-400/10 bg-[#0b1728] shadow-xl overflow-hidden">

            <div className="h-1 bg-gradient-to-r from-orange-500 to-transparent" />

            <div className="p-6 sm:p-7">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-2xl bg-orange-400/10 border border-orange-400/10 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-orange-400" />
                </div>

                <div>
                  <h2 className="font-bold text-white">
                    Duplicate Detection
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    AstraOS similarity analysis
                  </p>
                </div>

              </div>

              <div className="mt-6">

                {complaint.duplicateInfo.isDuplicate ? (
                  <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">

                    <div className="flex items-start gap-3">

                      <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />

                      <div>

                        <p className="text-sm font-bold text-orange-300">
                          Similar complaint detected
                        </p>

                        <p className="text-sm text-orange-400/80 mt-2 leading-6">
                          AstraOS found a similar complaint
                          with{" "}
                          {Math.round(
                            (complaint.duplicateInfo
                              .similarityScore || 0) * 100
                          )}
                          % similarity.
                        </p>

                        {complaint.duplicateInfo
                          .duplicateOf && (
                          <p className="text-xs text-orange-400/60 mt-3">
                            Reference complaint:{" "}
                            {String(
                              complaint.duplicateInfo
                                .duplicateOf
                            )}
                          </p>
                        )}

                      </div>

                    </div>

                  </div>
                ) : (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">

                    <div className="flex items-start gap-3">

                      <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />

                      <div>

                        <p className="text-sm font-bold text-emerald-300">
                          No duplicate detected
                        </p>

                        <p className="text-sm text-emerald-400/80 mt-2 leading-6">
                          AstraOS did not find a sufficiently
                          similar active complaint.
                        </p>

                      </div>

                    </div>

                  </div>
                )}

              </div>

            </div>
          </section>
        )}

        {/* ==================================================
            TIMELINE
        ================================================== */}

        <section className="mt-6 rounded-3xl border border-slate-800 bg-[#0b1728] shadow-xl p-6 sm:p-8">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-2xl bg-blue-400/10 border border-blue-400/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                Complaint Journey
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Track every important stage of your complaint.
              </p>
            </div>

          </div>

          <div className="mt-8">

            {complaint.timeline?.length ? (
              <div className="space-y-0">

                {complaint.timeline.map(
                  (event, index) => (

                    <div
                      key={`${event.status}-${index}`}
                      className="flex gap-4"
                    >

                      <div className="flex flex-col items-center">

                        <div
                          className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 ${
                            index ===
                            complaint.timeline.length - 1
                              ? "bg-cyan-400/10 border-cyan-400/30"
                              : "bg-blue-400/10 border-blue-400/20"
                          }`}
                        >

                          {index ===
                          complaint.timeline.length - 1 ? (
                            <Check className="w-4 h-4 text-cyan-400" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-blue-400" />
                          )}

                        </div>

                        {index !==
                          complaint.timeline.length - 1 && (
                          <div className="w-px flex-1 bg-slate-800 my-2" />
                        )}

                      </div>

                      <div className="pb-8 flex-1">

                        <div className="rounded-2xl border border-slate-800 bg-[#091423] p-5">

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                            <p className="text-sm font-bold text-white">
                              {getStatusLabel(
                                event.status
                              )}
                            </p>

                            <span className="text-[11px] text-slate-600">
                              {formatDate(
                                event.timestamp
                              )}
                            </span>

                          </div>

                          <p className="text-sm text-slate-400 mt-2 leading-6">
                            {event.message ||
                              "Status updated"}
                          </p>

                          <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                            <UserRound className="w-3.5 h-3.5" />
                            {event.actor || "SYSTEM"}
                          </div>

                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>
            ) : (
              <div className="rounded-2xl border border-slate-800 bg-[#091423] p-6 text-center">

                <Clock3 className="w-7 h-7 text-slate-700 mx-auto" />

                <p className="text-sm text-slate-500 mt-3">
                  No timeline events available.
                </p>

              </div>
            )}

          </div>

        </section>

        {/* ==================================================
            RESOLUTION ACTIONS
        ================================================== */}

        {complaint.status === "RESOLVED" && (
          <section className="mt-6 rounded-3xl border border-emerald-400/20 bg-emerald-400/5 shadow-xl overflow-hidden">

            <div className="p-6 sm:p-8">

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-7">

                <div className="flex items-start gap-4">

                  <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-400/70">
                      Resolution Required
                    </p>

                    <h2 className="text-xl font-bold text-emerald-300 mt-1">
                      Is the issue actually resolved?
                    </h2>

                    <p className="text-sm text-emerald-400/70 mt-2 leading-6 max-w-2xl">
                      Confirm the resolution if the issue has
                      been fixed, or reopen the complaint if
                      the issue still exists.
                    </p>
                  </div>

                </div>

                <div className="flex flex-col sm:flex-row gap-3 shrink-0">

                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={
                      verifying ||
                      reopening ||
                      closing
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        Verify Resolution
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleReopen}
                    disabled={
                      verifying ||
                      reopening ||
                      closing
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-400/30 bg-orange-400/5 px-5 py-3 text-sm font-bold text-orange-400 hover:bg-orange-400/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {reopening ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Reopening...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4" />
                        Reopen Complaint
                      </>
                    )}
                  </button>

                </div>

              </div>

            </div>
          </section>
        )}

        {/* ==================================================
            VERIFIED + CLOSE
        ================================================== */}

        {complaint.status === "CITIZEN_VERIFIED" && (
          <section className="mt-6 rounded-3xl border border-blue-400/20 bg-blue-400/5 shadow-xl overflow-hidden">

            <div className="p-6 sm:p-8">

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                <div className="flex items-start gap-4">

                  <div className="w-12 h-12 rounded-2xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-blue-400" />
                  </div>

                  <div>

                    <p className="text-[10px] uppercase tracking-wider font-bold text-blue-400/70">
                      Citizen Confirmation
                    </p>

                    <h2 className="text-xl font-bold text-blue-300 mt-1">
                      Resolution Verified
                    </h2>

                    <p className="text-sm text-blue-400/70 mt-2 leading-6">
                      You have successfully verified that this
                      complaint has been resolved.
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  disabled={closing}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-3 text-sm font-bold text-white hover:bg-blue-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {closing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Closing...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      Close Complaint
                    </>
                  )}
                </button>

              </div>

            </div>
          </section>
        )}

        {/* ==================================================
            REOPENED
        ================================================== */}

        {complaint.status === "REOPENED" && (
          <section className="mt-6 rounded-3xl border border-orange-400/20 bg-orange-400/5 shadow-xl">

            <div className="p-6 sm:p-8 flex items-start gap-4">

              <div className="w-12 h-12 rounded-2xl bg-orange-400/10 border border-orange-400/20 flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6 text-orange-400" />
              </div>

              <div>

                <p className="text-[10px] uppercase tracking-wider font-bold text-orange-400/70">
                  Further Action
                </p>

                <h2 className="text-xl font-bold text-orange-300 mt-1">
                  Complaint Reopened
                </h2>

                <p className="text-sm text-orange-400/70 mt-2 leading-6">
                  You reported that the issue is still not
                  resolved. The complaint has been reopened for
                  further action.
                </p>

              </div>

            </div>
          </section>
        )}

        {/* ==================================================
            SERVICE RATING
        ================================================== */}

        {(complaint.status === "CITIZEN_VERIFIED" ||
          complaint.status === "CLOSED") &&
          !serviceRating.submittedAt && (
            <section className="mt-6 rounded-3xl border border-yellow-400/10 bg-[#0b1728] shadow-xl overflow-hidden">

              <div className="h-1 bg-gradient-to-r from-yellow-500 via-orange-400 to-transparent" />

              <div className="p-6 sm:p-8">

                <div className="flex items-start gap-4">

                  <div className="w-12 h-12 rounded-2xl bg-yellow-400/10 border border-yellow-400/10 flex items-center justify-center shrink-0">
                    <Star className="w-6 h-6 text-yellow-400" />
                  </div>

                  <div>

                    <p className="text-[10px] uppercase tracking-wider font-bold text-yellow-400/70">
                      Citizen Experience
                    </p>

                    <h2 className="text-xl font-bold text-white mt-1">
                      Rate Your Experience
                    </h2>

                    <p className="text-sm text-slate-500 mt-2">
                      Help AstraOS improve government services
                      by sharing your experience.
                    </p>

                  </div>

                </div>

                <form
                  onSubmit={handleSubmitRating}
                  className="mt-7 space-y-6"
                >

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <StarRating
                      field="overall"
                      label="Overall Experience"
                    />

                    <StarRating
                      field="resolutionQuality"
                      label="Resolution Quality"
                    />

                    <StarRating
                      field="officerBehaviour"
                      label="Officer Behaviour"
                    />

                    <StarRating
                      field="timeTaken"
                      label="Resolution Time"
                    />

                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-[#091423] p-5">

                    <div className="flex items-center gap-2">

                      <MessageSquare className="w-4 h-4 text-cyan-400" />

                      <label className="text-sm font-bold text-slate-300">
                        Feedback
                      </label>

                    </div>

                    <textarea
                      value={ratingData.feedback}
                      onChange={(event) =>
                        handleRatingChange(
                          "feedback",
                          event.target.value
                        )
                      }
                      rows={5}
                      maxLength={1000}
                      placeholder="Tell us about your experience..."
                      className="mt-4 w-full rounded-xl border border-slate-800 bg-[#07111f] px-4 py-3 text-sm text-slate-300 placeholder:text-slate-700 outline-none focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10 resize-none"
                    />

                    <p className="text-xs text-slate-700 mt-2 text-right">
                      {ratingData.feedback.length}/1000
                    </p>

                  </div>

                  <button
                    type="submit"
                    disabled={rating}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {rating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4" />
                        Submit Rating
                      </>
                    )}
                  </button>

                </form>

              </div>
            </section>
          )}

        {/* ==================================================
            EXISTING RATING
        ================================================== */}

        {serviceRating.submittedAt && (
          <section className="mt-6 rounded-3xl border border-yellow-400/10 bg-[#0b1728] shadow-xl overflow-hidden">

            <div className="h-1 bg-gradient-to-r from-yellow-500 via-orange-400 to-transparent" />

            <div className="p-6 sm:p-8">

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-2xl bg-yellow-400/10 border border-yellow-400/10 flex items-center justify-center">

                  <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />

                </div>

                <div>

                  <p className="text-[10px] uppercase tracking-wider font-bold text-yellow-400/70">
                    Citizen Experience
                  </p>

                  <h2 className="text-xl font-bold text-white mt-1">
                    Your Service Rating
                  </h2>

                  <p className="text-xs text-slate-600 mt-1">
                    Submitted{" "}
                    {formatDate(
                      serviceRating.submittedAt
                    )}
                  </p>

                </div>

              </div>

              <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="rounded-2xl border border-slate-800 bg-[#091423] p-5">

                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-600">
                    Overall
                  </p>

                  <p className="mt-2 font-black text-white">
                    ⭐ {serviceRating.overall || "—"}/5
                  </p>

                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#091423] p-5">

                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-600">
                    Resolution Quality
                  </p>

                  <p className="mt-2 font-black text-white">
                    ⭐{" "}
                    {serviceRating.resolutionQuality ||
                      "—"}
                    /5
                  </p>

                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#091423] p-5">

                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-600">
                    Officer Behaviour
                  </p>

                  <p className="mt-2 font-black text-white">
                    ⭐{" "}
                    {serviceRating.officerBehaviour ||
                      "—"}
                    /5
                  </p>

                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#091423] p-5">

                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-600">
                    Resolution Time
                  </p>

                  <p className="mt-2 font-black text-white">
                    ⭐{" "}
                    {serviceRating.timeTaken || "—"}/5
                  </p>

                </div>

              </div>

              {serviceRating.feedback && (
                <div className="mt-5 rounded-2xl border border-slate-800 bg-[#091423] p-5">

                  <div className="flex items-center gap-2">

                    <MessageSquare className="w-4 h-4 text-cyan-400" />

                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      Your Feedback
                    </p>

                  </div>

                  <p className="mt-3 text-sm text-slate-400 leading-6">
                    {serviceRating.feedback}
                  </p>

                </div>
              )}

            </div>
          </section>
        )}

        {/* ==================================================
            FOOTER INFO
        ================================================== */}

        <div className="py-10 text-center">

          <div className="inline-flex items-center gap-2 text-xs text-slate-700">

            <Sparkles className="w-3.5 h-3.5 text-cyan-500/50" />

            <span>
              Powered by AstraOS Civic Intelligence
            </span>

          </div>

        </div>

      </main>
    </div>
  );
};

export default ComplaintDetails;





