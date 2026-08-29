import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
AlertCircle,
ArrowLeft,
Building2,
CheckCircle2,
FileText,
Hash,
Loader2,
Plus,
} from "lucide-react";

import api from "../api/axios";

const CreateDepartment = () => {
const navigate = useNavigate();

const [formData, setFormData] = useState({
name: "",
code: "",
description: "",
});

const [submitting, setSubmitting] = useState(false);
const [error, setError] = useState("");
const [success, setSuccess] = useState("");

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
// VALIDATION
// =====================================================

const validateForm = () => {
if (!formData.name.trim()) {
return "Please enter the department name.";
}


if (formData.name.trim().length < 2) {
  return "Department name must be at least 2 characters.";
}

if (!formData.code.trim()) {
  return "Please enter the department code.";
}

if (formData.code.trim().length < 2) {
  return "Department code must be at least 2 characters.";
}

return null;


};

// =====================================================
// CREATE DEPARTMENT
// POST /api/admin/departments
// =====================================================

const handleSubmit = async (e) => {
e.preventDefault();


setError("");
setSuccess("");

const validationError = validateForm();

if (validationError) {
  setError(validationError);
  return;
}

try {
  setSubmitting(true);

  const response = await api.post("/admin/departments", {
    name: formData.name.trim(),
    code: formData.code.trim().toUpperCase(),
    description: formData.description.trim(),
  });

  const data = response.data;

  console.log(
    "🏢 [AstraOS] CREATED DEPARTMENT:",
    data.data
  );

  if (!data.success) {
    throw new Error(
      data.message || "Failed to create department"
    );
  }

  setSuccess(
    "Department created successfully."
  );

  setTimeout(() => {
    navigate("/admin/departments");
  }, 1000);
} catch (err) {
  console.error(
    "❌ [AstraOS] Create department error:",
    err
  );

  setError(
    err.response?.data?.message ||
      err.message ||
      "Unable to create department."
  );
} finally {
  setSubmitting(false);
}


};

// =====================================================
// RENDER
// =====================================================

return ( <div className="min-h-screen bg-slate-50"> <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


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
        HEADER
    ================================================= */}

    <section className="mb-8">

      <p className="text-sm font-semibold text-blue-600 mb-2">
        AstraOS Administration
      </p>

      <div className="flex items-center gap-4">

        <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
          <Building2 className="w-7 h-7" />
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Create Department
          </h1>

          <p className="text-slate-600 mt-1">
            Add a new government department to AstraOS.
          </p>
        </div>

      </div>

    </section>

    {/* =================================================
        FORM CARD
    ================================================= */}

    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

      {/* Card Header */}

      <div className="p-6 border-b border-slate-200">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Department Information
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Enter the department's basic information.
            </p>
          </div>

        </div>

      </div>

      {/* Form */}

      <form
        onSubmit={handleSubmit}
        className="p-6 space-y-6"
      >

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />

            <p className="text-sm text-red-700">
              {error}
            </p>

          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">

            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />

            <p className="text-sm text-emerald-700">
              {success}
            </p>

          </div>
        )}

        {/* =================================================
            DEPARTMENT NAME
        ================================================= */}

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
              placeholder="e.g. Public Works Department"
              autoComplete="organization"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
            />

          </div>

          <p className="text-xs text-slate-400 mt-2">
            Use the official government department name.
          </p>

        </div>

        {/* =================================================
            DEPARTMENT CODE
        ================================================= */}

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
              placeholder="e.g. PWD"
              maxLength={20}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm uppercase text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
            />

          </div>

          <p className="text-xs text-slate-400 mt-2">
            A short unique code used to identify the department.
          </p>

        </div>

        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <div>

          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Description
            <span className="font-normal text-slate-400">
              {" "}
              (Optional)
            </span>
          </label>

          <div className="relative">

            <FileText className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the responsibilities of this department..."
              rows={5}
              maxLength={500}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
            />

          </div>

          <div className="flex justify-end mt-2">
            <p className="text-xs text-slate-400">
              {formData.description.length}/500
            </p>
          </div>

        </div>

        {/* =================================================
            INFORMATION NOTE
        ================================================= */}

        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">

          <div className="flex items-start gap-3">

            <Building2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />

            <div>

              <p className="text-sm font-semibold text-blue-900">
                Department activation
              </p>

              <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                New departments are created as active.
                Government users can then be assigned to
                the department.
              </p>

            </div>

          </div>

        </div>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">

          <Link
            to="/admin/departments"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:opacity-60"
          >

            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Department
              </>
            )}

          </button>

        </div>

      </form>

    </section>

  </main>
</div>


);
};

export default CreateDepartment;
