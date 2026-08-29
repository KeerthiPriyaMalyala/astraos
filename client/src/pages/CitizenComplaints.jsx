

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Activity,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  MapPin,
  Plus,
  ShieldCheck,
  Sparkles,
  CircleDot,
  TrendingUp,
} from "lucide-react";

import api from "../api/axios";

const CitizenComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH ALL CITIZEN COMPLAINTS
  // EXISTING LOGIC — UNCHANGED
  // =====================================================

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/complaints/my");

        const data = response.data;

        console.log(
          "📋 [AstraOS] ALL CITIZEN COMPLAINTS:",
          data.data
        );

        if (!data.success) {
          throw new Error(
            data.message || "Failed to load complaints"
          );
        }

        setComplaints(data.data?.complaints || []);
      } catch (err) {
        console.error(
          "❌ [AstraOS] Complaints loading error:",
          err
        );

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load complaints."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  // =====================================================
  // STATUS LABEL
  // =====================================================

  const getStatusLabel = (status) => {
    switch (status) {
      case "SUBMITTED":
        return "Submitted";

      case "PENDING_ASSIGNMENT":
        return "Pending Assignment";

      case "ASSIGNED":
        return "Assigned";

      case "ACCEPTED":
        return "Accepted";

      case "WORK_STARTED":
        return "Work Started";

      case "WORK_50_PERCENT":
        return "Work 50% Complete";

      case "RESOLVED":
        return "Resolved";

      case "CITIZEN_VERIFIED":
        return "Citizen Verified";

      case "CLOSED":
        return "Closed";

      case "REOPENED":
        return "Reopened";

      default:
        return status || "Unknown";
    }
  };

  // =====================================================
  // STATUS STYLE
  // =====================================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "RESOLVED":
      case "CITIZEN_VERIFIED":
      case "CLOSED":
        return "bg-emerald-400/10 text-emerald-300 border-emerald-400/20";

      case "WORK_STARTED":
      case "WORK_50_PERCENT":
      case "ACCEPTED":
        return "bg-blue-400/10 text-blue-300 border-blue-400/20";

      case "ASSIGNED":
      case "PENDING_ASSIGNMENT":
        return "bg-amber-400/10 text-amber-300 border-amber-400/20";

      case "REOPENED":
        return "bg-red-400/10 text-red-300 border-red-400/20";

      default:
        return "bg-slate-400/10 text-slate-300 border-slate-400/20";
    }
  };

  // =====================================================
  // CATEGORY LABEL
  // =====================================================

  const getCategoryLabel = (category) => {
    if (!category) return "Civic Issue";

    return category
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // =====================================================
  // PRIORITY STYLE
  // =====================================================

  const getPriorityStyle = (level) => {
    switch (level) {
      case "CRITICAL":
        return "bg-red-400/10 text-red-300 border-red-400/20";

      case "HIGH":
        return "bg-orange-400/10 text-orange-300 border-orange-400/20";

      case "MEDIUM":
        return "bg-amber-400/10 text-amber-300 border-amber-400/20";

      case "LOW":
        return "bg-emerald-400/10 text-emerald-300 border-emerald-400/20";

      default:
        return "bg-slate-400/10 text-slate-400 border-slate-400/20";
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "Unknown date";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // UI-ONLY SUMMARY CALCULATIONS
  // NO BACKEND CHANGE
  // =====================================================

  const activeComplaints = complaints.filter(
    (complaint) =>
      !["RESOLVED", "CITIZEN_VERIFIED", "CLOSED"].includes(
        complaint.status
      )
  ).length;

  const resolvedComplaints = complaints.filter((complaint) =>
    ["RESOLVED", "CITIZEN_VERIFIED", "CLOSED"].includes(
      complaint.status
    )
  ).length;

  const highPriorityComplaints = complaints.filter((complaint) =>
    ["CRITICAL", "HIGH"].includes(
      complaint.priority?.level
    )
  ).length;

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]" />

          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-xl shadow-blue-500/20">
            <ShieldCheck size={27} />
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            <span className="text-sm">
              Loading your civic network...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden px-4 py-8">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
          <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]" />

          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-white mb-8 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="rounded-3xl border border-red-500/20 bg-red-500/[0.06] backdrop-blur-xl p-7 shadow-2xl shadow-black/20">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-red-400 mb-2">
                  Civic Network Error
                </p>

                <h2 className="text-xl font-bold text-white">
                  Unable to load complaints
                </h2>

                <p className="text-sm text-slate-400 mt-2">
                  {error}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden">

      {/* =================================================
          AMBIENT BACKGROUND
      ================================================= */}

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-48 -left-48 w-[650px] h-[650px] bg-blue-600/10 rounded-full blur-[130px]" />
        <div className="absolute top-[35%] -right-52 w-[600px] h-[600px] bg-cyan-500/[0.07] rounded-full blur-[130px]" />
        <div className="absolute -bottom-48 left-[35%] w-[550px] h-[550px] bg-blue-500/[0.05] rounded-full blur-[130px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9">

        {/* =================================================
            TOP NAV / PLATFORM BAR
        ================================================= */}

        <div className="flex items-center justify-between mb-8">

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-white transition group"
          >
            <div className="w-8 h-8 rounded-lg border border-white/10 bg-white/[0.035] flex items-center justify-center group-hover:border-blue-400/30 transition">
              <ArrowLeft className="w-4 h-4" />
            </div>

            Back to Dashboard
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-500">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>

            AstraOS Civic Network
          </div>
        </div>

        {/* =================================================
            HERO HEADER
        ================================================= */}

        <section className="mb-8">

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-7">

            <div className="max-w-3xl">

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/5 text-cyan-300 text-[11px] font-medium mb-5">
                <Activity size={13} />
                CITIZEN CIVIC COMMAND CENTER
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
                My{" "}
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  Complaints
                </span>
              </h1>

              <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl">
                Monitor every civic issue you have reported,
                follow its progress, and stay connected with the
                departments working to resolve it.
              </p>

            </div>

            <Link
              to="/complaints/create"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:from-blue-500 hover:to-cyan-400 transition shrink-0"
            >
              <Plus className="w-5 h-5" />

              Report an Issue

              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition"
              />
            </Link>

          </div>

        </section>

        {/* =================================================
            PLATFORM SUMMARY
        ================================================= */}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          {/* TOTAL */}

          <SummaryCard
            icon={FileText}
            label="Total Complaints"
            value={complaints.length}
            description="Reported by you"
            iconClass="text-blue-400"
            iconBg="bg-blue-500/10"
          />

          {/* ACTIVE */}

          <SummaryCard
            icon={Clock3}
            label="Active Issues"
            value={activeComplaints}
            description="Currently in progress"
            iconClass="text-amber-400"
            iconBg="bg-amber-500/10"
          />

          {/* RESOLVED */}

          <SummaryCard
            icon={CheckCircle2}
            label="Resolved"
            value={resolvedComplaints}
            description="Successfully completed"
            iconClass="text-emerald-400"
            iconBg="bg-emerald-500/10"
          />

          {/* PRIORITY */}

          <SummaryCard
            icon={TrendingUp}
            label="High Priority"
            value={highPriorityComplaints}
            description="Requires close attention"
            iconClass="text-cyan-400"
            iconBg="bg-cyan-500/10"
          />

        </section>

        {/* =================================================
            CIVIC INSIGHT BAR
        ================================================= */}

        <section className="rounded-2xl border border-white/10 bg-white/[0.035] backdrop-blur-xl p-5 mb-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div className="flex items-start gap-3">

              <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center shrink-0">
                <Sparkles
                  size={18}
                  className="text-cyan-300"
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  Your civic activity at a glance
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  AstraOS keeps your reported issues organized
                  throughout their resolution journey.
                </p>
              </div>

            </div>

            <div className="flex flex-wrap items-center gap-3">

              <InsightPill
                icon={CircleDot}
                text="Live tracking"
              />

              <InsightPill
                icon={ShieldCheck}
                text="Secure civic access"
              />

              <InsightPill
                icon={Activity}
                text="Connected departments"
              />

            </div>

          </div>

        </section>

        {/* =================================================
            SECTION TITLE
        ================================================= */}

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">

          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-400 font-medium">
              Issue registry
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mt-1">
              Reported Civic Issues
            </h2>
          </div>

          <p className="text-xs text-slate-600">
            {complaints.length}{" "}
            {complaints.length === 1
              ? "record"
              : "records"}{" "}
            available
          </p>

        </div>

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {complaints.length === 0 ? (

          <section className="rounded-3xl border border-white/10 bg-white/[0.035] backdrop-blur-xl overflow-hidden">

            <div className="px-6 py-20 text-center">

              <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/10 to-cyan-400/10 border border-blue-400/10 flex items-center justify-center">
                <FileText className="w-9 h-9 text-blue-400" />
              </div>

              <div className="inline-flex items-center gap-2 mt-6 px-3 py-1 rounded-full bg-white/[0.035] border border-white/5 text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Civic registry empty
              </div>

              <h2 className="mt-5 text-2xl font-bold">
                No complaints yet
              </h2>

              <p className="mt-3 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                You have not reported any civic issues yet.
                Once you submit one, AstraOS will keep the
                complete resolution journey available here.
              </p>

              <Link
                to="/complaints/create"
                className="group inline-flex items-center gap-2 mt-7 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:from-blue-500 hover:to-cyan-400 transition"
              >
                <Plus className="w-5 h-5" />

                Report Your First Issue

                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition"
                />
              </Link>

            </div>

          </section>

        ) : (

          /* =================================================
             COMPLAINT LIST
          ================================================= */

          <section className="space-y-4">

            {complaints.map((complaint) => (

              <Link
                key={complaint.id}
                to={`/complaints/${complaint.id}`}
                className="group block rounded-2xl border border-white/10 bg-white/[0.035] backdrop-blur-xl p-5 sm:p-6 transition duration-300 hover:-translate-y-0.5 hover:border-blue-400/20 hover:bg-blue-500/[0.035] hover:shadow-2xl hover:shadow-blue-950/20"
              >

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                  {/* =================================================
                      LEFT SIDE
                  ================================================= */}

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-2.5">

                      <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-400/10 flex items-center justify-center shrink-0">
                        <FileText
                          size={16}
                          className="text-blue-400"
                        />
                      </div>

                      <h2 className="text-base sm:text-lg font-bold text-white truncate max-w-full">
                        {complaint.title}
                      </h2>

                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusStyle(
                          complaint.status
                        )}`}
                      >
                        {getStatusLabel(complaint.status)}
                      </span>

                    </div>

                    <p className="text-sm text-slate-500 mt-4 line-clamp-2 leading-relaxed">
                      {complaint.description}
                    </p>

                    {/* META */}

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mt-5">

                      <MetaItem
                        icon={FileText}
                        text={getCategoryLabel(
                          complaint.category
                        )}
                      />

                      <MetaItem
                        icon={CalendarDays}
                        text={formatDate(
                          complaint.createdAt
                        )}
                      />

                      {complaint.location?.address && (
                        <MetaItem
                          icon={MapPin}
                          text={complaint.location.address}
                          truncate
                        />
                      )}

                    </div>

                  </div>

                  {/* =================================================
                      RIGHT SIDE
                  ================================================= */}

                  <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 border-t border-white/5 lg:border-t-0 pt-4 lg:pt-0">

                    {complaint.priority?.level && (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${getPriorityStyle(
                          complaint.priority.level
                        )}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />

                        {complaint.priority.level} Priority
                      </span>
                    )}

                    <div className="w-9 h-9 rounded-xl border border-white/10 bg-white/[0.025] flex items-center justify-center group-hover:border-blue-400/20 group-hover:bg-blue-500/10 transition">

                      <ArrowRight
                        className="w-4 h-4 text-slate-500 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition"
                      />

                    </div>

                  </div>

                </div>

              </Link>

            ))}

          </section>

        )}

        {/* =================================================
            FOOTER INFORMATION
        ================================================= */}

        <footer className="mt-12 pt-6 border-t border-white/5">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div className="flex items-center gap-2">

              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <ShieldCheck size={15} />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-300">
                  Astra<span className="text-cyan-400">OS</span>
                </p>

                <p className="text-[9px] uppercase tracking-[0.16em] text-slate-600">
                  Civic Intelligence Platform
                </p>
              </div>

            </div>

            <p className="text-[11px] text-slate-600">
              Connecting citizens, departments and decision-makers.
            </p>

          </div>

        </footer>

      </main>
    </div>
  );
};

// =========================================================
// SUMMARY CARD
// =========================================================

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
  iconClass,
  iconBg,
}) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.035] backdrop-blur-xl p-5 transition duration-300 hover:-translate-y-0.5 hover:border-blue-400/20 hover:bg-blue-500/[0.035]">

      <div className="flex items-start justify-between gap-4">

        <div>
          <p className="text-xs text-slate-500">
            {label}
          </p>

          <p className="text-3xl font-bold mt-2 tracking-tight">
            {value}
          </p>

          <p className="text-[11px] text-slate-600 mt-1">
            {description}
          </p>
        </div>

        <div
          className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}
        >
          <Icon
            size={18}
            className={iconClass}
          />
        </div>

      </div>

      <div className="mt-4 h-px bg-gradient-to-r from-white/10 to-transparent" />

      <div className="flex items-center gap-1.5 mt-3 text-[10px] text-emerald-400">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        AstraOS tracked
      </div>

    </div>
  );
}

// =========================================================
// META ITEM
// =========================================================

function MetaItem({
  icon: Icon,
  text,
  truncate = false,
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] text-slate-500 ${
        truncate ? "max-w-[260px]" : ""
      }`}
    >
      <Icon
        className="w-3.5 h-3.5 text-slate-600 shrink-0"
      />

      <span
        className={
          truncate ? "truncate" : ""
        }
      >
        {text}
      </span>
    </span>
  );
}

// =========================================================
// INSIGHT PILL
// =========================================================

function InsightPill({
  icon: Icon,
  text,
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.025] px-3 py-2">

      <Icon
        size={13}
        className="text-cyan-400"
      />

      <span className="text-[10px] text-slate-500">
        {text}
      </span>

    </div>
  );
}

export default CitizenComplaints;