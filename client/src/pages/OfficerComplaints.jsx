import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  FileText,
  Loader2,
  MapPin,
  RefreshCw,
  ShieldAlert,
  CheckCircle2,
  UserCheck,
  Lock,
} from "lucide-react";

import api from "../api/axios";

export default function OfficerComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH ASSIGNED COMPLAINTS
  // GET /api/officer/complaints
  // =====================================================

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/officer/complaints");

      if (response.data?.success) {
        setComplaints(response.data.data?.complaints || []);
      } else {
        setError(
          response.data?.message ||
            "Unable to load assigned complaints."
        );
      }
    } catch (err) {
      console.error("Officer complaints error:", err);

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
  // FORMAT STATUS
  // =====================================================

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // PRIORITY STYLE
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

  // =====================================================
  // STATUS STYLE
  // =====================================================

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
        return "border-slate-700 bg-slate-800 text-slate-300";
    }
  };

  // =====================================================
  // STATUS ICON
  // =====================================================

  const getStatusIcon = (status) => {
    switch (status) {
      case "RESOLVED":
        return <CheckCircle2 size={13} />;

      case "CITIZEN_VERIFIED":
        return <UserCheck size={13} />;

      case "CLOSED":
        return <Lock size={13} />;

      default:
        return null;
    }
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

          Loading assigned complaints...
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
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
            Unable to load complaints
          </h1>

          <p className="text-sm text-slate-400 mt-2">
            {error}
          </p>

          <button
            onClick={fetchComplaints}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold hover:bg-blue-500 transition"
          >
            <RefreshCw size={16} />
            Try Again
          </button>

        </div>
      </div>
    );
  }

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
                to="/officer/dashboard"
                className="w-10 h-10 rounded-xl border border-slate-700 bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-600 transition"
              >
                <ArrowLeft size={19} />
              </Link>

              <div>

                <p className="text-xs uppercase tracking-wider text-blue-400 font-semibold">
                  Officer Portal
                </p>

                <h1 className="text-xl font-bold mt-1">
                  Assigned Complaints
                </h1>

                <p className="text-sm text-slate-400 mt-1">
                  Complaints currently assigned to you.
                </p>

              </div>

            </div>

            <button
              onClick={fetchComplaints}
              disabled={loading}
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

        {/* =====================================================
            PAGE SUMMARY
        ===================================================== */}

        <div className="mb-6">

          <h2 className="text-2xl font-bold">
            My Complaints
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            {complaints.length} complaint
            {complaints.length !== 1 ? "s" : ""} assigned
            to you.
          </p>

        </div>

        {/* =====================================================
            EMPTY STATE
        ===================================================== */}

        {complaints.length === 0 ? (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-10">

            <div className="text-center max-w-md mx-auto">

              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                <FileText
                  size={28}
                  className="text-slate-500"
                />
              </div>

              <h3 className="text-lg font-semibold mt-5">
                No complaints assigned
              </h3>

              <p className="text-sm text-slate-500 mt-2">
                Complaints assigned to you by the Department
                Head will appear here.
              </p>

              <Link
                to="/officer/dashboard"
                className="inline-flex items-center gap-2 mt-6 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition"
              >
                <ArrowLeft size={16} />
                Back to Dashboard
              </Link>

            </div>

          </section>
        ) : (

          /* =====================================================
             COMPLAINT LIST
          ===================================================== */

          <div className="space-y-4">

            {complaints.map((complaint) => (

              <section
                key={complaint._id}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 hover:border-slate-700 transition"
              >

                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

                  {/* =================================================
                      COMPLAINT MAIN INFO
                  ================================================= */}

                  <div className="flex-1 min-w-0">

                    {/* BADGES */}

                    <div className="flex flex-wrap items-center gap-2 mb-3">

                      {/* PRIORITY */}

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${getPriorityStyle(
                          complaint.priority?.level
                        )}`}
                      >
                        <ShieldAlert size={13} />

                        {complaint.priority?.level ||
                          "LOW"}
                      </span>

                      {/* STATUS */}

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                          complaint.status
                        )}`}
                      >
                        {getStatusIcon(complaint.status)}

                        {formatStatus(
                          complaint.status
                        )}
                      </span>

                      {/* CATEGORY */}

                      <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-300">
                        {complaint.category ||
                          "GENERAL"}
                      </span>

                    </div>

                    {/* TITLE */}

                    <h3 className="text-xl font-bold truncate">
                      {complaint.title ||
                        "Untitled Complaint"}
                    </h3>

                    {/* DESCRIPTION */}

                    <p className="text-sm text-slate-400 mt-2 line-clamp-2">
                      {complaint.description ||
                        "No description available."}
                    </p>

                    {/* =================================================
                        META
                    ================================================= */}

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4">

                      {/* LOCATION */}

                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <MapPin size={14} />

                        <span>
                          {complaint.location?.address ||
                            "Location not provided"}
                        </span>
                      </div>

                      {/* CREATED DATE */}

                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <FileText size={14} />

                        <span>
                          Created{" "}
                          {formatDate(
                            complaint.createdAt
                          )}
                        </span>
                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      PRIORITY SCORE + VIEW
                  ================================================= */}

                  <div className="flex flex-col sm:flex-row xl:flex-col gap-3 xl:min-w-[180px]">

                    {/* PRIORITY SCORE */}

                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-5 py-3">

                      <p className="text-xs text-slate-500">
                        Priority Score
                      </p>

                      <p className="text-2xl font-bold mt-1">
                        {complaint.priority?.score ??
                          0}
                      </p>

                      <p className="text-xs text-slate-600">
                        / 100
                      </p>

                    </div>

                    {/* VIEW BUTTON */}

                    <Link
                      to={`/officer/complaints/${complaint._id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500 transition"
                    >
                      View Complaint
                      <ArrowRight size={16} />
                    </Link>

                  </div>

                </div>

              </section>

            ))}

          </div>
        )}

      </main>
    </div>
  );
}