


import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Globe2,
  Layers3,
  LogOut,
  RefreshCw,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Wrench,
  Zap,
  Bot,
  Loader2,
} from "lucide-react";

import api from "../api/axios";

export default function OfficerDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH ASSIGNED COMPLAINTS
  // =====================================================

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/officer/complaints");

      if (response.data?.success) {
        setComplaints(
          response.data.data?.complaints || []
        );
      } else {
        setError(
          response.data?.message ||
            "Unable to load assigned complaints."
        );
      }
    } catch (err) {
      console.error(
        "Officer dashboard error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load assigned complaints."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchComplaints();
  }, []);

  // =====================================================
  // STATUS COUNTS
  // =====================================================

  const assignedCount = complaints.filter(
    (complaint) =>
      complaint.status === "ASSIGNED"
  ).length;

  const acceptedCount = complaints.filter(
    (complaint) =>
      complaint.status === "ACCEPTED"
  ).length;

  const workStartedCount = complaints.filter(
    (complaint) =>
      complaint.status === "WORK_STARTED" ||
      complaint.status === "WORK_50_PERCENT"
  ).length;

  const resolvedCount = complaints.filter(
    (complaint) =>
      complaint.status === "RESOLVED" ||
      complaint.status === "CLOSED"
  ).length;

  // =====================================================
  // HELPERS
  // =====================================================

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "RESOLVED":
      case "CLOSED":
        return "bg-emerald-500/10 text-emerald-300 border-emerald-400/20";

      case "WORK_STARTED":
      case "WORK_50_PERCENT":
      case "ACCEPTED":
        return "bg-blue-500/10 text-blue-300 border-blue-400/20";

      case "ASSIGNED":
        return "bg-amber-500/10 text-amber-300 border-amber-400/20";

      default:
        return "bg-white/5 text-slate-300 border-white/10";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "RESOLVED":
      case "CLOSED":
        return (
          <CheckCircle2 className="w-3.5 h-3.5" />
        );

      case "WORK_STARTED":
      case "WORK_50_PERCENT":
      case "ACCEPTED":
        return (
          <Zap className="w-3.5 h-3.5" />
        );

      case "ASSIGNED":
        return (
          <Clock3 className="w-3.5 h-3.5" />
        );

      default:
        return (
          <FileText className="w-3.5 h-3.5" />
        );
    }
  };

  const getPriorityStyle = (level) => {
    switch (level) {
      case "CRITICAL":
        return "bg-red-500/10 text-red-300 border-red-400/20";

      case "HIGH":
        return "bg-orange-500/10 text-orange-300 border-orange-400/20";

      case "MEDIUM":
        return "bg-yellow-500/10 text-yellow-300 border-yellow-400/20";

      default:
        return "bg-emerald-500/10 text-emerald-300 border-emerald-400/20";
    }
  };

  const getPriorityLabel = (level) => {
    return level || "LOW";
  };

  const getCategoryLabel = (category) => {
    if (!category) return "Civic Issue";

    return category
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const formatDate = (date) => {
    if (!date) return "Unknown date";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050b16] text-white flex items-center justify-center relative overflow-hidden">

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-3xl" />

          <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center">

          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center shadow-2xl shadow-blue-900/20">

            <Loader2 className="w-7 h-7 text-blue-400 animate-spin" />

          </div>

          <h2 className="mt-5 text-lg font-semibold">
            Preparing your officer dashboard
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            AstraOS is loading your assigned civic operations...
          </p>

        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="min-h-screen bg-[#050b16] text-white flex items-center justify-center px-6">

        <div className="w-full max-w-xl rounded-3xl border border-red-500/20 bg-white/[0.04] backdrop-blur-xl p-8 shadow-2xl">

          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">

            <AlertCircle className="w-6 h-6 text-red-400" />

          </div>

          <h2 className="mt-5 text-xl font-bold">
            Unable to load officer dashboard
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            {error}
          </p>

          <button
            onClick={fetchComplaints}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 hover:bg-blue-50 transition"
          >
            Try Again
            <RefreshCw className="w-4 h-4" />
          </button>

        </div>

      </div>
    );
  }

  // =====================================================
  // SAFE DATA
  // =====================================================

  const totalComplaints = complaints.length;

  const activeComplaints =
    assignedCount +
    acceptedCount +
    workStartedCount;

  const recentComplaints =
    complaints.slice(0, 5);

  // =====================================================
  // STAT CARD
  // =====================================================

  const StatCard = ({
    label,
    value,
    description,
    icon: Icon,
    iconClass,
  }) => (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] backdrop-blur-xl p-5 hover:border-blue-400/25 hover:bg-white/[0.06] transition-all duration-300">

      <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition" />

      <div className="relative flex items-center justify-between">

        <div>

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-black text-white">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>

        </div>

        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center border ${iconClass}`}
        >
          <Icon className="w-5 h-5" />
        </div>

      </div>

    </div>
  );

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#050b16] text-white relative overflow-hidden">

      {/* =================================================
          GLOBAL BACKGROUND
      ================================================= */}

      <div className="fixed inset-0 pointer-events-none overflow-hidden">

        <div className="absolute -top-48 -left-40 w-[650px] h-[650px] rounded-full bg-blue-600/10 blur-3xl" />

        <div className="absolute top-[35%] -right-48 w-[600px] h-[600px] rounded-full bg-cyan-500/[0.06] blur-3xl" />

        <div className="absolute bottom-[-300px] left-[35%] w-[650px] h-[650px] rounded-full bg-indigo-600/[0.06] blur-3xl" />

      </div>

      {/* =================================================
          STATIC NAVBAR
      ================================================= */}

      <header className="sticky top-0 z-50 h-[72px] border-b border-white/10 bg-[#050b16]/90 backdrop-blur-xl">

        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">

          {/* BRAND */}

          <Link
            to="/officer/dashboard"
            className="flex items-center gap-3"
          >

            <div className="relative">

              <div className="absolute inset-0 rounded-xl bg-blue-500/30 blur-lg" />

              <div className="relative w-10 h-10 rounded-xl bg-slate-950 border border-blue-400/20 flex items-center justify-center">

                <ShieldCheck className="w-5 h-5 text-blue-400" />

              </div>

            </div>

            <div>

              <div className="text-xl font-black tracking-tight">
                Astra<span className="text-blue-400">OS</span>
              </div>

              <div className="hidden sm:block text-[9px] uppercase tracking-[0.25em] text-slate-500 font-semibold">
                Civic Intelligence
              </div>

            </div>

          </Link>

          {/* NAVIGATION */}

          <nav className="hidden md:flex items-center gap-1">

            <Link
              to="/officer/dashboard"
              className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-400/10 text-blue-300 text-sm font-semibold"
            >
              Dashboard
            </Link>

            <Link
              to="/officer/complaints"
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:text-white hover:bg-white/5 transition"
            >
              Assigned Complaints
            </Link>

          </nav>

          {/* RIGHT SIDE */}

          <div className="flex items-center gap-3">

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">

              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

              Officer Network Online

            </div>

            <button
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
              className="w-10 h-10 rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-red-400 hover:border-red-400/20 hover:bg-red-500/5 transition"
              title="Logout"
            >

              <LogOut className="w-4 h-4" />

            </button>

          </div>

        </div>

      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <section className="mb-7">

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">

            <div>

              <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-bold text-blue-400">

                <Sparkles className="w-3.5 h-3.5" />

                Officer Command Center

              </div>

              <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">
                Field Operations Overview
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Manage assigned civic complaints, coordinate
                resolution, and keep the community moving forward.
              </p>

            </div>

            <button
              onClick={fetchComplaints}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] px-5 py-3 text-sm font-bold text-slate-200 transition"
            >

              <RefreshCw className="w-4 h-4" />

              Refresh Operations

            </button>

          </div>

        </section>

        {/* =================================================
            COMMAND GRID
        ================================================= */}

        <section className="grid lg:grid-cols-[1.55fr_.9fr] gap-5 mb-5">

          {/* HERO */}

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0b1730] via-[#081225] to-[#050b16] p-7 sm:p-9">

            <div className="absolute inset-0 opacity-[0.06]">

              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />

            </div>

            <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl" />

            <div className="relative">

              <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-[11px] font-bold text-blue-300">

                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />

                ASTRAOS FIELD OPERATIONS

              </div>

              <h2 className="mt-6 text-3xl sm:text-4xl font-black leading-tight">

                Turn reports.
                <br />

                <span className="text-blue-400">
                  Into resolution.
                </span>

              </h2>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-400">

                AstraOS connects officers with assigned civic
                complaints through intelligent workflows,
                transparent progress tracking, and coordinated
                resolution operations.

              </p>

              <div className="mt-7 grid sm:grid-cols-3 gap-3">

                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">

                  <Bot className="w-5 h-5 text-blue-400" />

                  <p className="mt-3 text-xs font-bold text-white">
                    AI Intelligence
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Intelligent civic issue analysis
                  </p>

                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">

                  <Route className="w-5 h-5 text-cyan-400" />

                  <p className="mt-3 text-xs font-bold text-white">
                    Smart Assignment
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Connected department workflows
                  </p>

                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">

                  <Target className="w-5 h-5 text-emerald-400" />

                  <p className="mt-3 text-xs font-bold text-white">
                    Resolution Tracking
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Monitor work from assignment to closure
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* QUICK ACTIONS */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.045] backdrop-blur-xl p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-400">
                  Quick Actions
                </p>

                <h3 className="mt-2 text-lg font-bold">
                  Officer Workspace
                </h3>

              </div>

              <Sparkles className="w-5 h-5 text-cyan-400" />

            </div>

            <div className="mt-6 space-y-3">

              <Link
                to="/officer/complaints"
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 hover:border-blue-400/30 hover:bg-blue-500/5 transition"
              >

                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">

                  <Layers3 className="w-4 h-4 text-blue-400" />

                </div>

                <div className="flex-1">

                  <p className="text-sm font-semibold">
                    Assigned Complaints
                  </p>

                  <p className="text-[10px] text-slate-500">
                    Review and manage assigned issues
                  </p>

                </div>

                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400" />

              </Link>

              <button
                onClick={fetchComplaints}
                className="group w-full flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 hover:border-cyan-400/30 hover:bg-cyan-500/5 transition text-left"
              >

                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">

                  <RefreshCw className="w-4 h-4 text-cyan-400" />

                </div>

                <div className="flex-1">

                  <p className="text-sm font-semibold">
                    Refresh Operations
                  </p>

                  <p className="text-[10px] text-slate-500">
                    Get the latest complaint assignments
                  </p>

                </div>

                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400" />

              </button>

            </div>

            <div className="mt-5 rounded-xl border border-emerald-400/10 bg-emerald-500/5 p-3 flex items-center gap-3">

              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">

                <ShieldCheck className="w-4 h-4 text-emerald-400" />

              </div>

              <div>

                <p className="text-xs font-semibold text-emerald-300">
                  Officer Network Active
                </p>

                <p className="text-[10px] text-slate-500">
                  Assigned civic operations are securely tracked
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">

          <StatCard
            label="Assigned"
            value={assignedCount}
            description="Waiting for acceptance"
            icon={FileText}
            iconClass="bg-blue-500/10 border-blue-400/20 text-blue-400"
          />

          <StatCard
            label="Accepted"
            value={acceptedCount}
            description="Accepted by you"
            icon={CheckCircle2}
            iconClass="bg-cyan-500/10 border-cyan-400/20 text-cyan-400"
          />

          <StatCard
            label="Work In Progress"
            value={workStartedCount}
            description="Currently being handled"
            icon={Wrench}
            iconClass="bg-purple-500/10 border-purple-400/20 text-purple-400"
          />

          <StatCard
            label="Resolved"
            value={resolvedCount}
            description="Successfully completed"
            icon={ShieldCheck}
            iconClass="bg-emerald-500/10 border-emerald-400/20 text-emerald-400"
          />

        </section>

        {/* =================================================
            OPERATIONS INTELLIGENCE
        ================================================= */}

        <section className="mb-7">

          <div className="flex items-end justify-between mb-4">

            <div>

              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-400">
                Officer Intelligence
              </p>

              <h2 className="mt-2 text-xl font-black">
                Built for coordinated civic operations
              </h2>

            </div>

          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {[
              {
                icon: Bot,
                title: "AI Analysis",
                text: "Understand assigned civic issues intelligently.",
              },
              {
                icon: Route,
                title: "Smart Routing",
                text: "Work within connected civic department workflows.",
              },
              {
                icon: Bell,
                title: "Live Updates",
                text: "Track complaint progress throughout resolution.",
              },
              {
                icon: Globe2,
                title: "Transparency",
                text: "Maintain accountable and traceable civic operations.",
              },
            ].map((item) => {

              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="group rounded-2xl border border-white/10 bg-white/[0.035] p-5 hover:bg-white/[0.055] hover:border-blue-400/20 transition-all"
                >

                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-400/10 flex items-center justify-center group-hover:bg-blue-500/15 transition">

                    <Icon className="w-[18px] h-[18px] text-blue-400" />

                  </div>

                  <h3 className="mt-4 text-sm font-bold">
                    {item.title}
                  </h3>

                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                    {item.text}
                  </p>

                </div>
              );
            })}

          </div>

        </section>

        {/* =================================================
            RECENT ASSIGNED COMPLAINTS
        ================================================= */}

        <section className="rounded-3xl border border-white/10 bg-white/[0.035] overflow-hidden">

          <div className="px-5 sm:px-6 py-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

            <div>

              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-blue-400">

                <Layers3 className="w-3.5 h-3.5" />

                Operations Stream

              </div>

              <h2 className="mt-2 text-lg font-black">
                Recent Assigned Complaints
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Latest civic complaints assigned to your officer account.
              </p>

            </div>

            {complaints.length > 0 && (
              <Link
                to="/officer/complaints"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300"
              >

                View all

                <ArrowRight className="w-3.5 h-3.5" />

              </Link>
            )}

          </div>

          {recentComplaints.length === 0 ? (

            <div className="py-14 text-center">

              <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-400/10 flex items-center justify-center">

                <FileText className="w-6 h-6 text-blue-400" />

              </div>

              <h3 className="mt-4 text-sm font-bold">
                No complaints assigned
              </h3>

              <p className="mt-2 text-xs text-slate-500">
                New complaints assigned to you will appear here.
              </p>

            </div>

          ) : (

            <div className="p-4 sm:p-5 grid lg:grid-cols-2 gap-3">

              {recentComplaints.map((complaint) => (

                <Link
                  key={complaint._id}
                  to={`/officer/complaints/${complaint._id}`}
                  className="group rounded-2xl border border-white/10 bg-white/[0.025] p-4 hover:border-blue-400/20 hover:bg-blue-500/[0.035] transition-all"
                >

                  <div className="flex items-start gap-3">

                    <div className="w-9 h-9 shrink-0 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center">

                      <FileText className="w-4 h-4 text-blue-400" />

                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="flex items-start justify-between gap-3">

                        <h3 className="text-sm font-bold text-white truncate group-hover:text-blue-300 transition">

                          {complaint.title ||
                            "Untitled Complaint"}

                        </h3>

                        <span
                          className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-bold ${getStatusStyle(
                            complaint.status
                          )}`}
                        >

                          {getStatusIcon(
                            complaint.status
                          )}

                          {formatStatus(
                            complaint.status
                          )}

                        </span>

                      </div>

                      <p className="mt-1.5 text-[11px] text-slate-500 line-clamp-2">

                        {complaint.description ||
                          "No description available."}

                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px]">

                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 font-bold ${getPriorityStyle(
                            complaint.priority?.level
                          )}`}
                        >

                          <Zap className="w-3 h-3" />

                          {getPriorityLabel(
                            complaint.priority?.level
                          )}

                        </span>

                        <span className="inline-flex items-center gap-1 text-slate-600">

                          <FileText className="w-3 h-3" />

                          {getCategoryLabel(
                            complaint.category
                          )}

                        </span>

                        {complaint.createdAt && (
                          <span className="inline-flex items-center gap-1 text-slate-600">

                            <Clock3 className="w-3 h-3" />

                            {formatDate(
                              complaint.createdAt
                            )}

                          </span>
                        )}

                        <ArrowRight className="ml-auto w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition" />

                      </div>

                    </div>

                  </div>

                </Link>

              ))}

            </div>

          )}

        </section>

        {/* =================================================
            CONNECTED CIVIC ECOSYSTEM
        ================================================= */}

        <section className="mt-7 relative overflow-hidden rounded-3xl border border-blue-400/15 bg-gradient-to-r from-blue-600/15 via-slate-900/60 to-cyan-500/10 p-7">

          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            <div>

              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-blue-400">

                <Users className="w-3.5 h-3.5" />

                Connected Civic Operations

              </div>

              <h2 className="mt-3 text-xl sm:text-2xl font-black">

                Citizens. Departments. Officers. Administration.

              </h2>

              <p className="mt-2 max-w-2xl text-xs sm:text-sm text-slate-400 leading-relaxed">

                AstraOS connects every stage of the civic
                resolution journey through intelligent workflows,
                transparent tracking, coordinated action, and
                accountable field operations.

              </p>

            </div>

            <Link
              to="/officer/complaints"
              className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-slate-950 hover:bg-blue-50 transition"
            >

              Manage Operations

              <ArrowRight className="w-4 h-4" />

            </Link>

          </div>

        </section>

      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="relative z-10 mt-12 border-t border-white/10 bg-[#030812]">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          <div className="grid md:grid-cols-[1.5fr_1fr_1fr] gap-8">

            {/* BRAND */}

            <div>

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-xl bg-slate-950 border border-blue-400/15 flex items-center justify-center">

                  <ShieldCheck className="w-4 h-4 text-blue-400" />

                </div>

                <div>

                  <p className="font-black">

                    Astra<span className="text-blue-400">
                      OS
                    </span>

                  </p>

                  <p className="text-[9px] uppercase tracking-[0.2em] text-slate-600">
                    Civic Intelligence
                  </p>

                </div>

              </div>

              <p className="mt-4 max-w-md text-xs leading-relaxed text-slate-600">

                A connected civic platform designed to improve
                reporting, coordination, transparency, and
                resolution across communities.

              </p>

            </div>

            {/* PLATFORM */}

            <div>

              <h3 className="text-xs font-bold text-slate-300">
                Officer Platform
              </h3>

              <div className="mt-4 space-y-2.5">

                <Link
                  to="/officer/dashboard"
                  className="block text-xs text-slate-600 hover:text-blue-400 transition"
                >
                  Officer Dashboard
                </Link>

                <Link
                  to="/officer/complaints"
                  className="block text-xs text-slate-600 hover:text-blue-400 transition"
                >
                  Assigned Complaints
                </Link>

              </div>

            </div>

            {/* PRINCIPLES */}

            <div>

              <h3 className="text-xs font-bold text-slate-300">
                AstraOS Principles
              </h3>

              <div className="mt-4 space-y-2.5">

                <div className="flex items-center gap-2 text-xs text-slate-600">

                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />

                  Accountability

                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600">

                  <Zap className="w-3.5 h-3.5 text-blue-500" />

                  Intelligent workflows

                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600">

                  <Users className="w-3.5 h-3.5 text-blue-500" />

                  Coordinated operations

                </div>

              </div>

            </div>

          </div>

          <div className="mt-8 pt-5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">

            <p className="text-[10px] text-slate-700">

              © {new Date().getFullYear()} AstraOS.
              Civic Intelligence Platform.

            </p>

            <div className="flex items-center gap-2 text-[10px] text-slate-700">

              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />

              Officer Network Online

            </div>

          </div>

        </div>

      </footer>

    </div>
  );
}





