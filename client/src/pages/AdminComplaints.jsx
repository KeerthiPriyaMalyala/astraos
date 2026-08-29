
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronDown,
  FileText,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";

import api from "../api/axios";

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [departmentLoading, setDepartmentLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FILTERS
  // =====================================================

  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    category: "",
    department: "",
  });

  // =====================================================
  // PAGINATION
  // =====================================================

  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    totalComplaints: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // =====================================================
  // FORMAT LABEL
  // =====================================================

  const formatLabel = (value) => {
    if (!value) return "Unknown";

    return value
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "Unknown";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // FETCH DEPARTMENTS
  // GET /api/admin/departments
  // =====================================================

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setDepartmentLoading(true);

        const response = await api.get("/admin/departments");

        if (response.data.success) {
          setDepartments(
            response.data.data?.departments || []
          );
        }
      } catch (err) {
        console.error(
          "❌ [AstraOS] Department fetch error:",
          err
        );
      } finally {
        setDepartmentLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  // =====================================================
  // FETCH COMPLAINTS
  // GET /api/admin/complaints
  // =====================================================

  const fetchComplaints = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit: pagination.limit,
      };

      // Only send filters that have values
      if (filters.status) {
        params.status = filters.status;
      }

      if (filters.priority) {
        params.priority = filters.priority;
      }

      if (filters.category) {
        params.category = filters.category;
      }

      if (filters.department) {
        params.department = filters.department;
      }

      const response = await api.get("/admin/complaints", {
        params,
      });

      const data = response.data;

      console.log(
        "📋 [AstraOS] ADMIN COMPLAINTS:",
        data.data
      );

      if (!data.success) {
        throw new Error(
          data.message || "Failed to load complaints"
        );
      }

      setComplaints(data.data?.complaints || []);

      setPagination(
        data.data?.pagination || {
          currentPage: page,
          limit: 10,
          totalComplaints: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );
    } catch (err) {
      console.error(
        "❌ [AstraOS] Admin complaints error:",
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

  // =====================================================
  // INITIAL FETCH
  // =====================================================

  useEffect(() => {
    fetchComplaints(1);
  }, []);

  // =====================================================
  // FILTER CHANGE
  // =====================================================

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // APPLY FILTERS
  // =====================================================

  const handleApplyFilters = () => {
    fetchComplaints(1);
  };

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const handleClearFilters = () => {
    setFilters({
      status: "",
      priority: "",
      category: "",
      department: "",
    });

    // Fetch without old filters
    setTimeout(() => {
      fetchComplaints(1);
    }, 0);
  };

  // =====================================================
  // PAGINATION
  // =====================================================

  const handlePreviousPage = () => {
    if (pagination.hasPreviousPage) {
      fetchComplaints(pagination.currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      fetchComplaints(pagination.currentPage + 1);
    }
  };

  // =====================================================
  // RETRY
  // =====================================================

  const handleRetry = () => {
    fetchComplaints(pagination.currentPage || 1);
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading && complaints.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading complaints...</span>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error && complaints.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />

              <div className="flex-1">
                <h2 className="font-semibold text-red-800">
                  Unable to load complaints
                </h2>

                <p className="text-sm text-red-700 mt-1">
                  {error}
                </p>

                <button
                  onClick={handleRetry}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Admin Dashboard
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-600 mb-2">
                AstraOS Administration
              </p>

              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
                Complaints
              </h1>

              <p className="mt-2 text-slate-600">
                Monitor and manage civic complaints across
                departments.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm text-slate-600 shadow-sm">
              <FileText className="w-4 h-4 text-blue-600" />

              <span>
                {pagination.totalComplaints} total complaints
              </span>
            </div>
          </div>
        </section>

        {/* =================================================
            FILTERS
        ================================================= */}

        <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-6">

          <div className="flex items-center gap-2 mb-5">
            <Search className="w-5 h-5 text-blue-600" />

            <div>
              <h2 className="font-bold text-slate-900">
                Filter Complaints
              </h2>

              <p className="text-xs text-slate-500 mt-0.5">
                Narrow complaints by status, priority,
                category, or department.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

            {/* STATUS */}

            <div className="relative">
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-3 pr-10 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              >
                <option value="">All Statuses</option>
                <option value="PENDING_ASSIGNMENT">
                  Pending Assignment
                </option>
                <option value="ASSIGNED">
                  Assigned
                </option>
                <option value="IN_PROGRESS">
                  In Progress
                </option>
                <option value="RESOLVED">
                  Resolved
                </option>
                <option value="CITIZEN_VERIFIED">
                  Citizen Verified
                </option>
                <option value="CLOSED">
                  Closed
                </option>
              </select>

              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* PRIORITY */}

            <div className="relative">
              <select
                name="priority"
                value={filters.priority}
                onChange={handleFilterChange}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-3 pr-10 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>

              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* CATEGORY */}

            <div className="relative">
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-3 pr-10 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              >
                <option value="">All Categories</option>
                <option value="ROAD">
                  Road
                </option>
                <option value="WATER">
                  Water
                </option>
                <option value="ELECTRICITY">
                  Electricity
                </option>
                <option value="SANITATION">
                  Sanitation
                </option>
                <option value="STREETLIGHT">
                  Streetlight
                </option>
                <option value="GARBAGE">
                  Garbage
                </option>
                <option value="DRAINAGE">
                  Drainage
                </option>
                <option value="OTHER">
                  Other
                </option>
              </select>

              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* DEPARTMENT */}

            <div className="relative">
              <select
                name="department"
                value={filters.department}
                onChange={handleFilterChange}
                disabled={departmentLoading}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-3 pr-10 text-sm text-slate-700 outline-none disabled:bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              >
                <option value="">
                  {departmentLoading
                    ? "Loading departments..."
                    : "All Departments"}
                </option>

                {departments.map((department) => (
                  <option
                    key={department._id}
                    value={department._id}
                  >
                    {department.name} ({department.code})
                  </option>
                ))}
              </select>

              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* BUTTONS */}

            <div className="flex gap-2">
              <button
                onClick={handleApplyFilters}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition"
              >
                <Search className="w-4 h-4" />
                Apply
              </button>

              <button
                onClick={handleClearFilters}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                title="Clear filters"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

          </div>
        </section>

        {/* =================================================
            BACKGROUND REFRESH LOADING
        ================================================= */}

        {loading && complaints.length > 0 && (
          <div className="mb-4 flex items-center gap-2 text-sm text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            Updating complaints...
          </div>
        )}

        {/* =================================================
            ERROR AFTER EXISTING DATA
        ================================================= */}

        {error && complaints.length > 0 && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          </div>
        )}

        {/* =================================================
            COMPLAINT LIST
        ================================================= */}

        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

          <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="font-bold text-slate-900">
                Complaint Records
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Showing page {pagination.currentPage} of{" "}
                {pagination.totalPages}
              </p>
            </div>

            <span className="text-sm text-slate-500">
              {complaints.length} shown
            </span>
          </div>

          {complaints.length === 0 ? (
            <div className="p-12 text-center">

              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center">
                <FileText className="w-7 h-7 text-slate-400" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                No complaints found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Try changing or clearing your filters.
              </p>

              <button
                onClick={handleClearFilters}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Clear filters
              </button>

            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}

              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">

                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Complaint
                      </th>

                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Citizen
                      </th>

                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Department
                      </th>

                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Priority
                      </th>

                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Status
                      </th>

                      <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Date
                      </th>

                      <th />
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {complaints.map((complaint) => (
                      <tr
                        key={complaint._id}
                        className="hover:bg-slate-50 transition"
                      >

                        {/* COMPLAINT */}

                        <td className="px-5 py-4">
                          <div className="max-w-xs">

                            <p className="font-semibold text-slate-900 truncate">
                              {complaint.title ||
                                "Untitled complaint"}
                            </p>

                            <p className="text-xs text-slate-500 mt-1">
                              {formatLabel(
                                complaint.category
                              )}
                            </p>

                          </div>
                        </td>

                        {/* CITIZEN */}

                        <td className="px-5 py-4">
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {complaint.citizen?.name ||
                                "Unknown"}
                            </p>

                            <p className="text-xs text-slate-500 mt-1">
                              {complaint.citizen?.email ||
                                "No email"}
                            </p>
                          </div>
                        </td>

                        {/* DEPARTMENT */}

                        <td className="px-5 py-4">
                          {complaint.department ? (
                            <div>
                              <p className="text-sm font-medium text-slate-800">
                                {complaint.department.name}
                              </p>

                              <p className="text-xs text-slate-500 mt-1">
                                {complaint.department.code}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">
                              Unassigned
                            </span>
                          )}
                        </td>

                        {/* PRIORITY */}

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              complaint.priority?.level ===
                              "HIGH"
                                ? "bg-red-50 text-red-700"
                                : complaint.priority?.level ===
                                  "MEDIUM"
                                ? "bg-orange-50 text-orange-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {formatLabel(
                              complaint.priority?.level
                            )}
                          </span>
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            {formatLabel(
                              complaint.status
                            )}
                          </span>
                        </td>

                        {/* DATE */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-slate-500 whitespace-nowrap">
                            <CalendarDays className="w-4 h-4" />
                            {formatDate(
                              complaint.createdAt
                            )}
                          </div>
                        </td>

                        {/* VIEW */}

                        <td className="px-5 py-4 text-right">
                          <Link
                            to={`/admin/complaints/${complaint._id}`}
                            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                          >
                            View
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </td>

                      </tr>
                    ))}

                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS */}

              <div className="lg:hidden divide-y divide-slate-100">

                {complaints.map((complaint) => (
                  <Link
                    key={complaint._id}
                    to={`/admin/complaints/${complaint._id}`}
                    className="block p-5 hover:bg-slate-50 transition"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="font-semibold text-slate-900">
                            {complaint.title ||
                              "Untitled complaint"}
                          </h3>

                          <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                            {formatLabel(
                              complaint.status
                            )}
                          </span>

                        </div>

                        <p className="text-sm text-slate-500 mt-2">
                          {formatLabel(
                            complaint.category
                          )}
                        </p>

                        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-xs text-slate-500">

                          <span>
                            Citizen:{" "}
                            {complaint.citizen?.name ||
                              "Unknown"}
                          </span>

                          <span>
                            Department:{" "}
                            {complaint.department?.name ||
                              "Unassigned"}
                          </span>

                          <span>
                            Priority:{" "}
                            {formatLabel(
                              complaint.priority?.level
                            )}
                          </span>

                          <span>
                            {formatDate(
                              complaint.createdAt
                            )}
                          </span>

                        </div>

                      </div>

                      <ArrowRight className="w-5 h-5 text-slate-400 shrink-0 mt-1" />

                    </div>

                  </Link>
                ))}

              </div>
            </>
          )}

          {/* =================================================
              PAGINATION
          ================================================= */}

          {complaints.length > 0 && (
            <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-between gap-4">

              <p className="text-sm text-slate-500">
                Page{" "}
                <span className="font-semibold text-slate-700">
                  {pagination.currentPage}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {pagination.totalPages}
                </span>
              </p>

              <div className="flex items-center gap-2">

                <button
                  onClick={handlePreviousPage}
                  disabled={!pagination.hasPreviousPage}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>

                <button
                  onClick={handleNextPage}
                  disabled={!pagination.hasNextPage}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>

              </div>

            </div>
          )}

        </section>

      </main>
    </div>
  );
};

export default AdminComplaints;

