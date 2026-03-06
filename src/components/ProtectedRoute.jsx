import { Navigate, Outlet } from "react-router-dom";
import { authService } from "../auth/authService";

function ProtectedRoute({ allowedRoles = [] }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0) {
    const currentRole = authService.getRole();
    if (!allowedRoles.includes(currentRole)) {
      return <Navigate to="/productos" replace />;
    }
  }

  return <Outlet />;
}

export default ProtectedRoute;
