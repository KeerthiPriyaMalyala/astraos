


import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Users,
  Activity,
  Sparkles,
  BarChart3,
  Layers3,
  Globe2,
  Zap,
  LogOut,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

import api from "../api/axios";

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH ADMIN DASHBOARD
  // =====================================================

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/dashboard");

      const data = response.data;

      console.log(
        "📊 [AstraOS] ADMIN DASHBOARD:",
        data.data
      );

      if (!data.success) {
        throw new Error(
          data.message || "Failed to load admin dashboard"
        );
      }

      setDashboard(data.data);
    } catch (err) {
      console.error(
        "❌ [AstraOS] Admin dashboard error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchDashboard();
  }, []);

  // =====================================================
  // HELPERS
  // =====================================================

  const formatLabel = (value) => {
    if (!value) return "Unknown";

    return value
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatDate = (date) => {
    if (!date) return "Unknown";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getMaxCount = (items = []) => {
    if (!items.length) return 1;

    return Math.max(
      ...items.map((item) => item.count || 0),
      1
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

      case "PENDING_ASSIGNMENT":
        return "bg-orange-500/10 text-orange-300 border-orange-400/20";

      default:
        return "bg-white/5 text-slate-300 border-white/10";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "RESOLVED":
      case "CLOSED":
        return <CheckCircle2 className="w-3.5 h-3.5" />;

      case "WORK_STARTED":
      case "WORK_50_PERCENT":
      case "ACCEPTED":
        return <Zap className="w-3.5 h-3.5" />;

      case "ASSIGNED":
      case "PENDING_ASSIGNMENT":
        return <Clock3 className="w-3.5 h-3.5" />;

      default:
        return <FileText className="w-3.5 h-3.5" />;
    }
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
            Preparing administration center
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            AstraOS is loading civic intelligence and operations...
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
            Unable to load administration dashboard
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            {error}
          </p>

          {error.toLowerCase().includes("permission") && (
            <p className="mt-3 text-xs text-red-300">
              This dashboard is available only to ADMIN users.
            </p>
          )}

          <button
            onClick={fetchDashboard}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 hover:bg-blue-50 transition"
          >
            Try Again
            <RefreshCw className="w-4 h-4" />
          </button>

        </div>

      </div>
    );
  }

  if (!dashboard) return null;

  // =====================================================
  // DATA
  // =====================================================

  const {
    overview = {},
    complaints = {},
    recentComplaints = [],
  } = dashboard;

  const statusMax = getMaxCount(complaints.byStatus);
  const priorityMax = getMaxCount(complaints.byPriority);
  const categoryMax = getMaxCount(complaints.byCategory);
  const departmentMax = getMaxCount(
    complaints.byDepartment
  );

  // =====================================================
  // STAT CARDS
  // =====================================================

  const statCards = [
    {
      label: "Total Complaints",
      value: overview.totalComplaints ?? 0,
      description: "All civic complaints",
      icon: FileText,
      style:
        "bg-blue-500/10 border-blue-400/20 text-blue-400",
    },
    {
      label: "Government Users",
      value: overview.totalGovernmentUsers ?? 0,
      description: "Registered government users",
      icon: Users,
      style:
        "bg-violet-500/10 border-violet-400/20 text-violet-400",
    },
    {
      label: "Active Users",
      value: overview.activeGovernmentUsers ?? 0,
      description: "Currently active accounts",
      icon: Activity,
      style:
        "bg-emerald-500/10 border-emerald-400/20 text-emerald-400",
    },
    {
      label: "Departments",
      value: overview.totalDepartments ?? 0,
      description: "Connected departments",
      icon: Building2,
      style:
        "bg-cyan-500/10 border-cyan-400/20 text-cyan-400",
    },
    {
      label: "Active Departments",
      value: overview.activeDepartments ?? 0,
      description: "Operational departments",
      icon: CheckCircle2,
      style:
        "bg-teal-500/10 border-teal-400/20 text-teal-400",
    },
    {
      label: "High Priority",
      value: overview.highPriority ?? 0,
      description: "Requires attention",
      icon: ShieldAlert,
      style:
        "bg-red-500/10 border-red-400/20 text-red-400",
    },
    {
      label: "Pending Assignments",
      value: overview.pendingAssignments ?? 0,
      description: "Awaiting assignment",
      icon: Clock3,
      style:
        "bg-orange-500/10 border-orange-400/20 text-orange-400",
    },
  ];

  // =====================================================
  // STAT CARD
  // =====================================================

  const StatCard = ({
    label,
    value,
    description,
    icon: Icon,
    style,
  }) => (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] backdrop-blur-xl p-5 hover:border-blue-400/25 hover:bg-white/[0.06] transition-all duration-300">

      <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition" />

      <div className="relative flex items-center justify-between">

        <div>

          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-black text-white">
            {value}
          </p>

          <p className="mt-1 text-[11px] text-slate-500">
            {description}
          </p>

        </div>

        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center border ${style}`}
        >
          <Icon className="w-5 h-5" />
        </div>

      </div>

    </div>
  );

  // =====================================================
  // ANALYTICS CARD
  // =====================================================

  const AnalyticsCard = ({
    title,
    description,
    items,
    max,
    barClass,
    department = false,
  }) => (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] backdrop-blur-xl p-6">

      <div className="flex items-start justify-between gap-4 mb-6">

        <div>

          <h2 className="text-lg font-bold text-white">
            {title}
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            {description}
          </p>

        </div>

        <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-400/10 flex items-center justify-center">

          <BarChart3 className="w-4 h-4 text-blue-400" />

        </div>

      </div>

      <div className="space-y-5">

        {items?.length ? (
          items.map((item) => (

            <div
              key={
                department
                  ? item.departmentId
                  : item._id
              }
            >

              <div className="flex justify-between gap-4 text-xs mb-2">

                <div className="min-w-0">

                  <span className="font-semibold text-slate-300">

                    {department
                      ? item.name
                      : formatLabel(item._id)}

                  </span>

                  {department && item.code && (
                    <span className="text-[10px] text-slate-600 ml-2">
                      {item.code}
                    </span>
                  )}

                </div>

                <span className="font-bold text-white">
                  {item.count}
                </span>

              </div>

              <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">

                <div
                  className={`h-full rounded-full ${barClass}`}
                  style={{
                    width: `${
                      (item.count / max) * 100
                    }%`,
                  }}
                />

              </div>

            </div>

          ))
        ) : (

          <div className="py-6 text-center">

            <BarChart3 className="w-6 h-6 text-slate-700 mx-auto" />

            <p className="text-xs text-slate-600 mt-2">
              No data available.
            </p>

          </div>

        )}

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

        <div className="absolute top-[30%] -right-48 w-[600px] h-[600px] rounded-full bg-cyan-500/[0.06] blur-3xl" />

        <div className="absolute bottom-[-300px] left-[35%] w-[650px] h-[650px] rounded-full bg-indigo-600/[0.06] blur-3xl" />

      </div>

      {/* =================================================
          STATIC NAVBAR
      ================================================= */}

      <header className="sticky top-0 z-50 h-[72px] border-b border-white/10 bg-[#050b16]/90 backdrop-blur-xl">

        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">

          {/* BRAND */}

          <Link
            to="/admin/dashboard"
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

                Astra<span className="text-blue-400">
                  OS
                </span>

              </div>

              <div className="hidden sm:block text-[9px] uppercase tracking-[0.25em] text-slate-500 font-semibold">
                Civic Intelligence
              </div>

            </div>

          </Link>

          {/* NAVIGATION */}

          <nav className="hidden lg:flex items-center gap-1">

            <Link
              to="/admin/dashboard"
              className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-400/10 text-blue-300 text-sm font-semibold"
            >
              Dashboard
            </Link>

            <Link
              to="/admin/complaints"
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:text-white hover:bg-white/5 transition"
            >
              Complaints
            </Link>

            <Link
              to="/admin/users"
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:text-white hover:bg-white/5 transition"
            >
              Users
            </Link>

            <Link
              to="/admin/departments"
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:text-white hover:bg-white/5 transition"
            >
              Departments
            </Link>

          </nav>

          {/* RIGHT */}

          <div className="flex items-center gap-3">

            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">

              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

              Administration Network Online

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
            HEADER
        ================================================= */}

        <section className="mb-7">

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">

            <div>

              <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-bold text-blue-400">

                <Sparkles className="w-3.5 h-3.5" />

                AstraOS Administration Center

              </div>

              <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">

                Civic Operations
                <span className="text-blue-400">
                  {" "}Command Center
                </span>

              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-500">

                Monitor complaints, government users,
                departments, priorities, and the complete
                civic resolution ecosystem from one place.

              </p>

            </div>

            <button
              onClick={fetchDashboard}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] px-5 py-3 text-sm font-bold text-slate-200 transition"
            >

              <RefreshCw className="w-4 h-4" />

              Refresh Intelligence

            </button>

          </div>

        </section>

        {/* =================================================
            HERO COMMAND GRID
        ================================================= */}

        <section className="grid lg:grid-cols-[1.55fr_.9fr] gap-5 mb-6">

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

                ASTRAOS GOVERNANCE INTELLIGENCE

              </div>

              <h2 className="mt-6 text-3xl sm:text-4xl font-black leading-tight">

                See the city.
                <br />

                <span className="text-blue-400">
                  Understand the system.
                </span>

              </h2>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-400">

                AstraOS brings complaints, departments,
                government users, priorities, and resolution
                activity together into a unified civic intelligence
                command center.

              </p>

              <div className="mt-7 grid sm:grid-cols-3 gap-3">

                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">

                  <BarChart3 className="w-5 h-5 text-blue-400" />

                  <p className="mt-3 text-xs font-bold text-white">
                    Civic Analytics
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Understand operational trends
                  </p>

                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">

                  <Building2 className="w-5 h-5 text-cyan-400" />

                  <p className="mt-3 text-xs font-bold text-white">
                    Department Network
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Monitor connected departments
                  </p>

                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">

                  <ShieldCheck className="w-5 h-5 text-emerald-400" />

                  <p className="mt-3 text-xs font-bold text-white">
                    Governance
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Transparent civic administration
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* QUICK ADMIN ACTIONS */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.045] backdrop-blur-xl p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-400">
                  Quick Actions
                </p>

                <h3 className="mt-2 text-lg font-bold">
                  Administration Workspace
                </h3>

              </div>

              <Sparkles className="w-5 h-5 text-cyan-400" />

            </div>

            <div className="mt-6 space-y-3">

              <Link
                to="/admin/complaints"
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 hover:border-blue-400/30 hover:bg-blue-500/5 transition"
              >

                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">

                  <FileText className="w-4 h-4 text-blue-400" />

                </div>

                <div className="flex-1">

                  <p className="text-sm font-semibold">
                    Complaint Operations
                  </p>

                  <p className="text-[10px] text-slate-500">
                    Review and manage civic complaints
                  </p>

                </div>

                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition" />

              </Link>

              <Link
                to="/admin/users"
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 hover:border-violet-400/30 hover:bg-violet-500/5 transition"
              >

                <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center">

                  <Users className="w-4 h-4 text-violet-400" />

                </div>

                <div className="flex-1">

                  <p className="text-sm font-semibold">
                    Government Users
                  </p>

                  <p className="text-[10px] text-slate-500">
                    Manage government accounts
                  </p>

                </div>

                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 group-hover:translate-x-1 transition" />

              </Link>

              <Link
                to="/admin/departments"
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 hover:border-cyan-400/30 hover:bg-cyan-500/5 transition"
              >

                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">

                  <Building2 className="w-4 h-4 text-cyan-400" />

                </div>

                <div className="flex-1">

                  <p className="text-sm font-semibold">
                    Departments
                  </p>

                  <p className="text-[10px] text-slate-500">
                    Manage civic department network
                  </p>

                </div>

                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition" />

              </Link>

            </div>

            <div className="mt-5 rounded-xl border border-emerald-400/10 bg-emerald-500/5 p-3 flex items-center gap-3">

              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">

                <ShieldCheck className="w-4 h-4 text-emerald-400" />

              </div>

              <div>

                <p className="text-xs font-semibold text-emerald-300">
                  Administration Network Active
                </p>

                <p className="text-[10px] text-slate-500">
                  Civic operations are securely monitored
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            OVERVIEW STATS
        ================================================= */}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">

          {statCards.map((card) => (
            <StatCard
              key={card.label}
              {...card}
            />
          ))}

        </section>

        {/* =================================================
            INTELLIGENCE STRIP
        ================================================= */}

        <section className="mb-7">

          <div className="flex items-end justify-between mb-4">

            <div>

              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-400">
                Governance Intelligence
              </p>

              <h2 className="mt-2 text-xl font-black">
                A connected view of civic operations
              </h2>

            </div>

          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {[
              {
                icon: BarChart3,
                title: "Operational Analytics",
                text: "Understand complaint volume, status, priority, and category trends.",
              },
              {
                icon: Building2,
                title: "Department Oversight",
                text: "Monitor workload and complaint distribution across departments.",
              },
              {
                icon: Users,
                title: "Government Network",
                text: "Track government users and active operational accounts.",
              },
              {
                icon: Globe2,
                title: "Civic Transparency",
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
            ANALYTICS
        ================================================= */}

        <section className="mb-7">

          <div className="flex items-end justify-between mb-4">

            <div>

              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-400">
                Civic Analytics
              </p>

              <h2 className="mt-2 text-xl font-black">
                System Intelligence Overview
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Visualize how complaints move through the AstraOS ecosystem.
              </p>

            </div>

            <TrendingUp className="hidden sm:block w-5 h-5 text-blue-400" />

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            <AnalyticsCard
              title="Complaints by Status"
              description="Current complaint lifecycle distribution"
              items={complaints.byStatus}
              max={statusMax}
              barClass="bg-blue-500"
            />

            <AnalyticsCard
              title="Complaints by Priority"
              description="Distribution of civic issue priority levels"
              items={complaints.byPriority}
              max={priorityMax}
              barClass="bg-orange-500"
            />

            <AnalyticsCard
              title="Complaints by Category"
              description="Civic issue categories reported by citizens"
              items={complaints.byCategory}
              max={categoryMax}
              barClass="bg-violet-500"
            />

            <AnalyticsCard
              title="Complaints by Department"
              description="Complaint workload across departments"
              items={complaints.byDepartment}
              max={departmentMax}
              barClass="bg-emerald-500"
              department
            />

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

                Operations Stream

              </div>

              <h2 className="mt-2 text-lg font-black">
                Recent Civic Complaints
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Latest complaints submitted across the AstraOS platform.
              </p>

            </div>

            <Link
              to="/admin/complaints"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300"
            >

              View all

              <ArrowRight className="w-3.5 h-3.5" />

            </Link>

          </div>

          {recentComplaints.length === 0 ? (

            <div className="py-14 text-center">

              <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-400/10 flex items-center justify-center">

                <FileText className="w-6 h-6 text-blue-400" />

              </div>

              <h3 className="mt-4 text-sm font-bold">
                No complaints available
              </h3>

              <p className="mt-2 text-xs text-slate-500">
                New civic complaints will appear here.
              </p>

            </div>

          ) : (

            <div className="p-4 sm:p-5 grid lg:grid-cols-2 gap-3">

              {recentComplaints.map((complaint) => (

                <Link
                  key={complaint._id}
                  to={`/admin/complaints/${complaint._id}`}
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

                          {formatLabel(
                            complaint.status
                          )}

                        </span>

                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-slate-600">

                        <span>
                          Citizen:{" "}
                          <span className="text-slate-400">
                            {complaint.citizen?.name ||
                              "Unknown"}
                          </span>
                        </span>

                        <span>
                          Department:{" "}
                          <span className="text-slate-400">
                            {complaint.department?.name ||
                              "Unassigned"}
                          </span>
                        </span>

                        <span>
                          <Clock3 className="inline w-3 h-3 mr-1" />

                          {formatDate(
                            complaint.createdAt
                          )}

                        </span>

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

                Connected Civic Ecosystem

              </div>

              <h2 className="mt-3 text-xl sm:text-2xl font-black">

                Citizens. Departments. Officers. Administration.

              </h2>

              <p className="mt-2 max-w-2xl text-xs sm:text-sm text-slate-400 leading-relaxed">

                AstraOS connects every stage of the civic
                resolution journey through intelligent workflows,
                transparent tracking, coordinated action, and
                accountable governance.

              </p>

            </div>

            <Link
              to="/admin/complaints"
              className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-slate-950 hover:bg-blue-50 transition"
            >

              Explore Complaints

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
                reporting, coordination, transparency, governance,
                and resolution across communities.

              </p>

            </div>

            {/* PLATFORM */}

            <div>

              <h3 className="text-xs font-bold text-slate-300">
                Administration Platform
              </h3>

              <div className="mt-4 space-y-2.5">

                <Link
                  to="/admin/dashboard"
                  className="block text-xs text-slate-600 hover:text-blue-400 transition"
                >
                  Admin Dashboard
                </Link>

                <Link
                  to="/admin/complaints"
                  className="block text-xs text-slate-600 hover:text-blue-400 transition"
                >
                  Complaints
                </Link>

                <Link
                  to="/admin/users"
                  className="block text-xs text-slate-600 hover:text-blue-400 transition"
                >
                  Government Users
                </Link>

                <Link
                  to="/admin/departments"
                  className="block text-xs text-slate-600 hover:text-blue-400 transition"
                >
                  Departments
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

                  <Globe2 className="w-3.5 h-3.5 text-blue-500" />

                  Civic transparency

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

              Administration Network Online

            </div>

          </div>

        </div>

      </footer>

    </div>
  );
};

export default AdminDashboard;