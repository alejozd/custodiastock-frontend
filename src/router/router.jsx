import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import MainLayout from "../layouts/MainLayout";
import CreateDelivery from "../pages/CreateDelivery";
import Dashboard from "../pages/Dashboard";
import Deliveries from "../pages/Deliveries";
import Login from "../pages/Login";
import Products from "../pages/Products";
import Users from "../pages/Users";

function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/usuarios" element={<Users />} />
          <Route path="/productos" element={<Products />} />
          <Route path="/entregas" element={<Deliveries />} />
          <Route path="/nueva-entrega" element={<CreateDelivery />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/usuarios" replace />} />
    </Routes>
  );
}

export default AppRouter;
