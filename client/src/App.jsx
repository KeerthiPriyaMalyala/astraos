
import { Routes, Route, Navigate } from "react-router-dom";


// =====================================================
// PUBLIC PAGES
// =====================================================

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";


// =====================================================
// CITIZEN PAGES
// =====================================================

import CitizenDashboard from "./pages/CitizenDashboard";
import CitizenComplaints from "./pages/CitizenComplaints";
import CreateComplaint from "./pages/CreateComplaint";
import ComplaintDetails from "./pages/ComplaintDetails";


// =====================================================
// ADMIN PAGES
// =====================================================

import AdminDashboard from "./pages/AdminDashboard";
import AdminComplaints from "./pages/AdminComplaints";
import AdminComplaintDetails from "./pages/AdminComplaintDetails";
import AdminUserDetails from "./pages/AdminUserDetails";
import AdminUsers from "./pages/AdminUsers";
import CreateGovernmentUser from "./pages/CreateGovernmentUser";
import AdminDepartments from "./pages/AdminDepartments";
import CreateDepartment from "./pages/CreateDepartment";
import AdminDepartmentDetails from "./pages/AdminDepartmentDetails";


// =====================================================
// DEPARTMENT HEAD PAGES
// =====================================================

import DepartmentDashboard from "./pages/DepartmentDashboard";
import DepartmentComplaints from "./pages/DepartmentComplaints";
import DepartmentComplaintDetails from "./pages/DepartmentComplaintDetails";


import OfficerDashboard from "./pages/OfficerDashboard";
import OfficerComplaints from "./pages/OfficerComplaints";
import OfficerComplaintDetails from "./pages/OfficerComplaintDetails";


// =====================================================
// ROUTE GUARDS
// =====================================================

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import DepartmentRoute from "./routes/DepartmentRoute";
import OfficerRoute from "./routes/OfficerRoute";






// =====================================================
// APP
// =====================================================

export default function App() {
  return (
    <Routes>

      {/* =====================================================
          PUBLIC ROUTES
      ===================================================== */}

      <Route
        path="/"
        element={<Landing />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />


      {/* =====================================================
          PROTECTED CITIZEN ROUTES
          Any authenticated user can pass ProtectedRoute.
      ===================================================== */}

      <Route element={<ProtectedRoute />}>

        {/* Citizen Dashboard */}
        <Route
          path="/dashboard"
          element={<CitizenDashboard />}
        />

        {/* Citizen Complaints */}
        <Route
          path="/complaints"
          element={<CitizenComplaints />}
        />

        {/* Create Complaint */}
        <Route
          path="/complaints/create"
          element={<CreateComplaint />}
          
        />

  


        {/* Citizen Complaint Details */}
        <Route
          path="/complaints/:id"
          element={<ComplaintDetails />}
        />

      </Route>


      {/* =====================================================
          ADMIN ROUTES
          Only ADMIN can access these.
      ===================================================== */}

      <Route element={<AdminRoute />}>

        {/* Admin Dashboard */}
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        {/* Admin Users */}
        <Route
          path="/admin/users"
          element={<AdminUsers />}
        />

        {/* Create Government User */}
        <Route
          path="/admin/users/create"
          element={<CreateGovernmentUser />}
        />

        {/* Admin User Details */}
        <Route
          path="/admin/users/:userId"
          element={<AdminUserDetails />}
        />

        {/* Admin Complaints */}
        <Route
          path="/admin/complaints"
          element={<AdminComplaints />}
        />

        {/* Admin Complaint Details */}
        <Route
          path="/admin/complaints/:id"
          element={<AdminComplaintDetails />}
        />

        {/* Admin Departments */}
        <Route
          path="/admin/departments"
          element={<AdminDepartments />}
        />

        {/* Admin Department Details */}
        <Route
          path="/admin/departments/:departmentId"
          element={<AdminDepartmentDetails />}
        />

        {/* Create Department */}
        <Route
          path="/admin/departments/create"
          element={<CreateDepartment />}
        />

      </Route>
         
          {/* =====================================================
              DEPARTMENT HEAD ROUTES

              ONLY DEPARTMENT_HEAD CAN ACCESS THESE ROUTES
          ===================================================== */}

          <Route element={<DepartmentRoute />}>

            {/* Department Dashboard */}
            <Route
              path="/department/dashboard"
              element={<DepartmentDashboard />}
            />

            {/* Department Complaints */}
            <Route
              path="/department/complaints"
              element={<DepartmentComplaints />}
            />

            {/* Department Complaint Details */}
            <Route
              path="/department/complaints/:id"
              element={<DepartmentComplaintDetails />}
            />
          </Route>



              {/* =====================================================
                  OFFICER ROUTES

                  ONLY OFFICERS CAN ACCESS THESE ROUTES
              ===================================================== */}

              <Route element={<OfficerRoute />}>

                {/* Officer Dashboard */}
                <Route
                  path="/officer/dashboard"
                  element={<OfficerDashboard />}
                />

                <Route
                  path="/officer/complaints"
                  element={<OfficerComplaints />}
                />


                <Route
                  path="/officer/complaints/:id"
                  element={<OfficerComplaintDetails />}
                />

              </Route>


      {/* =====================================================
          FALLBACK
      ===================================================== */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}

