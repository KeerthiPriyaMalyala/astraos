import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import api from "../api/axios";

export default function DepartmentComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [department, setDepartment] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/departments/my/complaints"
      );

      if (response.data?.success) {
        setComplaints(
          response.data.data?.complaints || []
        );

        setDepartment(
          response.data.data?.department || null
        );
      } else {
        setError(
          "Unable to load department complaints."
        );
      }
    } catch (err) {
      console.error(
        "Department complaints error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load department complaints."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filteredComplaints = complaints.filter(
    (complaint) => {
      const searchText = search
        .trim()
        .toLowerCase();

      const matchesSearch =
        !searchText ||
        complaint.title
          ?.toLowerCase()
          .includes(searchText) ||
        complaint.description
          ?.toLowerCase()
          .includes(searchText) ||
        complaint.category
          ?.toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "ALL" ||
        complaint.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" ||
        complaint.priority?.level === priorityFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority
      );
    }
  );

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
      case "PENDING_ASSIGNMENT":
        return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300";

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

      case "CLOSED":
        return "border-slate-500/30 bg-slate-500/10 text-slate-300";

      default:
        return "border-slate-700 bg-slate-800/50 text-slate-300";
    }
  };

  const formatStatus = (status) => {
    if (!status) return "UNKNOWN";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2
            size={20}
            className="animate-spin text-blue-400"
          />

          Loading department complaints...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-5">

          <div className="flex items-center justify-between gap-4">

            <div className="flex items-center gap-4">

              <Link
                to="/department/dashboard"
                className="w-10 h-10 rounded-xl border border-slate-700 bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-600 transition"
              >
                <ArrowLeft size={19} />
              </Link>

              <div>
                <p className="text-xs uppercase tracking-wider text-blue-400 font-semibold">
                  Department Portal
                </p>

                <h1 className="text-xl font-bold mt-1">
                  Department Complaints
                </h1>

                {department && (
                  <p className="text-sm text-slate-400 mt-1">
                    {department.name}
                    {department.code
                      ? ` • ${department.code}`
                      : ""}
                  </p>
                )}
              </div>

            </div>

            <button
              onClick={fetchComplaints}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-700 transition disabled:opacity-50"
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

        {/* Page heading */}

        <div className="mb-7">

          <p className="text-sm text-blue-400 font-medium">
            COMPLAINT MANAGEMENT
          </p>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mt-1">

            <div>
              <h2 className="text-3xl font-bold">
                All Department Complaints
              </h2>

              <p className="text-slate-400 mt-2">
                Review complaints assigned to your
                department and manage officer assignments.
              </p>
            </div>

            <div className="text-sm text-slate-400">
              Showing{" "}
              <span className="text-white font-semibold">
                {filteredComplaints.length}
              </span>{" "}
              of{" "}
              <span className="text-white font-semibold">
                {complaints.length}
              </span>
            </div>

          </div>

        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 flex items-start gap-3 text-red-300">

            <AlertCircle
              size={20}
              className="shrink-0 mt-0.5"
            />

            <div>
              <p className="font-semibold">
                Unable to load complaints
              </p>

              <p className="text-sm mt-1">
                {error}
              </p>
            </div>

          </div>
        )}

        {/* =====================================================
            FILTERS
        ===================================================== */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 mb-6">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Search */}

            <div className="relative">

              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search complaints..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-600"
              />

            </div>

            {/* Status */}

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-300 outline-none focus:border-blue-500"
            >
              <option value="ALL">
                All Statuses
              </option>

              <option value="PENDING_ASSIGNMENT">
                Pending Assignment
              </option>

              <option value="ASSIGNED">
                Assigned
              </option>

              <option value="ACCEPTED">
                Accepted
              </option>

              <option value="WORK_STARTED">
                Work Started
              </option>

              <option value="WORK_50_PERCENT">
                50% Progress
              </option>

              <option value="RESOLVED">
                Resolved
              </option>

              <option value="CLOSED">
                Closed
              </option>
            </select>

            {/* Priority */}

            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value)
              }
              className="rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-300 outline-none focus:border-blue-500"
            >
              <option value="ALL">
                All Priorities
              </option>

              <option value="CRITICAL">
                Critical
              </option>

              <option value="HIGH">
                High
              </option>

              <option value="MEDIUM">
                Medium
              </option>

              <option value="LOW">
                Low
              </option>
            </select>

          </div>

        </div>

        {/* =====================================================
            EMPTY STATE
        ===================================================== */}

        {filteredComplaints.length === 0 && !error && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-12 text-center">

            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center">
              <ClipboardListIcon />
            </div>

            <h3 className="text-lg font-semibold mt-4">
              No complaints found
            </h3>

            <p className="text-sm text-slate-500 mt-2">
              Try changing your search or filters.
            </p>

          </div>
        )}

        {/* =====================================================
            COMPLAINT LIST
        ===================================================== */}

        <div className="space-y-4">

          {filteredComplaints.map(
            (complaint) => (
              <div
                key={complaint._id}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 hover:border-slate-700 transition"
              >

                {/* Top */}

                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

                  <div className="flex-1">

                    <div className="flex flex-wrap items-center gap-2 mb-3">

                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${getPriorityStyle(
                          complaint.priority?.level
                        )}`}
                      >
                        <ShieldAlert
                          size={13}
                          className="mr-1"
                        />

                        {complaint.priority?.level ||
                          "LOW"}
                      </span>

                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                          complaint.status
                        )}`}
                      >
                        {formatStatus(
                          complaint.status
                        )}
                      </span>

                      <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-xs font-medium text-slate-300">
                        {complaint.category}
                      </span>

                    </div>

                    <h3 className="text-lg font-semibold text-white">
                      {complaint.title}
                    </h3>

                    <p className="text-sm text-slate-400 mt-2 line-clamp-2">
                      {complaint.description}
                    </p>

                    {/* Metadata */}

                    <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-xs text-slate-500">

                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={14} />

                        {formatDate(
                          complaint.createdAt
                        )}
                      </span>

                      {complaint.location?.address && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={14} />

                          {complaint.location.address}
                        </span>
                      )}

                      {complaint.citizen?.name && (
                        <span className="inline-flex items-center gap-1.5">
                          <UserRound size={14} />

                          {complaint.citizen.name}
                        </span>
                      )}

                    </div>

                  </div>

                  {/* Right */}

                  <div className="flex flex-col items-start lg:items-end gap-3">

                    <div className="text-right">

                      <p className="text-xs text-slate-500">
                        Priority Score
                      </p>

                      <p className="text-2xl font-bold text-white">
                        {complaint.priority?.score ??
                          0}
                      </p>

                    </div>

                    <Link
                      to={`/department/complaints/${complaint._id}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition"
                    >
                      View Complaint
                      <ChevronRight size={16} />
                    </Link>

                  </div>

                </div>

              </div>
            )
          )}

        </div>

      </main>
    </div>
  );
}


/* =========================================================
   EMPTY STATE ICON
========================================================= */

function ClipboardListIcon() {
  return (
    <div className="text-slate-500">
      <CheckCircle2 size={26} />
    </div>
  );
}