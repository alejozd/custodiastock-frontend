import { Navigate, Outlet } from "react-router-dom";
import { authService } from "../auth/authService";

function ProtectedRoute() {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
