
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Loader from "../components/ui/Loader";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Check whether authentication information exists
  const token = localStorage.getItem("astraos_token");
  const userData = localStorage.getItem("astraos_user");

  /*
    AuthContext may still contain the old authentication state
    immediately after login.

    So we also check localStorage.

    This prevents the following problem:

    Login successful
        ↓
    localStorage updated
        ↓
    navigate()
        ↓
    AuthContext has not refreshed yet
        ↓
    ProtectedRoute incorrectly redirects to /login
  */

  if (loading) {
    return <Loader />;
  }

  // User is authenticated either through AuthContext
  // or through the successfully stored login credentials.
  const authenticated =
    isAuthenticated || (token && userData);

  // Not logged in
  if (!authenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Logged in
  return <Outlet />;
}

