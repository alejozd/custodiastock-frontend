import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="app-navbar px-3 py-2 md:px-4 md:py-3 flex justify-content-between align-items-center gap-2">
      <div className="flex align-items-center gap-2">
        <Button icon="pi pi-bars" text rounded className="lg:hidden text-white" aria-label="Menú" onClick={onToggleSidebar} />
        <div>
          <h2 className="m-0 text-white text-lg">CustodiaStock</h2>
          <small className="text-blue-100">Panel de gestión</small>
        </div>
      </div>

      <div className="flex align-items-center gap-2">
        <div className="user-chip hidden md:flex align-items-center gap-2 px-2 py-1 border-round-xl">
          <Avatar icon="pi pi-user" shape="circle" className="user-avatar" />
          <div className="flex flex-column">
            <span className="text-sm text-900 font-semibold line-height-2">{currentUser?.username ?? "Usuario"}</span>
            <small className="text-600 line-height-2">{currentUser?.role ?? "OPERADOR"}</small>
          </div>
        </div>

        <Button label="Salir" icon="pi pi-sign-out" severity="contrast" outlined className="logout-btn" onClick={handleLogout} />
      </div>
    </header>
  );
}

export default Navbar;
