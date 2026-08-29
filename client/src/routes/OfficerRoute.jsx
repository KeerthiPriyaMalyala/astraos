



import { Navigate, Outlet, useLocation } from "react-router-dom";
import Loader from "../components/ui/Loader";
import { useAuth } from "../context/AuthContext";

export default function OfficerRoute() {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // =====================================================
  // WAIT FOR AUTHENTICATION RESTORATION
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
  // ONLY OFFICER CAN ACCESS
  // =====================================================

  if (user?.role !== "OFFICER") {
    // Admin → Admin Dashboard
    if (user?.role === "ADMIN") {
      return (
        <Navigate
          to="/admin/dashboard"
          replace
        />
      );
    }

    // Department Head → Department Dashboard
    if (user?.role === "DEPARTMENT_HEAD") {
      return (
        <Navigate
          to="/department/dashboard"
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
  // AUTHORIZED OFFICER
  // =====================================================

  return <Outlet />;
}



