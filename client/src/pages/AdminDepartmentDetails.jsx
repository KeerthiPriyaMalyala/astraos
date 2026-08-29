import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
AlertCircle,
ArrowLeft,
Building2,
CalendarDays,
CheckCircle2,
Clock3,
Edit3,
Hash,
Loader2,
Save,
UserX,
X,
} from "lucide-react";

import api from "../api/axios";

const AdminDepartmentDetails = () => {
const { departmentId } = useParams();

const [department, setDepartment] = useState(null);

const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [updatingStatus, setUpdatingStatus] = useState(false);

const [error, setError] = useState("");
const [success, setSuccess] = useState("");

const [editing, setEditing] = useState(false);

const [formData, setFormData] = useState({
name: "",
code: "",
description: "",
});

// =====================================================
// FETCH DEPARTMENT
// GET /api/admin/departments/:departmentId
// =====================================================

const fetchDepartment = async () => {
try {
setLoading(true);
setError("");


  const response = await api.get(
    `/admin/departments/${departmentId}`
  );

  const data = response.data;

  console.log(
    "🏢 [AstraOS] DEPARTMENT DETAILS:",
    data.data
  );

  if (!data.success) {
    throw new Error(
      data.message || "Failed to load department"
    );
  }

  const departmentData = data.data.department;

  setDepartment(departmentData);

  setFormData({
    name: departmentData.name || "",
    code: departmentData.code || "",
    description: departmentData.description || "",
  });
} catch (err) {
  console.error(
    "❌ [AstraOS] Department details error:",
    err
  );

  setError(
    err.response?.data?.message ||
      err.message ||
      "Unable to load department."
  );
} finally {
  setLoading(false);
}


};

useEffect(() => {
fetchDepartment();
}, [departmentId]);

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
// FORMAT DATE + TIME
// =====================================================

const formatDateTime = (date) => {
if (!date) return "Unknown";


return new Date(date).toLocaleString("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});


};

// =====================================================
// HANDLE INPUT
// =====================================================

const handleChange = (e) => {
const { name, value } = e.target;


setFormData((prev) => ({
  ...prev,
  [name]: value,
}));

setError("");
setSuccess("");


};

// =====================================================
// START EDITING
// =====================================================

const handleStartEditing = () => {
setFormData({
name: department.name || "",
code: department.code || "",
description: department.description || "",
});


setError("");
setSuccess("");
setEditing(true);


};

// =====================================================
// CANCEL EDITING
// =====================================================

const handleCancelEditing = () => {
setFormData({
name: department.name || "",
code: department.code || "",
description: department.description || "",
});


setError("");
setSuccess("");
setEditing(false);


};

// =====================================================
// VALIDATION
// =====================================================

const validateForm = () => {
if (!formData.name.trim()) {
return "Department name is required.";
}


if (formData.name.trim().length < 2) {
  return "Department name must be at least 2 characters.";
}

if (!formData.code.trim()) {
  return "Department code is required.";
}

if (formData.code.trim().length < 2) {
  return "Department code must be at least 2 characters.";
}

return null;


};

// =====================================================
// UPDATE DEPARTMENT
// PUT /api/admin/departments/:departmentId
// =====================================================

const handleSave = async (e) => {
e.preventDefault();


setError("");
setSuccess("");

const validationError = validateForm();

if (validationError) {
  setError(validationError);
  return;
}

try {
  setSaving(true);

  const response = await api.put(
    `/admin/departments/${departmentId}`,
    {
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      description: formData.description.trim(),
    }
  );

  const data = response.data;

  console.log(
    "🏢 [AstraOS] UPDATED DEPARTMENT:",
    data.data
  );

  if (!data.success) {
    throw new Error(
      data.message || "Failed to update department"
    );
  }

  const updatedDepartment =
    data.data.department;

  setDepartment((prev) => ({
    ...prev,
    ...updatedDepartment,
  }));

  setFormData({
    name: updatedDepartment.name || "",
    code: updatedDepartment.code || "",
    description:
      updatedDepartment.description || "",
  });

  setEditing(false);
  setSuccess(
    "Department updated successfully."
  );
} catch (err) {
  console.error(
    "❌ [AstraOS] Update department error:",
    err
  );

  setError(
    err.response?.data?.message ||
      err.message ||
      "Unable to update department."
  );
} finally {
  setSaving(false);
}


};

// =====================================================
// TOGGLE STATUS
// PATCH /api/admin/departments/:departmentId/status
// =====================================================

const handleToggleStatus = async () => {
if (!department) return;


const newStatus = !department.isActive;

const action = newStatus
  ? "activate"
  : "deactivate";

const confirmed = window.confirm(
  `Are you sure you want to ${action} ${department.name}?`
);

if (!confirmed) return;

try {
  setUpdatingStatus(true);
  setError("");
  setSuccess("");

  const response = await api.patch(
    `/admin/departments/${departmentId}/status`,
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

  setDepartment((prev) => ({
    ...prev,
    isActive: newStatus,
    updatedAt:
      data.data.department.updatedAt,
  }));

  setSuccess(
    `Department ${
      newStatus ? "activated" : "deactivated"
    } successfully.`
  );
} catch (err) {
  console.error(
    "❌ [AstraOS] Department status error:",
    err
  );

  setError(
    err.response?.data?.message ||
      err.message ||
      `Unable to ${action} department.`
  );
} finally {
  setUpdatingStatus(false);
}


};

// =====================================================
// LOADING
// =====================================================

if (loading) {
return ( <div className="min-h-screen bg-slate-50 flex items-center justify-center"> <div className="flex items-center gap-3 text-slate-600"> <Loader2 className="w-5 h-5 animate-spin" />


      <span>Loading department...</span>
    </div>
  </div>
);


}

// =====================================================
// ERROR
// =====================================================

if (error && !department) {
return ( <div className="min-h-screen bg-slate-50 px-4 py-8"> <main className="max-w-5xl mx-auto">


      <Link
        to="/admin/departments"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Departments
      </Link>

      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

        <div className="flex items-start gap-3">

          <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />

          <div>

            <h2 className="font-semibold text-red-800">
              Unable to load department
            </h2>

            <p className="text-sm text-red-700 mt-1">
              {error}
            </p>

          </div>

        </div>

      </div>

    </main>
  </div>
);


}

if (!department) return null;

// =====================================================
// RENDER
// =====================================================

return ( <div className="min-h-screen bg-slate-50">


  <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

    {/* =================================================
        BACK
    ================================================= */}

    <Link
      to="/admin/departments"
      className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 mb-6"
    >
      <ArrowLeft className="w-4 h-4" />
      Back to Departments
    </Link>

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
        SUCCESS
    ================================================= */}

    {success && (
      <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">

        <div className="flex items-center gap-3">

          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />

          <p className="text-sm text-emerald-700">
            {success}
          </p>

        </div>

      </div>
    )}

    {/* =================================================
        HEADER
    ================================================= */}

    <section className="mb-8">

      <p className="text-sm font-semibold text-blue-600 mb-2">
        AstraOS Administration
      </p>

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">

        <div className="flex items-center gap-4">

          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Building2 className="w-8 h-8" />
          </div>

          <div>

            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
              {department.name}
            </h1>

            <p className="text-slate-500 mt-1">
              Department Profile
            </p>

          </div>

        </div>

        <div className="flex flex-col sm:flex-row gap-3">

          <button
            type="button"
            onClick={handleStartEditing}
            disabled={editing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Edit3 className="w-4 h-4" />
            Edit Department
          </button>

          <button
            type="button"
            onClick={handleToggleStatus}
            disabled={updatingStatus}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
              department.isActive
                ? "bg-red-50 text-red-700 hover:bg-red-100"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            {updatingStatus ? (
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

    </section>

    {/* =================================================
        PROFILE CARD
    ================================================= */}

    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

      {/* Header */}

      <div className="p-6 sm:p-8 border-b border-slate-200">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>

            <h2 className="text-xl font-bold text-slate-900">
              Department Information
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Basic department details and status
            </p>

          </div>

          {department.isActive ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Inactive
            </span>
          )}

        </div>

      </div>

      {/* =================================================
          EDIT FORM
      ================================================= */}

      {editing ? (
        <form
          onSubmit={handleSave}
          className="p-6 sm:p-8 space-y-6"
        >

          {/* Name */}

          <div>

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Department Name
            </label>

            <div className="relative">

              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
              />

            </div>

          </div>

          {/* Code */}

          <div>

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Department Code
            </label>

            <div className="relative">

              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                maxLength={20}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm uppercase text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
              />

            </div>

          </div>

          {/* Description */}

          <div>

            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              maxLength={500}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
            />

            <div className="flex justify-end mt-2">
              <p className="text-xs text-slate-400">
                {formData.description.length}/500
              </p>
            </div>

          </div>

          {/* Actions */}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">

            <button
              type="button"
              onClick={handleCancelEditing}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-60"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:opacity-60"
            >

              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}

            </button>

          </div>

        </form>
      ) : (
        /* =================================================
           VIEW INFORMATION
        ================================================= */

        <div className="p-6 sm:p-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Name */}

            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Department Name
              </p>

              <div className="flex items-center gap-2 mt-2">

                <Building2 className="w-4 h-4 text-slate-400" />

                <p className="text-sm font-semibold text-slate-900">
                  {department.name}
                </p>

              </div>

            </div>

            {/* Code */}

            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Department Code
              </p>

              <div className="flex items-center gap-2 mt-2">

                <Hash className="w-4 h-4 text-blue-500" />

                <p className="text-sm font-semibold text-blue-700">
                  {department.code}
                </p>

              </div>

            </div>

            {/* Description */}

            <div className="md:col-span-2 rounded-xl bg-slate-50 border border-slate-100 p-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Description
              </p>

              <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                {department.description ||
                  "No description provided."}
              </p>

            </div>

            {/* Status */}

            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Account Status
              </p>

              <div className="flex items-center gap-2 mt-2">

                {department.isActive ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />

                    <span className="text-sm font-semibold text-emerald-700">
                      Active Department
                    </span>
                  </>
                ) : (
                  <>
                    <UserX className="w-4 h-4 text-red-500" />

                    <span className="text-sm font-semibold text-red-700">
                      Inactive Department
                    </span>
                  </>
                )}

              </div>

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          ACCOUNT TIMELINE
      ================================================= */}

      <div className="border-t border-slate-200 p-6 sm:p-8">

        <h2 className="text-lg font-bold text-slate-900">
          Department Timeline
        </h2>

        <p className="text-sm text-slate-500 mt-1 mb-6">
          Important department dates
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Created */}

          <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">

            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>

            <div>

              <p className="text-xs text-slate-400">
                Department Created
              </p>

              <p className="text-sm font-semibold text-slate-900 mt-1">
                {formatDate(
                  department.createdAt
                )}
              </p>

              <p className="text-xs text-slate-500 mt-1">
                {formatDateTime(
                  department.createdAt
                )}
              </p>

            </div>

          </div>

          {/* Updated */}

          <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">

            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock3 className="w-5 h-5" />
            </div>

            <div>

              <p className="text-xs text-slate-400">
                Last Updated
              </p>

              <p className="text-sm font-semibold text-slate-900 mt-1">
                {formatDate(
                  department.updatedAt
                )}
              </p>

              <p className="text-xs text-slate-500 mt-1">
                {formatDateTime(
                  department.updatedAt
                )}
              </p>

            </div>

          </div>

        </div>

      </div>

    </section>

  </main>
</div>


);
};

export default AdminDepartmentDetails;
