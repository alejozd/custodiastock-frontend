import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { authService } from "../auth/authService";

function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const user = authService.getUser();

  const handleLogout = () => {
    authService.logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="app-navbar surface-0 border-bottom-1 border-200 px-3 py-2 flex justify-content-between align-items-center gap-2">
      <div className="flex align-items-center gap-2">
        <Button
          icon="pi pi-bars"
          text
          rounded
          className="lg:hidden"
          aria-label="Menú"
          onClick={onToggleSidebar}
        />
        <div>
          <h2 className="m-0 text-900 text-lg">CustodiaStock</h2>
          <small className="text-500">Panel de gestión</small>
        </div>
      </div>

      <div className="flex align-items-center gap-2">
        <span className="hidden md:inline text-700">{user?.name ?? user?.email ?? "Usuario"}</span>
        <Button label="Salir" icon="pi pi-sign-out" severity="secondary" onClick={handleLogout} />
      </div>
    </header>
  );
}

export default Navbar;
