import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
AlertCircle,
ArrowRight,
Building2,
CheckCircle2,
Clock3,
Loader2,
Plus,
RefreshCw,
Search,
UserX,
Users,
} from "lucide-react";

import api from "../api/axios";

const AdminDepartments = () => {
const [departments, setDepartments] = useState([]);
const [loading, setLoading] = useState(true);
const [updatingId, setUpdatingId] = useState(null);

const [error, setError] = useState("");
const [search, setSearch] = useState("");

// =====================================================
// FETCH DEPARTMENTS
// GET /api/admin/departments
// =====================================================

const fetchDepartments = async () => {
try {
setLoading(true);
setError("");


  const response = await api.get("/admin/departments");

  const data = response.data;

  console.log(
    "🏢 [AstraOS] ADMIN DEPARTMENTS:",
    data.data
  );

  if (!data.success) {
    throw new Error(
      data.message || "Failed to load departments"
    );
  }

  setDepartments(data.data.departments || []);
} catch (err) {
  console.error(
    "❌ [AstraOS] Admin departments error:",
    err
  );

  setError(
    err.response?.data?.message ||
      err.message ||
      "Unable to load departments."
  );
} finally {
  setLoading(false);
}

};

useEffect(() => {
fetchDepartments();
}, []);

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
// TOGGLE DEPARTMENT STATUS
// PATCH /api/admin/departments/:departmentId/status
// =====================================================

const handleToggleStatus = async (department) => {
const newStatus = !department.isActive;


const action = newStatus ? "activate" : "deactivate";

const confirmed = window.confirm(
  `Are you sure you want to ${action} ${department.name}?`
);

if (!confirmed) return;

try {
  setUpdatingId(department._id);
  setError("");

  const response = await api.patch(
    `/admin/departments/${department._id}/status`,
    {
      isActive: newStatus,
    }
  );

  const data = response.data;

  if (!data.success) {
    throw new Error(
      data.message ||
        `Failed to ${action} department`
    );
  }

  setDepartments((prev) =>
    prev.map((item) =>
      item._id === department._id
        ? {
            ...item,
            isActive: newStatus,
            updatedAt:
              data.data.department.updatedAt,
          }
        : item
    )
  );
} catch (err) {
  console.error(
    "❌ [AstraOS] Department status update error:",
    err
  );

  setError(
    err.response?.data?.message ||
      err.message ||
      `Unable to ${action} department.`
  );
} finally {
  setUpdatingId(null);
}


};

// =====================================================
// SEARCH
// =====================================================

const filteredDepartments = departments.filter(
(department) => {
const searchValue = search
.trim()
.toLowerCase();


  if (!searchValue) return true;

  return (
    department.name
      ?.toLowerCase()
      .includes(searchValue) ||
    department.code
      ?.toLowerCase()
      .includes(searchValue) ||
    department.description
      ?.toLowerCase()
      .includes(searchValue)
  );
}

);

// =====================================================
// LOADING
// =====================================================

if (loading) {
return ( <div className="min-h-screen bg-slate-50 flex items-center justify-center"> <div className="flex items-center gap-3 text-slate-600"> <Loader2 className="w-5 h-5 animate-spin" />

```
      <span>Loading departments...</span>
    </div>
  </div>
);


}

// =====================================================
// RENDER
// =====================================================

return ( <div className="min-h-screen bg-slate-50"> <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


    {/* =================================================
        HEADER
    ================================================= */}

    <section className="mb-8">
      <p className="text-sm font-semibold text-blue-600 mb-2">
        AstraOS Administration
      </p>

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">

        <div className="flex items-center gap-4">

          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Building2 className="w-7 h-7" />
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Departments
            </h1>

            <p className="text-slate-500 mt-1">
              Manage government departments across AstraOS.
            </p>
          </div>

        </div>

        <div className="flex flex-col sm:flex-row gap-3">

          <button
            type="button"
            onClick={fetchDepartments}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>

          <Link
            to="/admin/departments/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            Create Department
          </Link>

        </div>

      </div>
    </section>

    {/* =================================================
        ERROR
    ================================================= */}

    {error && (
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
        SUMMARY
    ================================================= */}

    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

      {/* Total */}

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between">

          <div>
            <p className="text-sm text-slate-500">
              Total Departments
            </p>

            <p className="text-2xl font-bold text-slate-900 mt-1">
              {departments.length}
            </p>
          </div>

          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>

        </div>
      </div>

      {/* Active */}

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between">

          <div>
            <p className="text-sm text-slate-500">
              Active Departments
            </p>

            <p className="text-2xl font-bold text-emerald-700 mt-1">
              {
                departments.filter(
                  (department) =>
                    department.isActive
                ).length
              }
            </p>
          </div>

          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>

        </div>
      </div>

      {/* Inactive */}

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between">

          <div>
            <p className="text-sm text-slate-500">
              Inactive Departments
            </p>

            <p className="text-2xl font-bold text-red-700 mt-1">
              {
                departments.filter(
                  (department) =>
                    !department.isActive
                ).length
              }
            </p>
          </div>

          <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <UserX className="w-5 h-5" />
          </div>

        </div>
      </div>

    </section>

    {/* =================================================
        SEARCH
    ================================================= */}

    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-6 p-4">

      <div className="relative max-w-xl">

        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search departments by name, code, or description..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
        />

      </div>

    </section>

    {/* =================================================
        DEPARTMENT LIST
    ================================================= */}

    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

      <div className="p-6 border-b border-slate-200">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Government Departments
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              {filteredDepartments.length} department
              {filteredDepartments.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>
          </div>

          <div className="inline-flex items-center gap-2 text-sm text-slate-500">
            <Users className="w-4 h-4" />
            Administrative management
          </div>

        </div>

      </div>

      {/* Empty State */}

      {filteredDepartments.length === 0 ? (
        <div className="p-12 text-center">

          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Building2 className="w-7 h-7" />
          </div>

          <h3 className="text-lg font-semibold text-slate-900 mt-4">
            No departments found
          </h3>

          <p className="text-sm text-slate-500 mt-1">
            {search
              ? "Try changing your search."
              : "Create your first government department."}
          </p>

          {!search && (
            <Link
              to="/admin/departments/create"
              className="inline-flex items-center gap-2 mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
            >
              <Plus className="w-4 h-4" />
              Create Department
            </Link>
          )}

        </div>
      ) : (
        <div className="divide-y divide-slate-200">

          {filteredDepartments.map(
            (department) => (
              <div
                key={department._id}
                className="p-5 sm:p-6 hover:bg-slate-50/70 transition"
              >

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                  {/* Department Info */}

                  <div className="flex items-start gap-4 min-w-0">

                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <h3 className="text-base sm:text-lg font-bold text-slate-900">
                          {department.name}
                        </h3>

                        {department.isActive ? (
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

                      </div>

                      <p className="text-sm font-semibold text-blue-600 mt-1">
                        {department.code}
                      </p>

                      {department.description && (
                        <p className="text-sm text-slate-500 mt-2 max-w-2xl">
                          {department.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-3">
                        <Clock3 className="w-3.5 h-3.5" />
                        Created{" "}
                        {formatDate(
                          department.createdAt
                        )}
                      </div>

                    </div>

                  </div>

                  {/* Actions */}

                  <div className="flex flex-col sm:flex-row gap-2 lg:shrink-0">

                    <Link
                      to={`/admin/departments/${department._id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition"
                    >
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <button
                      type="button"
                      disabled={
                        updatingId ===
                        department._id
                      }
                      onClick={() =>
                        handleToggleStatus(
                          department
                        )
                      }
                      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                        department.isActive
                          ? "bg-red-50 text-red-700 hover:bg-red-100"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                    >
                      {updatingId ===
                      department._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : department.isActive ? (
                        <UserX className="w-4 h-4" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}

                      {department.isActive
                        ? "Deactivate"
                        : "Activate"}
                    </button>

                  </div>

                </div>

              </div>
            )
          )}

        </div>
      )}

    </section>

  </main>
</div>


);
};

export default AdminDepartments;
