


import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Globe2,
  Layers3,
  LogOut,
  MapPin,
  Plus,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Zap,
  Bot,
  Loader2,
  Trophy,
  Medal,
  Star,
  Award,
} from "lucide-react";

import api from "../api/axios";


const CitizenDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [complaints, setComplaints] = useState([]);

  // =====================================================
  // 🏆 REWARD STATE
  // =====================================================

  const [rewards, setRewards] = useState(null);
  const [rewardLoading, setRewardLoading] = useState(true);
  const [rewardError, setRewardError] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH DASHBOARD + COMPLAINTS + REWARDS
  // =====================================================

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        // =================================================
        // DASHBOARD
        // =================================================

        const dashboardResponse = await api.get(
          "/complaints/dashboard"
        );

        const dashboardData = dashboardResponse.data;

        console.log(
          "🔥 CITIZEN DASHBOARD RESPONSE:",
          dashboardData.data
        );

        if (dashboardData.success) {
          setDashboard(dashboardData.data);
        } else {
          throw new Error(
            dashboardData.message ||
              "Failed to load dashboard"
          );
        }

        // =================================================
        // MY COMPLAINTS
        // =================================================

        const complaintsResponse = await api.get(
          "/complaints/my"
        );

        const complaintsData = complaintsResponse.data;

        console.log(
          "📋 CITIZEN COMPLAINTS RESPONSE:",
          complaintsData.data
        );

        if (complaintsData.success) {
          setComplaints(
            complaintsData.data?.complaints || []
          );
        }

        // =================================================
        // 🏆 REWARD SUMMARY
        // =================================================

        try {
          setRewardLoading(true);
          setRewardError("");

          const rewardResponse = await api.get(
            "/rewards/me"
          );

          const rewardData = rewardResponse.data;

          console.log(
            "🏆 CITIZEN REWARD RESPONSE:",
            rewardData.data
          );

          if (rewardData.success) {
            setRewards(rewardData.data);
          } else {
            throw new Error(
              rewardData.message ||
                "Failed to load rewards"
            );
          }
        } catch (rewardErr) {
          console.error(
            "❌ Citizen rewards error:",
            rewardErr
          );

          // -----------------------------------------------
          // IMPORTANT:
          // Reward failure should NOT break dashboard.
          // -----------------------------------------------

          setRewardError(
            rewardErr.response?.data?.message ||
              rewardErr.message ||
              "Unable to load rewards"
          );
        } finally {
          setRewardLoading(false);
        }
      } catch (err) {
        console.error(
          "❌ Citizen dashboard error:",
          err
        );

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

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
            Preparing your civic dashboard
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            AstraOS is loading your community activity...
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
            Unable to load dashboard
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 hover:bg-blue-50 transition"
          >
            Try Again
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>
      </div>
    );
  }

  // =====================================================
  // SAFE DATA
  // =====================================================

  const statusCounts =
    dashboard?.statusCounts || {};

  const totalComplaints =
    dashboard?.totalComplaints || 0;

  const activeComplaints =
    (statusCounts.submitted || 0) +
    (statusCounts.pendingAssignment || 0) +
    (statusCounts.assigned || 0) +
    (statusCounts.accepted || 0) +
    (statusCounts.workStarted || 0) +
    (statusCounts.work50Percent || 0) +
    (statusCounts.reopened || 0);

  const resolvedComplaints =
    (statusCounts.resolved || 0) +
    (statusCounts.citizenVerified || 0) +
    (statusCounts.closed || 0);

  const recentComplaints =
    complaints.slice(0, 5);

  // =====================================================
  // 🏆 SAFE REWARD DATA
  // =====================================================

  const rewardData = rewards || {};

  const civicPoints =
    rewardData.civicPoints ??
    rewardData.points ??
    rewardData.totalPoints ??
    rewardData.rewardPoints ??
    0;

  const rewardLevel =
    rewardData.level ??
    rewardData.currentLevel ??
    rewardData.rank ??
    "Citizen";

  const rewardBadges =
    rewardData.badges ||
    rewardData.earnedBadges ||
    [];

  const nextLevelPoints =
    rewardData.nextLevelPoints ??
    rewardData.nextLevel?.points ??
    null;

  const currentLevelPoints =
    rewardData.currentLevelPoints ??
    rewardData.levelPoints ??
    civicPoints;

  const rewardProgress =
    nextLevelPoints &&
    Number(nextLevelPoints) > 0
      ? Math.min(
          100,
          Math.round(
            (Number(currentLevelPoints) /
              Number(nextLevelPoints)) *
              100
          )
        )
      : null;

  // =====================================================
  // NORMALIZE BADGES
  // =====================================================

  const normalizedBadges =
    Array.isArray(rewardBadges)
      ? rewardBadges
      : [];

  // =====================================================
  // HELPERS
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

  const getStatusStyle = (status) => {
    switch (status) {
      case "RESOLVED":
      case "CITIZEN_VERIFIED":
      case "CLOSED":
        return "bg-emerald-500/10 text-emerald-300 border-emerald-400/20";

      case "WORK_STARTED":
      case "WORK_50_PERCENT":
      case "ACCEPTED":
        return "bg-blue-500/10 text-blue-300 border-blue-400/20";

      case "ASSIGNED":
      case "PENDING_ASSIGNMENT":
        return "bg-amber-500/10 text-amber-300 border-amber-400/20";

      case "REOPENED":
        return "bg-red-500/10 text-red-300 border-red-400/20";

      default:
        return "bg-white/5 text-slate-300 border-white/10";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "RESOLVED":
      case "CITIZEN_VERIFIED":
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
      case "PENDING_ASSIGNMENT":
        return (
          <Clock3 className="w-3.5 h-3.5" />
        );

      case "REOPENED":
        return (
          <AlertCircle className="w-3.5 h-3.5" />
        );

      default:
        return (
          <FileText className="w-3.5 h-3.5" />
        );
    }
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

  const getCategoryLabel = (category) => {
    if (!category) return "Civic Issue";

    return category
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const getBadgeName = (badge) => {
    if (typeof badge === "string") {
      return badge;
    }

    return (
      badge?.name ||
      badge?.code ||
      badge?.title ||
      "Civic Badge"
    );
  };

  const getBadgeDescription = (badge) => {
    if (typeof badge === "string") {
      return "Civic contribution milestone";
    }

    return (
      badge?.description ||
      badge?.message ||
      "Civic contribution milestone"
    );
  };

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
            to="/dashboard"
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

          {/* NAV */}

          <nav className="hidden md:flex items-center gap-1">

            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-400/10 text-blue-300 text-sm font-semibold"
            >
              Dashboard
            </Link>

            <Link
              to="/complaints"
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:text-white hover:bg-white/5 transition"
            >
              My Complaints
            </Link>

            <Link
              to="/complaints/create"
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:text-white hover:bg-white/5 transition"
            >
              Report Issue
            </Link>

          </nav>

          {/* RIGHT */}

          <div className="flex items-center gap-3">

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">

              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

              System Online

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

                Citizen Command Center

              </div>

              <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">
                Civic Overview
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Monitor your reported issues and stay connected
                with the civic resolution process.
              </p>

            </div>

            <Link
              to="/complaints/create"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition"
            >

              <Plus className="w-4 h-4" />

              Report Civic Issue

              <ArrowRight className="w-4 h-4" />

            </Link>

          </div>

        </section>

        {/* =================================================
            🏆 CIVIC REWARDS
        ================================================= */}

        <section className="mb-5">

          <div className="relative overflow-hidden rounded-3xl border border-amber-400/15 bg-gradient-to-br from-[#151329] via-[#0b1224] to-[#050b16] p-6 sm:p-7">

            {/* GLOW */}

            <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl" />

            <div className="absolute -left-20 -bottom-24 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative">

              {/* HEADER */}

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                <div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">

                    <Trophy className="w-3.5 h-3.5" />

                    Civic Rewards

                  </div>

                  <h2 className="mt-3 text-xl sm:text-2xl font-black">
                    Make an impact. Earn recognition.
                  </h2>

                  <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
                    AstraOS recognizes citizens who actively
                    contribute to their community.
                  </p>

                </div>

                <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-400/20 items-center justify-center">

                  <Trophy className="w-7 h-7 text-amber-300" />

                </div>

              </div>

              {/* REWARD CONTENT */}

              {rewardLoading ? (

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex items-center gap-4">

                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/10 flex items-center justify-center">

                    <Loader2 className="w-5 h-5 text-amber-300 animate-spin" />

                  </div>

                  <div>

                    <p className="text-sm font-semibold">
                      Loading your civic rewards...
                    </p>

                    <p className="mt-1 text-[11px] text-slate-500">
                      AstraOS is calculating your contribution.
                    </p>

                  </div>

                </div>

              ) : rewardError ? (

                <div className="mt-6 rounded-2xl border border-red-400/10 bg-red-500/5 p-5 flex items-center gap-3">

                  <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">

                    <AlertCircle className="w-4 h-4 text-red-400" />

                  </div>

                  <div>

                    <p className="text-xs font-semibold text-red-300">
                      Rewards temporarily unavailable
                    </p>

                    <p className="mt-1 text-[10px] text-slate-500">
                      Your complaints are still working normally.
                    </p>

                  </div>

                </div>

              ) : (

                <div className="mt-6 grid lg:grid-cols-[1fr_1.4fr] gap-4">

                  {/* POINTS */}

                  <div className="rounded-2xl border border-amber-400/15 bg-amber-500/[0.045] p-5">

                    <div className="flex items-start justify-between">

                      <div>

                        <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-slate-500">
                          Civic Points
                        </p>

                        <div className="mt-2 flex items-end gap-2">

                          <span className="text-4xl font-black text-white">
                            {civicPoints}
                          </span>

                          <span className="mb-1 text-xs font-bold text-amber-300">
                            points
                          </span>

                        </div>

                      </div>

                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/15 flex items-center justify-center">

                        <Star className="w-5 h-5 text-amber-300" />

                      </div>

                    </div>

                    <div className="mt-5">

                      <div className="flex items-center justify-between text-[10px]">

                        <span className="text-slate-500">
                          Current Level
                        </span>

                        <span className="font-bold text-amber-300">
                          {typeof rewardLevel === "object"
                            ? rewardLevel?.name ||
                              rewardLevel?.title ||
                              "Citizen"
                            : rewardLevel}
                        </span>

                      </div>

                      {rewardProgress !== null && (
                        <>

                          <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">

                            <div
                              className="h-full rounded-full bg-amber-400 transition-all duration-700"
                              style={{
                                width: `${rewardProgress}%`,
                              }}
                            />

                          </div>

                          <p className="mt-2 text-[9px] text-slate-600">
                            {currentLevelPoints} /{" "}
                            {nextLevelPoints} points
                          </p>

                        </>
                      )}

                    </div>

                  </div>

                  {/* BADGES */}

                  <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-slate-500">
                          Achievements
                        </p>

                        <p className="mt-1 text-sm font-bold">
                          Civic Badges
                        </p>

                      </div>

                      <Medal className="w-5 h-5 text-amber-300" />

                    </div>

                    {normalizedBadges.length === 0 ? (

                      <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3">

                        <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center">

                          <Award className="w-4 h-4 text-slate-600" />

                        </div>

                        <div>

                          <p className="text-xs font-semibold text-slate-400">
                            No badges yet
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-600">
                            Keep contributing to unlock achievements.
                          </p>

                        </div>

                      </div>

                    ) : (

                      <div className="mt-4 flex flex-wrap gap-2">

                        {normalizedBadges.map(
                          (badge, index) => {

                            const badgeName =
                              getBadgeName(badge);

                            const badgeDescription =
                              getBadgeDescription(
                                badge
                              );

                            return (
                              <div
                                key={`${badgeName}-${index}`}
                                title={
                                  badgeDescription
                                }
                                className="group flex items-center gap-2 rounded-xl border border-amber-400/15 bg-amber-500/[0.06] px-3 py-2"
                              >

                                <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">

                                  <Medal className="w-3.5 h-3.5 text-amber-300" />

                                </div>

                                <div>

                                  <p className="text-[10px] font-bold text-amber-200">
                                    {badgeName.replaceAll(
                                      "_",
                                      " "
                                    )}
                                  </p>

                                  <p className="text-[8px] text-slate-600">
                                    Achievement unlocked
                                  </p>

                                </div>

                              </div>
                            );
                          }
                        )}

                      </div>

                    )}

                  </div>

                </div>

              )}

            </div>

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

                ASTRAOS CIVIC NETWORK

              </div>

              <h2 className="mt-6 text-3xl sm:text-4xl font-black leading-tight">

                Your voice.
                <br />

                <span className="text-blue-400">
                  Your community.
                </span>

              </h2>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-400">
                Report civic problems and let AstraOS connect
                them with intelligent workflows, departments,
                officers, and resolution tracking.
              </p>

              <div className="mt-7 grid sm:grid-cols-3 gap-3">

                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">

                  <Bot className="w-5 h-5 text-blue-400" />

                  <p className="mt-3 text-xs font-bold text-white">
                    AI Analysis
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Intelligent issue understanding
                  </p>

                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">

                  <Route className="w-5 h-5 text-cyan-400" />

                  <p className="mt-3 text-xs font-bold text-white">
                    Smart Routing
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Connected civic departments
                  </p>

                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">

                  <Target className="w-5 h-5 text-emerald-400" />

                  <p className="mt-3 text-xs font-bold text-white">
                    Tracking
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Transparent resolution progress
                  </p>

                </div>

              </div>

            </div>
          </div>

          {/* QUICK ACTION PANEL */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.045] backdrop-blur-xl p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-400">
                  Quick Actions
                </p>

                <h3 className="mt-2 text-lg font-bold">
                  Civic Workspace
                </h3>

              </div>

              <Sparkles className="w-5 h-5 text-cyan-400" />

            </div>

            <div className="mt-6 space-y-3">

              <Link
                to="/complaints/create"
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 hover:border-blue-400/30 hover:bg-blue-500/5 transition"
              >

                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">

                  <Plus className="w-4 h-4 text-blue-400" />

                </div>

                <div className="flex-1">

                  <p className="text-sm font-semibold">
                    Report Issue
                  </p>

                  <p className="text-[10px] text-slate-500">
                    Submit a new civic complaint
                  </p>

                </div>

                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400" />

              </Link>

              <Link
                to="/complaints"
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 hover:border-blue-400/30 hover:bg-blue-500/5 transition"
              >

                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">

                  <Layers3 className="w-4 h-4 text-cyan-400" />

                </div>

                <div className="flex-1">

                  <p className="text-sm font-semibold">
                    My Complaints
                  </p>

                  <p className="text-[10px] text-slate-500">
                    Review all reported issues
                  </p>

                </div>

                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400" />

              </Link>

            </div>

            <div className="mt-5 rounded-xl border border-emerald-400/10 bg-emerald-500/5 p-3 flex items-center gap-3">

              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">

                <ShieldCheck className="w-4 h-4 text-emerald-400" />

              </div>

              <div>

                <p className="text-xs font-semibold text-emerald-300">
                  Civic Network Active
                </p>

                <p className="text-[10px] text-slate-500">
                  Your reports are securely tracked
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">

          <StatCard
            label="Total Complaints"
            value={totalComplaints}
            description="Issues reported by you"
            icon={FileText}
            iconClass="bg-blue-500/10 border-blue-400/20 text-blue-400"
          />

          <StatCard
            label="Active Issues"
            value={activeComplaints}
            description="Currently in resolution"
            icon={Clock3}
            iconClass="bg-amber-500/10 border-amber-400/20 text-amber-400"
          />

          <StatCard
            label="Resolved"
            value={resolvedComplaints}
            description="Successfully completed"
            icon={CheckCircle2}
            iconClass="bg-emerald-500/10 border-emerald-400/20 text-emerald-400"
          />

        </section>

        {/* =================================================
            PLATFORM CAPABILITIES
        ================================================= */}

        <section className="mb-7">

          <div className="flex items-end justify-between mb-4">

            <div>

              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-400">
                Platform Intelligence
              </p>

              <h2 className="mt-2 text-xl font-black">
                Built for connected civic operations
              </h2>

            </div>

          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {[
              {
                icon: Bot,
                title: "AI Analysis",
                text: "Understand civic issues intelligently.",
              },
              {
                icon: Route,
                title: "Smart Routing",
                text: "Connect complaints to the right department.",
              },
              {
                icon: Bell,
                title: "Live Updates",
                text: "Stay informed throughout resolution.",
              },
              {
                icon: Globe2,
                title: "Transparency",
                text: "Create a connected civic ecosystem.",
              },
            ].map((item) => {

              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="group rounded-2xl border border-white/10 bg-white/[0.035] p-5 hover:bg-white/[0.055] hover:border-blue-400/20 transition-all"
                >

                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-400/10 flex items-center justify-center group-hover:bg-blue-500/15 transition">

                    <Icon className="w-4.5 h-4.5 text-blue-400" />

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
            RECENT COMPLAINTS
        ================================================= */}

        <section className="rounded-3xl border border-white/10 bg-white/[0.035] overflow-hidden">

          <div className="px-5 sm:px-6 py-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

            <div>

              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-blue-400">

                <Layers3 className="w-3.5 h-3.5" />

                Activity Stream

              </div>

              <h2 className="mt-2 text-lg font-black">
                Recent Complaints
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Latest civic issues reported from your account.
              </p>

            </div>

            {complaints.length > 0 && (
              <Link
                to="/complaints"
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
                No complaints yet
              </h3>

              <p className="mt-2 text-xs text-slate-500">
                Your reported civic issues will appear here.
              </p>

              <Link
                to="/complaints/create"
                className="inline-flex items-center gap-2 mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold hover:bg-blue-500 transition"
              >

                <Plus className="w-3.5 h-3.5" />

                Report First Issue

              </Link>

            </div>

          ) : (

            <div className="p-4 sm:p-5 grid lg:grid-cols-2 gap-3">

              {recentComplaints.map(
                (complaint) => (

                  <Link
                    key={complaint.id}
                    to={`/complaints/${complaint.id}`}
                    className="group rounded-2xl border border-white/10 bg-white/[0.025] p-4 hover:border-blue-400/20 hover:bg-blue-500/[0.035] transition-all"
                  >

                    <div className="flex items-start gap-3">

                      <div className="w-9 h-9 shrink-0 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center">

                        <FileText className="w-4 h-4 text-blue-400" />

                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex items-start justify-between gap-3">

                          <h3 className="text-sm font-bold text-white truncate group-hover:text-blue-300 transition">
                            {complaint.title}
                          </h3>

                          <span
                            className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[9px] font-bold ${getStatusStyle(
                              complaint.status
                            )}`}
                          >

                            {getStatusIcon(
                              complaint.status
                            )}

                            {getStatusLabel(
                              complaint.status
                            )}

                          </span>

                        </div>

                        <p className="mt-1.5 text-[11px] text-slate-500 line-clamp-1">
                          {complaint.description}
                        </p>

                        <div className="mt-3 flex items-center gap-4 text-[10px] text-slate-600">

                          <span className="inline-flex items-center gap-1">

                            <FileText className="w-3 h-3" />

                            {getCategoryLabel(
                              complaint.category
                            )}

                          </span>

                          <span className="inline-flex items-center gap-1">

                            <CalendarDays className="w-3 h-3" />

                            {formatDate(
                              complaint.createdAt
                            )}

                          </span>

                          {complaint.location?.address && (
                            <span className="hidden sm:inline-flex items-center gap-1 max-w-[180px] truncate">

                              <MapPin className="w-3 h-3 shrink-0" />

                              {complaint.location.address}

                            </span>
                          )}

                          <ArrowRight className="ml-auto w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition" />

                        </div>

                      </div>

                    </div>

                  </Link>

                )
              )}

            </div>

          )}

        </section>

        {/* =================================================
            CIVIC ECOSYSTEM
        ================================================= */}

        <section className="mt-7 relative overflow-hidden rounded-3xl border border-blue-400/15 bg-gradient-to-r from-blue-600/15 via-slate-900/60 to-cyan-500/10 p-7">

          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            <div>

              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-blue-400">

                <Users className="w-3.5 h-3.5" />

                Connected Civic Ecosystem

              </div>

              <h2 className="mt-3 text-xl sm:text-2xl font-black">
                Citizens. Departments. Officers. Administration.
              </h2>

              <p className="mt-2 max-w-2xl text-xs sm:text-sm text-slate-400 leading-relaxed">
                AstraOS connects every stage of the civic
                resolution journey through intelligent workflows,
                transparent tracking, and coordinated action.
              </p>

            </div>

            <Link
              to="/complaints/create"
              className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-slate-950 hover:bg-blue-50 transition"
            >

              Make a Difference

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

            <div>

              <div className="flex items-center gap-3">

                <div className="w-9 h-9 rounded-xl bg-slate-950 border border-blue-400/15 flex items-center justify-center">

                  <ShieldCheck className="w-4 h-4 text-blue-400" />

                </div>

                <div>

                  <p className="font-black">
                    Astra<span className="text-blue-400">OS</span>
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

            <div>

              <h3 className="text-xs font-bold text-slate-300">
                Platform
              </h3>

              <div className="mt-4 space-y-2.5">

                <Link
                  to="/dashboard"
                  className="block text-xs text-slate-600 hover:text-blue-400 transition"
                >
                  Citizen Dashboard
                </Link>

                <Link
                  to="/complaints"
                  className="block text-xs text-slate-600 hover:text-blue-400 transition"
                >
                  My Complaints
                </Link>

                <Link
                  to="/complaints/create"
                  className="block text-xs text-slate-600 hover:text-blue-400 transition"
                >
                  Report an Issue
                </Link>

              </div>

            </div>

            <div>

              <h3 className="text-xs font-bold text-slate-300">
                AstraOS Principles
              </h3>

              <div className="mt-4 space-y-2.5">

                <div className="flex items-center gap-2 text-xs text-slate-600">

                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />

                  Transparency

                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600">

                  <Zap className="w-3.5 h-3.5 text-blue-500" />

                  Intelligent workflows

                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600">

                  <Users className="w-3.5 h-3.5 text-blue-500" />

                  Community collaboration

                </div>

              </div>

            </div>

          </div>

          <div className="mt-8 pt-5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">

            <p className="text-[10px] text-slate-700">
              © {new Date().getFullYear()} AstraOS. Civic Intelligence Platform.
            </p>

            <div className="flex items-center gap-2 text-[10px] text-slate-700">

              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />

              Platform Online

            </div>

          </div>

        </div>

      </footer>

    </div>
  );
};

export default CitizenDashboard;





