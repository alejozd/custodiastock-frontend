import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import MainLayout from "../layouts/MainLayout";
import CreateDelivery from "../pages/CreateDelivery";
import CreateEntry from "../pages/CreateEntry";
import Dashboard from "../pages/Dashboard";
import Deliveries from "../pages/Deliveries";
import Entries from "../pages/Entries";
import Login from "../pages/Login";
import Products from "../pages/Products";
import Users from "../pages/Users";
import Sequences from "../pages/Sequences";
import StockReport from "../pages/StockReport";
import LicensePage from "../pages/LicensePage";
import LicenseActivationGuard from "../components/LicenseActivationGuard";

function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<LicenseActivationGuard />}>
          <Route element={<MainLayout />}>
          <Route path="/productos" element={<Products />} />
          <Route path="/nueva-entrega" element={<CreateDelivery />} />
          <Route path="/nueva-entrada" element={<CreateEntry />} />

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/usuarios" element={<Users />} />
            <Route path="/entregas" element={<Deliveries />} />
            <Route path="/entradas" element={<Entries />} />
            <Route path="/reporte-stock" element={<StockReport />} />
            <Route path="/configuracion/secuencias" element={<Sequences />} />
            <Route path="/licencia" element={<LicensePage />} />
          </Route>
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/productos" replace />} />
    </Routes>
  );
}

export default AppRouter;
