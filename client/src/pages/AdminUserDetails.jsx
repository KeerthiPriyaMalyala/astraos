import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
AlertCircle,
ArrowLeft,
Building2,
CalendarDays,
CheckCircle2,
Clock3,
Loader2,
Mail,
Phone,
ShieldCheck,
UserCog,
UserX,
} from "lucide-react";

import api from "../api/axios";

const AdminUserDetails = () => {
const { userId } = useParams();

const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [updating, setUpdating] = useState(false);

// =====================================================
// FETCH GOVERNMENT USER
// GET /api/admin/users/:userId
// =====================================================

const fetchUser = async () => {
try {
setLoading(true);
setError("");


  const response = await api.get(
    `/admin/users/${userId}`
  );

  const data = response.data;

  console.log(
    "👤 [AstraOS] GOVERNMENT USER:",
    data.data
  );

  if (!data.success) {
    throw new Error(
      data.message || "Failed to load government user"
    );
  }

  setUser(data.data.user);
} catch (err) {
  console.error(
    "❌ [AstraOS] Government user details error:",
    err
  );

  setError(
    err.response?.data?.message ||
      err.message ||
      "Unable to load government user."
  );
} finally {
  setLoading(false);
}


};

useEffect(() => {
fetchUser();
}, [userId]);

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

```
return new Date(date).toLocaleDateString("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
```

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
// UPDATE USER STATUS
// PATCH /api/admin/users/:userId/status
// =====================================================

const handleToggleStatus = async () => {
if (!user) return;


const newStatus = !user.isActive;

const action = newStatus ? "activate" : "deactivate";

const confirmed = window.confirm(
  `Are you sure you want to ${action} ${user.name}?`
);

if (!confirmed) return;

try {
  setUpdating(true);
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

  setUser((prev) => ({
    ...prev,
    isActive: newStatus,
    updatedAt: data.data.user.updatedAt,
  }));
} catch (err) {
  console.error(
    "❌ [AstraOS] Update government user status error:",
    err
  );

  setError(
    err.response?.data?.message ||
      err.message ||
      `Unable to ${action} user.`
  );
} finally {
  setUpdating(false);
}


};

// =====================================================
// LOADING
// =====================================================

if (loading) {
return ( <div className="min-h-screen bg-slate-50 flex items-center justify-center"> <div className="flex items-center gap-3 text-slate-600"> <Loader2 className="w-5 h-5 animate-spin" />


      <span>Loading government user...</span>
    </div>
  </div>
);


}

// =====================================================
// ERROR
// =====================================================

if (error && !user) {
return ( <div className="min-h-screen bg-slate-50 px-4 py-8"> <main className="max-w-5xl mx-auto">

      <Link
        to="/admin/users"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Government Users
      </Link>

      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />

          <div>
            <h2 className="font-semibold text-red-800">
              Unable to load government user
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

if (!user) return null;

// =====================================================
// RENDER
// =====================================================

return ( <div className="min-h-screen bg-slate-50"> <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


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
        ERROR AFTER UPDATE
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
        HEADER
    ================================================= */}

    <section className="mb-8">

      <p className="text-sm font-semibold text-blue-600 mb-2">
        AstraOS Administration
      </p>

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">

        <div className="flex items-center gap-4">

          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <UserCog className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
              {user.name}
            </h1>

            <p className="text-slate-500 mt-1">
              Government User Profile
            </p>
          </div>

        </div>

        {/* Status Action */}

        <button
          type="button"
          disabled={updating}
          onClick={handleToggleStatus}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
            user.isActive
              ? "bg-red-50 text-red-700 hover:bg-red-100"
              : "bg-emerald-600 text-white hover:bg-emerald-700"
          }`}
        >
          {updating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : user.isActive ? (
            <UserX className="w-4 h-4" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}

          {user.isActive
            ? "Deactivate User"
            : "Activate User"}
        </button>

      </div>
    </section>

    {/* =================================================
        MAIN PROFILE CARD
    ================================================= */}

    <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

      {/* Profile Header */}

      <div className="p-6 sm:p-8 border-b border-slate-200">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              User Information
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Account and government assignment details
            </p>
          </div>

          {/* Status */}

          {user.isActive ? (
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

      {/* Information Grid */}

      <div className="p-6 sm:p-8">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Name */}

          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Full Name
            </p>

            <p className="text-sm font-semibold text-slate-900 mt-2">
              {user.name || "Not available"}
            </p>

          </div>

          {/* Email */}

          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Email
            </p>

            <div className="flex items-center gap-2 mt-2">

              <Mail className="w-4 h-4 text-slate-400 shrink-0" />

              <p className="text-sm font-semibold text-slate-900 break-all">
                {user.email || "Not available"}
              </p>

            </div>

          </div>

          {/* Phone */}

          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Phone Number
            </p>

            <div className="flex items-center gap-2 mt-2">

              <Phone className="w-4 h-4 text-slate-400 shrink-0" />

              <p className="text-sm font-semibold text-slate-900">
                {user.phoneNumber || "Not available"}
              </p>

            </div>

          </div>

          {/* Role */}

          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Role
            </p>

            <div className="flex items-center gap-2 mt-2">

              <ShieldCheck className="w-4 h-4 text-blue-500" />

              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                  user.role === "DEPARTMENT_HEAD"
                    ? "bg-violet-50 text-violet-700"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                {formatRole(user.role)}
              </span>

            </div>

          </div>

          {/* Department */}

          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Department
            </p>

            <div className="flex items-center gap-2 mt-2">

              <Building2 className="w-4 h-4 text-slate-400" />

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {user.department?.name ||
                    "Unassigned"}
                </p>

                {user.department?.code && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {user.department.code}
                  </p>
                )}
              </div>

            </div>

          </div>

          {/* Account Status */}

          <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Account Status
            </p>

            <div className="flex items-center gap-2 mt-2">

              {user.isActive ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />

                  <span className="text-sm font-semibold text-emerald-700">
                    Active Account
                  </span>
                </>
              ) : (
                <>
                  <UserX className="w-4 h-4 text-red-500" />

                  <span className="text-sm font-semibold text-red-700">
                    Inactive Account
                  </span>
                </>
              )}

            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          ACCOUNT TIMELINE
      ================================================= */}

      <div className="border-t border-slate-200 p-6 sm:p-8">

        <h2 className="text-lg font-bold text-slate-900">
          Account Timeline
        </h2>

        <p className="text-sm text-slate-500 mt-1 mb-6">
          Important account dates
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Created */}

          <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">

            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Account Created
              </p>

              <p className="text-sm font-semibold text-slate-900 mt-1">
                {formatDate(user.createdAt)}
              </p>

              <p className="text-xs text-slate-500 mt-1">
                {formatDateTime(user.createdAt)}
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
                {formatDate(user.updatedAt)}
              </p>

              <p className="text-xs text-slate-500 mt-1">
                {formatDateTime(user.updatedAt)}
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

export default AdminUserDetails;
