
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const token = localStorage.getItem("astraos_token");
  const userData = localStorage.getItem("astraos_user");

  // No login
  if (!token || !userData) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userData);

    // Logged in, but not ADMIN
    if (user.role !== "ADMIN") {
      return <Navigate to="/dashboard" replace />;
    }

    // ADMIN
    return <Outlet />;
  } catch (error) {
    console.error("Invalid stored user data:", error);

    localStorage.removeItem("astraos_token");
    localStorage.removeItem("astraos_user");

    return <Navigate to="/login" replace />;
  }
};

export default AdminRoute;

