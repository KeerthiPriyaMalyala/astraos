
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Loader from "../components/ui/Loader";
import { useAuth } from "../context/AuthContext";


// =====================================================
// DEPARTMENT HEAD ROUTE
// =====================================================

export default function DepartmentRoute() {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();


  // =====================================================
  // WAIT FOR AUTHENTICATION CHECK
  // =====================================================

  if (loading) {
    return <Loader />;
  }


  // =====================================================
  // NOT LOGGED IN
  // =====================================================

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }


  // =====================================================
  // ONLY DEPARTMENT HEAD CAN ACCESS
  // =====================================================

  if (user?.role !== "DEPARTMENT_HEAD") {

    // Admin → Admin Dashboard
    if (user?.role === "ADMIN") {
      return (
        <Navigate
          to="/admin/dashboard"
          replace
        />
      );
    }


    // Everyone else → Citizen Dashboard
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }


  // =====================================================
  // DEPARTMENT HEAD
  // =====================================================

  return <Outlet />;
}

