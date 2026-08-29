
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Eye,
  Loader2,
  Mail,
  UserCog,
  UserX,
  Users,
} from "lucide-react";

import api from "../api/axios";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState(null);

  // =====================================================
  // FETCH GOVERNMENT USERS
  // GET /api/admin/users
  // =====================================================

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/users");

      const data = response.data;

      console.log(
        "👥 [AstraOS] GOVERNMENT USERS:",
        data.data
      );

      if (!data.success) {
        throw new Error(
          data.message || "Failed to load government users"
        );
      }

      setUsers(data.data.users || []);
    } catch (err) {
      console.error(
        "❌ [AstraOS] Government users error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load government users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // =====================================================
  // FORMAT ROLE
  // =====================================================

  const formatRole = (role) => {
    if (!role) return "Unknown";

    return role
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
  // UPDATE USER STATUS
  // PATCH /api/admin/users/:userId/status
  // =====================================================

  const handleToggleStatus = async (user) => {
    const newStatus = !user.isActive;

    const action = newStatus ? "activate" : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${user.name}?`
    );

    if (!confirmed) return;

    try {
      setUpdatingUserId(user._id);
      setError("");

      const response = await api.patch(
        `/admin/users/${user._id}/status`,
        {
          isActive: newStatus,
        }
      );

      const data = response.data;

      if (!data.success) {
        throw new Error(
          data.message || `Failed to ${action} user`
        );
      }

      // Update user locally
      setUsers((prevUsers) =>
        prevUsers.map((item) =>
          item._id === user._id
            ? {
                ...item,
                isActive: newStatus,
              }
            : item
        )
      );
    } catch (err) {
      console.error(
        "❌ [AstraOS] Update user status error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          `Unable to ${action} user.`
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin" />

          <span>Loading government users...</span>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error && users.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />

              <div>
                <h2 className="font-semibold text-red-800">
                  Unable to load government users
                </h2>

                <p className="text-sm text-red-700 mt-1">
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
  // SUMMARY
  // =====================================================

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => user.isActive
  ).length;

  const inactiveUsers = users.filter(
    (user) => !user.isActive
  ).length;

  const officers = users.filter(
    (user) => user.role === "OFFICER"
  ).length;

  const departmentHeads = users.filter(
    (user) => user.role === "DEPARTMENT_HEAD"
  ).length;

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
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 mb-5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-600 mb-2">
                AstraOS Administration
              </p>

              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
                Government Users
              </h1>

              <p className="mt-2 text-slate-600">
                Manage officers and department heads across
                AstraOS.
              </p>
            </div>

            <Link
              to="/admin/users/create"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              <UserCog className="w-4 h-4" />
              Create Government User
            </Link>
          </div>
        </section>

        {/* =================================================
            ERROR AFTER UPDATE
        ================================================= */}

        {error && users.length > 0 && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />

              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          {/* Total */}

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Total Users
                </p>

                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {totalUsers}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Active */}

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Active Users
                </p>

                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {activeUsers}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Officers */}

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Officers
                </p>

                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {officers}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <UserCog className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Department Heads */}

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Department Heads
                </p>

                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {departmentHeads}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
          </div>

        </section>

        {/* =================================================
            USER TABLE
        ================================================= */}

        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

          {/* Table Header */}

          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between gap-4">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Government Users
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Officers and department heads registered
                  in AstraOS
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {totalUsers} users
              </span>

            </div>
          </div>

          {/* Empty State */}

          {users.length === 0 ? (
            <div className="p-12 text-center">

              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center">
                <Users className="w-7 h-7 text-slate-400" />
              </div>

              <h3 className="font-semibold text-slate-900 mt-4">
                No government users found
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Create an officer or department head to get
                started.
              </p>

              <Link
                to="/admin/users/create"
                className="inline-flex items-center gap-2 mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
              >
                <UserCog className="w-4 h-4" />
                Create User
              </Link>

            </div>
          ) : (

            <>
              {/* Desktop Table */}

              <div className="hidden lg:block overflow-x-auto">

                <table className="w-full">

                  <thead className="bg-slate-50 border-b border-slate-200">

                    <tr>

                      <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        User
                      </th>

                      <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Role
                      </th>

                      <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Department
                      </th>

                      <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Created
                      </th>

                      <th className="text-right px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {users.map((user) => (

                      <tr
                        key={user._id}
                        className="hover:bg-slate-50 transition"
                      >

                        {/* User */}

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                              <UserCog className="w-5 h-5" />
                            </div>

                            <div className="min-w-0">

                              <p className="font-semibold text-slate-900 truncate">
                                {user.name}
                              </p>

                              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* Role */}

                        <td className="px-6 py-4">

                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              user.role === "DEPARTMENT_HEAD"
                                ? "bg-violet-50 text-violet-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {formatRole(user.role)}
                          </span>

                        </td>

                        {/* Department */}

                        <td className="px-6 py-4">

                          {user.department ? (
                            <div>

                              <p className="text-sm font-medium text-slate-700">
                                {user.department.name}
                              </p>

                              <p className="text-xs text-slate-400 mt-0.5">
                                {user.department.code}
                              </p>

                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">
                              Unassigned
                            </span>
                          )}

                        </td>

                        {/* Status */}

                        <td className="px-6 py-4">

                          {user.isActive ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              Inactive
                            </span>
                          )}

                        </td>

                        {/* Created */}

                        <td className="px-6 py-4 text-sm text-slate-500">
                          {formatDate(user.createdAt)}
                        </td>

                        {/* Actions */}

                        <td className="px-6 py-4">

                          <div className="flex items-center justify-end gap-2">

                            <Link
                              to={`/admin/users/${user._id}`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-blue-200 hover:text-blue-600 transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </Link>

                            <button
                              type="button"
                              disabled={
                                updatingUserId === user._id
                              }
                              onClick={() =>
                                handleToggleStatus(user)
                              }
                              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                user.isActive
                                  ? "bg-red-50 text-red-700 hover:bg-red-100"
                                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              }`}
                            >

                              {updatingUserId ===
                              user._id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : user.isActive ? (
                                <UserX className="w-3.5 h-3.5" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}

                              {user.isActive
                                ? "Deactivate"
                                : "Activate"}

                            </button>

                          </div>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

              {/* Mobile Cards */}

              <div className="lg:hidden divide-y divide-slate-100">

                {users.map((user) => (

                  <div
                    key={user._id}
                    className="p-5"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex items-center gap-3 min-w-0">

                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <UserCog className="w-5 h-5" />
                        </div>

                        <div className="min-w-0">

                          <h3 className="font-semibold text-slate-900 truncate">
                            {user.name}
                          </h3>

                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {user.email}
                          </p>

                        </div>

                      </div>

                      {user.isActive ? (
                        <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          Active
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                          Inactive
                        </span>
                      )}

                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-5">

                      <div>
                        <p className="text-xs text-slate-400">
                          Role
                        </p>

                        <p className="text-sm font-medium text-slate-700 mt-1">
                          {formatRole(user.role)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Department
                        </p>

                        <p className="text-sm font-medium text-slate-700 mt-1">
                          {user.department?.name ||
                            "Unassigned"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Department Code
                        </p>

                        <p className="text-sm font-medium text-slate-700 mt-1">
                          {user.department?.code || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Created
                        </p>

                        <p className="text-sm font-medium text-slate-700 mt-1">
                          {formatDate(user.createdAt)}
                        </p>
                      </div>

                    </div>

                    <div className="flex gap-2 mt-5">

                      <Link
                        to={`/admin/users/${user._id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 hover:border-blue-200 hover:text-blue-600 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Details
                      </Link>

                      <button
                        type="button"
                        disabled={
                          updatingUserId === user._id
                        }
                        onClick={() =>
                          handleToggleStatus(user)
                        }
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-semibold transition disabled:opacity-50 ${
                          user.isActive
                            ? "bg-red-50 text-red-700 hover:bg-red-100"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >

                        {updatingUserId === user._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : user.isActive ? (
                          <UserX className="w-3.5 h-3.5" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}

                        {user.isActive
                          ? "Deactivate"
                          : "Activate"}

                      </button>

                    </div>

                  </div>

                ))}

              </div>
            </>
          )}

        </section>

        {/* =================================================
            FOOTER NOTE
        ================================================= */}

        {inactiveUsers > 0 && (
          <div className="mt-5 text-xs text-slate-500">
            <span className="font-semibold">
              {inactiveUsers}
            </span>{" "}
            government user
            {inactiveUsers !== 1 ? "s" : ""} currently
            inactive.
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminUsers;

