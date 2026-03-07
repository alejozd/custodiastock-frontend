import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRoleLabel } from "../utils/roleLabels";
import { getAvatarColor } from "../utils/avatarColors";
import "../styles/Navbar.css"; // Asegúrate de importar el CSS

function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="app-navbar">
      <div className="navbar-left">
        <Button
          icon="pi pi-bars"
          text
          rounded
          className="menu-mobile-btn lg:hidden"
          onClick={onToggleSidebar}
        />
        <div className="brand-container flex align-items-center gap-2">
          <img src="/logo.svg" alt="CustodiaStock Logo" style={{ width: '32px', height: '32px' }} />
          <div className="brand-text">
            <h2 className="brand-title">CustodiaStock</h2>
            <span className="brand-subtitle">Panel de gestión</span>
          </div>
        </div>
      </div>

      <div className="navbar-right">
        {/* Chip de usuario mejorado */}
        <div className="user-profile-card hidden md:flex">
          <Avatar
            label={currentUser?.fullName?.charAt(0).toUpperCase() || currentUser?.username?.charAt(0).toUpperCase()}
            shape="circle"
            className="user-avatar-icon text-white"
            style={{ backgroundColor: getAvatarColor(currentUser?.fullName || currentUser?.username) }}
          />
          <div className="user-details">
            <span className="user-name">
              {currentUser?.username ?? "Usuario"}
            </span>
            <small className="user-role">
              {getRoleLabel(currentUser?.role)}
            </small>
          </div>
        </div>

        <Button
          label="Salir"
          icon="pi pi-sign-out"
          className="logout-action-btn"
          onClick={handleLogout}
        />
      </div>
    </header>
  );
}

export default Navbar;
