import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { authService } from "../auth/authService";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="app-navbar surface-0 border-bottom-1 border-200 px-4 py-3 flex justify-content-between align-items-center">
      <h2 className="m-0 text-900 text-xl">CustodiaStock</h2>
      <Button label="Logout" icon="pi pi-sign-out" severity="secondary" onClick={handleLogout} />
    </header>
  );
}

export default Navbar;
