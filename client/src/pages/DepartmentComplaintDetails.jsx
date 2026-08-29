
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  RefreshCw,
  ShieldAlert,
  UserRound,
  UserPlus,
  Building2,
  Brain,
  FileText,
} from "lucide-react";

import api from "../api/axios";

export default function DepartmentComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [department, setDepartment] = useState(null);
  const [officers, setOfficers] = useState([]);

  const [selectedOfficer, setSelectedOfficer] = useState("");

  const [loading, setLoading] = useState(true);
  const [officersLoading, setOfficersLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  const [error, setError] = useState("");
  const [assignError, setAssignError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // FETCH COMPLAINT
  // =====================================================

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      setError("");

      /*
       * DepartmentComplaintDetails does not have a dedicated
       * backend GET endpoint in the routes provided.
       *
       * Therefore we load the department complaints list and
       * find the requested complaint from that response.
       */
      const response = await api.get("/departments/my/complaints");

      if (!response.data?.success) {
        setError("Unable to load complaint details.");
        return;
      }

      const complaints =
        response.data.data?.complaints || [];

      const foundComplaint = complaints.find(
        (item) => item._id === id
      );

      if (!foundComplaint) {
        setError(
          "Complaint not found or this complaint does not belong to your department."
        );
        return;
      }

      setComplaint(foundComplaint);

      setDepartment(
        response.data.data?.department || null
      );
    } catch (err) {
      console.error(
        "Department complaint details error:",
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
  // FETCH DEPARTMENT OFFICERS
  // =====================================================

  const fetchOfficers = async () => {
    try {
      setOfficersLoading(true);
      setAssignError("");

      const response = await api.get(
        "/departments/officers"
      );

      if (response.data?.success) {
        setOfficers(
          response.data.data?.officers || []
        );
      } else {
        setAssignError(
          "Unable to load department officers."
        );
      }
    } catch (err) {
      console.error(
        "Department officers error:",
        err
      );

      setAssignError(
        err.response?.data?.message ||
          "Failed to load department officers."
      );
    } finally {
      setOfficersLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    if (!id) return;

    fetchComplaint();
    fetchOfficers();
  }, [id]);

  // =====================================================
  // ASSIGN OFFICER
  // =====================================================

  const handleAssignOfficer = async () => {
    if (!selectedOfficer) {
      setAssignError("Please select an officer.");
      return;
    }

    try {
      setAssigning(true);
      setAssignError("");
      setSuccess("");

      const response = await api.put(
        `/departments/complaints/${id}/assign`,
        {
          officerId: selectedOfficer,
        }
      );

      if (response.data?.success) {
        setSuccess(
          response.data.message ||
            "Complaint assigned to officer successfully."
        );

        setSelectedOfficer("");

        /*
         * Reload complaint so the newly assigned officer,
         * status and timeline are immediately visible.
         */
        await fetchComplaint();
      } else {
        setAssignError(
          response.data?.message ||
            "Failed to assign officer."
        );
      }
    } catch (err) {
      console.error(
        "Assign officer error:",
        err
      );

      setAssignError(
        err.response?.data?.message ||
          "Failed to assign complaint to officer."
      );
    } finally {
      setAssigning(false);
    }
  };

  // =====================================================
  // STYLES
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
    if (!status) return "Unknown";

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
              to="/department/complaints"
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
  // CURRENT ASSIGNED OFFICER
  // =====================================================

  const assignedOfficer =
    complaint.assignedOfficer;

  const canAssign =
    complaint.status === "PENDING_ASSIGNMENT";

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
                to="/department/complaints"
                className="w-10 h-10 rounded-xl border border-slate-700 bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-600 transition"
              >
                <ArrowLeft size={19} />
              </Link>

              <div>
                <p className="text-xs uppercase tracking-wider text-blue-400 font-semibold">
                  Department Portal
                </p>

                <h1 className="text-xl font-bold mt-1">
                  Complaint Details
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
              onClick={() => {
                fetchComplaint();
                fetchOfficers();
              }}
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
            SUCCESS
        ===================================================== */}

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

        {/* =====================================================
            TITLE + STATUS
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
                  {complaint.category}
                </span>

              </div>

              <h2 className="text-3xl font-bold">
                {complaint.title}
              </h2>

              <p className="text-slate-400 mt-3 max-w-4xl">
                {complaint.description}
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
              LEFT / MAIN CONTENT
          ===================================================== */}

          <div className="xl:col-span-2 space-y-6">

            {/* =================================================
                COMPLAINT INFORMATION
            ================================================= */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">

              <div className="flex items-center gap-3 mb-5">

                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <FileText
                    size={19}
                    className="text-blue-400"
                  />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Complaint Information
                  </h3>

                  <p className="text-xs text-slate-500">
                    Basic complaint details
                  </p>
                </div>

              </div>

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

              <div className="flex items-center gap-3 mb-5">

                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <MapPin
                    size={19}
                    className="text-emerald-400"
                  />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Location
                  </h3>

                  <p className="text-xs text-slate-500">
                    Complaint location information
                  </p>
                </div>

              </div>

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
              <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">

                <div className="flex items-center gap-3 mb-5">

                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Brain
                      size={19}
                      className="text-purple-400"
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      AI Analysis
                    </h3>

                    <p className="text-xs text-slate-500">
                      AstraOS intelligence
                    </p>
                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <InfoItem
                    label="AI Category"
                    value={
                      complaint.aiAnalysis.category ||
                      "Not available"
                    }
                  />

                  <InfoItem
                    label="Department"
                    value={
                      complaint.aiAnalysis.department ||
                      "Not available"
                    }
                  />

                  <InfoItem
                    label="Severity"
                    value={
                      complaint.aiAnalysis.severity ??
                      "Not available"
                    }
                  />

                  <InfoItem
                    label="Confidence"
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

                </div>

                {complaint.aiAnalysis.summary && (
                  <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/50 p-4">

                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      AI Summary
                    </p>

                    <p className="text-sm text-slate-300 mt-2">
                      {complaint.aiAnalysis.summary}
                    </p>

                  </div>
                )}

                {complaint.aiAnalysis.suggestedAction && (
                  <div className="mt-4 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">

                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                      Suggested Action
                    </p>

                    <p className="text-sm text-slate-300 mt-2">
                      {complaint.aiAnalysis.suggestedAction}
                    </p>

                  </div>
                )}

              </section>
            )}

            {/* =================================================
                TIMELINE
            ================================================= */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">

              <div className="flex items-center gap-3 mb-6">

                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Clock3
                    size={19}
                    className="text-cyan-400"
                  />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Complaint Timeline
                  </h3>

                  <p className="text-xs text-slate-500">
                    Complete complaint lifecycle
                  </p>
                </div>

              </div>

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
                CITIZEN
            ================================================= */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">

              <div className="flex items-center gap-3 mb-5">

                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <UserRound
                    size={19}
                    className="text-slate-300"
                  />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Citizen
                  </h3>

                  <p className="text-xs text-slate-500">
                    Complaint submitted by
                  </p>
                </div>

              </div>

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
                ASSIGNED OFFICER
            ================================================= */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">

              <div className="flex items-center gap-3 mb-5">

                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <UserPlus
                    size={19}
                    className="text-blue-400"
                  />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Officer Assignment
                  </h3>

                  <p className="text-xs text-slate-500">
                    Manage department officer
                  </p>
                </div>

              </div>

              {/* Current Officer */}

              {assignedOfficer ? (
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 mb-5">

                  <p className="text-xs uppercase tracking-wider font-semibold text-blue-400">
                    Currently Assigned
                  </p>

                  <p className="text-sm font-semibold text-white mt-2">
                    {assignedOfficer.name ||
                      "Officer"}
                  </p>

                  {assignedOfficer.email && (
                    <p className="text-xs text-slate-500 mt-1">
                      {assignedOfficer.email}
                    </p>
                  )}

                  {assignedOfficer.phoneNumber && (
                    <p className="text-xs text-slate-500 mt-1">
                      {assignedOfficer.phoneNumber}
                    </p>
                  )}

                </div>
              ) : (
                <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 mb-5">

                  <p className="text-sm font-semibold text-yellow-300">
                    No officer assigned
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Assign an officer to begin the complaint
                    workflow.
                  </p>

                </div>
              )}

              {/* Assignment */}

              {canAssign && (
                <>
                  {assignError && (
                    <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 flex items-start gap-2 text-red-300">

                      <AlertCircle
                        size={16}
                        className="shrink-0 mt-0.5"
                      />

                      <p className="text-xs">
                        {assignError}
                      </p>

                    </div>
                  )}

                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Select Officer
                  </label>

                  <select
                    value={selectedOfficer}
                    onChange={(e) => {
                      setSelectedOfficer(
                        e.target.value
                      );
                      setAssignError("");
                      setSuccess("");
                    }}
                    disabled={officersLoading || assigning}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                  >
                    <option value="">
                      {officersLoading
                        ? "Loading officers..."
                        : "Select an officer"}
                    </option>

                    {officers.map((officer) => (
                      <option
                        key={officer._id}
                        value={officer._id}
                      >
                        {officer.name} —{" "}
                        {officer.email}
                      </option>
                    ))}
                  </select>

                  {officers.length === 0 &&
                    !officersLoading && (
                      <p className="text-xs text-yellow-400 mt-2">
                        No active officers are available
                        in this department.
                      </p>
                    )}

                  <button
                    type="button"
                    onClick={handleAssignOfficer}
                    disabled={
                      assigning ||
                      officersLoading ||
                      !selectedOfficer
                    }
                    className="w-full mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {assigning ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <UserPlus size={17} />
                        Assign Officer
                      </>
                    )}
                  </button>
                </>
              )}

              {!canAssign && assignedOfficer && (
                <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">

                  <p className="text-xs text-slate-500">
                    Officer assignment is complete for
                    this complaint.
                  </p>

                  <p className="text-sm text-slate-300 mt-2">
                    Current status:{" "}
                    <span className="font-semibold text-white">
                      {formatStatus(
                        complaint.status
                      )}
                    </span>
                  </p>

                </div>
              )}

            </section>

            {/* =================================================
                DEPARTMENT
            ================================================= */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">

              <div className="flex items-center gap-3 mb-5">

                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Building2
                    size={19}
                    className="text-indigo-400"
                  />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Department
                  </h3>

                  <p className="text-xs text-slate-500">
                    Responsible department
                  </p>
                </div>

              </div>

              <div className="space-y-4">

                <InfoItem
                  label="Department"
                  value={
                    department?.name ||
                    complaint.department?.name ||
                    "Not available"
                  }
                />

                <InfoItem
                  label="Code"
                  value={
                    department?.code ||
                    complaint.department?.code ||
                    "Not available"
                  }
                />

                <InfoItem
                  label="Department ID"
                  value={
                    department?.id ||
                    complaint.department?._id ||
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
// REUSABLE INFO ITEM
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

