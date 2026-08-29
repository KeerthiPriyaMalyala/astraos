
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  UserCog,
  UserPlus,
} from "lucide-react";

import api from "../api/axios";

const CreateGovernmentUser = () => {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "OFFICER",
    department: "",
  });

  // =====================================================
  // FETCH DEPARTMENTS
  // GET /api/departments
  // =====================================================

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingDepartments(true);

        const response = await api.get("/departments");

        const data = response.data;

        console.log(
          "🏢 [AstraOS] DEPARTMENTS:",
          data.data
        );

        if (!data.success) {
          throw new Error(
            data.message || "Failed to load departments"
          );
        }

        setDepartments(
          data.data.departments || data.data || []
        );
      } catch (err) {
        console.error(
          "❌ [AstraOS] Departments error:",
          err
        );

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load departments."
        );
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

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
      return "Please enter the user's name.";
    }

    if (!formData.email.trim()) {
      return "Please enter the user's email.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      return "Please enter a valid email address.";
    }

    if (!formData.password) {
      return "Please enter a temporary password.";
    }

   if (formData.password.length < 8) {
  return "Password must be at least 8 characters.";
}

    if (!formData.role) {
      return "Please select a role.";
    }

    if (!formData.department) {
      return "Please select a department.";
    }

    return null;
  };

  // =====================================================
  // CREATE GOVERNMENT USER
  // POST /api/admin/users
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

      const response = await api.post("/admin/users", {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
        department: formData.department,
      });

      const data = response.data;

      console.log(
        "👤 [AstraOS] CREATED GOVERNMENT USER:",
        data.data
      );

      if (!data.success) {
        throw new Error(
          data.message || "Failed to create government user"
        );
      }

      setSuccess(
        "Government user created successfully."
      );

      setTimeout(() => {
        navigate("/admin/users");
      }, 1000);
    } catch (err) {
      console.error(
        "❌ [AstraOS] Create government user error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to create government user."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // LOADING DEPARTMENTS
  // =====================================================

  if (loadingDepartments) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin" />

          <span>Loading departments...</span>
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* =================================================
            BACK
        ================================================= */}

        <Link
          to="/admin/users"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Government Users
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
              <UserPlus className="w-7 h-7" />
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
                Create Government User
              </h1>

              <p className="text-slate-600 mt-1">
                Add an officer or department head to AstraOS.
              </p>
            </div>

          </div>

        </section>

        {/* =================================================
            FORM CARD
        ================================================= */}

        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

          <div className="p-6 border-b border-slate-200">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <UserCog className="w-5 h-5" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  User Information
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Enter the government user's account details.
                </p>
              </div>

            </div>

          </div>

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
                NAME
            ================================================= */}

            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Full Name
              </label>

              <div className="relative">

                <UserCog className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  autoComplete="name"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                />

              </div>

            </div>

            {/* =================================================
                EMAIL
            ================================================= */}

            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>

              <div className="relative">

                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="officer@example.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                />

              </div>

            </div>

            {/* =================================================
                PASSWORD
            ================================================= */}

            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Temporary Password
              </label>

              <div className="relative">

                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter temporary password"
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-12 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>

              </div>

             <p className="text-xs text-slate-400 mt-2">
                Minimum 8 characters.
                </p>

            </div>

            {/* =================================================
                ROLE + DEPARTMENT
            ================================================= */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* ROLE */}

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Role
                </label>

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                >
                  <option value="OFFICER">
                    Officer
                  </option>

                  <option value="DEPARTMENT_HEAD">
                    Department Head
                  </option>
                </select>

              </div>

              {/* DEPARTMENT */}

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Department
                </label>

                <div className="relative">

                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />

                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                  >

                    <option value="">
                      Select department
                    </option>

                    {departments.map((department) => (
                      <option
                        key={department._id}
                        value={department._id}
                      >
                        {department.name}
                        {department.code
                          ? ` (${department.code})`
                          : ""}
                      </option>
                    ))}

                  </select>

                </div>

              </div>

            </div>

            {/* =================================================
                NOTE
            ================================================= */}

            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">

              <div className="flex items-start gap-3">

                <Building2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />

                <div>

                  <p className="text-sm font-semibold text-blue-900">
                    Government account
                  </p>

                  <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                    This user will be associated with the
                    selected department and can access
                    government-side AstraOS functionality
                    according to their assigned role.
                  </p>

                </div>

              </div>

            </div>

            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">

              <Link
                to="/admin/users"
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
                    <UserPlus className="w-4 h-4" />
                    Create Government User
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

export default CreateGovernmentUser;

