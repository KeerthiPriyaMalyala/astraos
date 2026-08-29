
import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  Globe2,
  Layers3,
  LogOut,
  RefreshCw,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  UserCheck,
  Users,
  Wrench,
  Zap,
  Bot,
  Loader2,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function DepartmentDashboard() {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH DEPARTMENT DASHBOARD
  // =====================================================

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/departments/dashboard"
      );

      if (response.data?.success) {
        setDashboard(response.data.data);
      } else {
        setError(
          response.data?.message ||
            "Unable to load department dashboard."
        );
      }
    } catch (err) {
      console.error(
        "Department dashboard error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load department dashboard."
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
  // STATISTICS
  // =====================================================

  const stats = [
    {
      label: "Total Complaints",
      value: dashboard?.totalComplaints ?? 0,
      description: "All complaints under department",
      icon: ClipboardList,
      iconClass:
        "bg-blue-500/10 border-blue-400/20 text-blue-400",
    },
    {
      label: "Pending Assignment",
      value: dashboard?.pendingAssignment ?? 0,
      description: "Waiting for officer assignment",
      icon: Clock3,
      iconClass:
        "bg-amber-500/10 border-amber-400/20 text-amber-400",
    },
    {
      label: "Assigned",
      value: dashboard?.assigned ?? 0,
      description: "Assigned to field officers",
      icon: UserCheck,
      iconClass:
        "bg-cyan-500/10 border-cyan-400/20 text-cyan-400",
    },
    {
      label: "Accepted",
      value: dashboard?.accepted ?? 0,
      description: "Accepted by officers",
      icon: ShieldCheck,
      iconClass:
        "bg-indigo-500/10 border-indigo-400/20 text-indigo-400",
    },
    {
      label: "Work Started",
      value: dashboard?.workStarted ?? 0,
      description: "Currently under execution",
      icon: Wrench,
      iconClass:
        "bg-purple-500/10 border-purple-400/20 text-purple-400",
    },
    {
      label: "50% Progress",
      value: dashboard?.work50Percent ?? 0,
      description: "Midway through resolution",
      icon: Target,
      iconClass:
        "bg-blue-500/10 border-blue-400/20 text-blue-400",
    },
    {
      label: "Resolved",
      value: dashboard?.resolved ?? 0,
      description: "Resolution completed",
      icon: CheckCircle2,
      iconClass:
        "bg-emerald-500/10 border-emerald-400/20 text-emerald-400",
    },
    {
      label: "Closed",
      value: dashboard?.closed ?? 0,
      description: "Successfully closed",
      icon: ShieldCheck,
      iconClass:
        "bg-emerald-500/10 border-emerald-400/20 text-emerald-400",
    },
  ];

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
            Preparing your department dashboard
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            AstraOS is loading your department operations...
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
            Unable to load department dashboard
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            {error}
          </p>

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

      <div className="relative flex items-center justify-between gap-4">

        <div className="min-w-0">

          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-3xl font-black text-white">
            {value}
          </p>

          <p className="mt-1 text-[10px] text-slate-500">
            {description}
          </p>

        </div>

        <div
          className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center border ${iconClass}`}
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
            to="/department/dashboard"
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
              to="/department/dashboard"
              className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-400/10 text-blue-300 text-sm font-semibold"
            >
              Dashboard
            </Link>

            <Link
              to="/department/complaints"
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:text-white hover:bg-white/5 transition"
            >
              Complaints
            </Link>

          </nav>

          {/* RIGHT SIDE */}

          <div className="flex items-center gap-3">

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">

              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

              Governance Network Online

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

                Department Command Center

              </div>

              <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">
                Governance Operations Overview
              </h1>

              <p className="mt-2 text-sm text-slate-500 max-w-2xl">
                Monitor civic complaints, coordinate field operations,
                manage assignments, and drive every issue toward
                transparent resolution.
              </p>

            </div>

            <button
              onClick={fetchDashboard}
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

                ASTRAOS GOVERNANCE OPERATIONS

              </div>

              <h2 className="mt-6 text-3xl sm:text-4xl font-black leading-tight">

                Coordinate.
                <br />

                <span className="text-blue-400">
                  Resolve. Improve.
                </span>

              </h2>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-400">

                AstraOS gives department leadership a connected
                command layer for monitoring complaints, assigning
                field officers, tracking progress, and ensuring
                accountable civic resolution.

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
                    Officer Coordination
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Connect complaints with field operations
                  </p>

                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">

                  <Target className="w-5 h-5 text-emerald-400" />

                  <p className="mt-3 text-xs font-bold text-white">
                    Resolution Control
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Track issues from assignment to closure
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
                  Department Workspace
                </h3>

              </div>

              <Building2 className="w-5 h-5 text-cyan-400" />

            </div>

            <div className="mt-6 space-y-3">

              <Link
                to="/department/complaints"
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 hover:border-blue-400/30 hover:bg-blue-500/5 transition"
              >

                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">

                  <Layers3 className="w-4 h-4 text-blue-400" />

                </div>

                <div className="flex-1">

                  <p className="text-sm font-semibold">
                    Manage Complaints
                  </p>

                  <p className="text-[10px] text-slate-500">
                    Review and coordinate department issues
                  </p>

                </div>

                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400" />

              </Link>

              <button
                onClick={fetchDashboard}
                className="group w-full flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 hover:border-cyan-400/30 hover:bg-cyan-500/5 transition text-left"
              >

                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">

                  <RefreshCw className="w-4 h-4 text-cyan-400" />

                </div>

                <div className="flex-1">

                  <p className="text-sm font-semibold">
                    Refresh Dashboard
                  </p>

                  <p className="text-[10px] text-slate-500">
                    Retrieve the latest department metrics
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
                  Governance Network Active
                </p>

                <p className="text-[10px] text-slate-500">
                  Department operations are securely tracked
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">

          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
              iconClass={stat.iconClass}
            />
          ))}

        </section>

        {/* =================================================
            GOVERNANCE INTELLIGENCE
        ================================================= */}

        <section className="mb-7">

          <div className="flex items-end justify-between mb-4">

            <div>

              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-400">
                Governance Intelligence
              </p>

              <h2 className="mt-2 text-xl font-black">
                Built for coordinated civic leadership
              </h2>

            </div>

          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {[
              {
                icon: Bot,
                title: "AI Analysis",
                text: "Support intelligent understanding of civic issues and operational priorities.",
              },
              {
                icon: Route,
                title: "Smart Assignment",
                text: "Coordinate complaints with the appropriate field officers and workflows.",
              },
              {
                icon: Bell,
                title: "Live Monitoring",
                text: "Keep track of complaint movement throughout the resolution lifecycle.",
              },
              {
                icon: Globe2,
                title: "Transparency",
                text: "Maintain accountable, traceable, and citizen-focused civic operations.",
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
            DEPARTMENT INFORMATION
        ================================================= */}

        <section className="rounded-3xl border border-white/10 bg-white/[0.035] overflow-hidden">

          <div className="px-5 sm:px-6 py-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

            <div>

              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-blue-400">

                <Building2 className="w-3.5 h-3.5" />

                Department Profile

              </div>

              <h2 className="mt-2 text-lg font-black">
                Department Information
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Current department identity and governance ownership.
              </p>

            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-500/5 px-3 py-1.5 text-[10px] font-bold text-emerald-300">

              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />

              Active Department

            </div>

          </div>

          <div className="p-5 sm:p-6 grid md:grid-cols-2 gap-4">

            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-400/10 flex items-center justify-center">

                  <Building2 className="w-5 h-5 text-blue-400" />

                </div>

                <div>

                  <p className="text-[10px] uppercase tracking-wider text-slate-600">
                    Department ID
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-200 break-all">
                    {user?.department || "Not assigned"}
                  </p>

                </div>

              </div>

            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/10 flex items-center justify-center">

                  <UserCheck className="w-5 h-5 text-cyan-400" />

                </div>

                <div>

                  <p className="text-[10px] uppercase tracking-wider text-slate-600">
                    Department Head
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-200">
                    {user?.name || "Department Head"}
                  </p>

                </div>

              </div>

            </div>

          </div>

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

                Citizens. Officers. Departments. Administration.

              </h2>

              <p className="mt-2 max-w-2xl text-xs sm:text-sm text-slate-400 leading-relaxed">

                AstraOS connects every stage of the civic resolution
                journey through intelligent workflows, transparent
                tracking, coordinated field action, and accountable
                department leadership.

              </p>

            </div>

            <Link
              to="/department/complaints"
              className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-slate-950 hover:bg-blue-50 transition"
            >

              Manage Complaints

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
                Department Platform
              </h3>

              <div className="mt-4 space-y-2.5">

                <Link
                  to="/department/dashboard"
                  className="block text-xs text-slate-600 hover:text-blue-400 transition"
                >
                  Department Dashboard
                </Link>

                <Link
                  to="/department/complaints"
                  className="block text-xs text-slate-600 hover:text-blue-400 transition"
                >
                  Department Complaints
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

                  Coordinated governance

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

              Governance Network Online

            </div>

          </div>

        </div>

      </footer>

    </div>
  );
}