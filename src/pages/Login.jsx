import { useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const navigate = useNavigate();
  const { login, isAuthenticated, role } = useAuth();

  const landingPath = role === "ADMIN" ? "/usuarios" : "/productos";
  if (isAuthenticated) return <Navigate to={landingPath} replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      const result = await login(username, password);
      toast.current?.show({
        severity: "success",
        summary: "Bienvenido",
        detail: "Sesión iniciada.",
      });
      const userRole = String(result?.user?.role ?? "").toUpperCase();
      navigate(userRole === "ADMIN" ? "/usuarios" : "/productos", {
        replace: true,
      });
    } catch (error) {
      const message =
        error.response?.data?.message || "Usuario o contraseña inválidos.";
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: message,
        life: 3500,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* Elementos decorativos de fondo */}
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>
      <div className="bg-grid"></div>

      <Toast ref={toast} />

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo-container">
            <div className="logo-glass">
              <i className="pi pi-shield" />
            </div>
          </div>
          <h1 className="login-title">CustodiaStock</h1>
          <p className="login-subtitle">Control de entregas corporativas</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label>Usuario</label>
            <div className="input-wrapper">
              <i className="pi pi-user input-icon-main" />
              <InputText
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="usuario.admin"
                className="modern-input"
                required
              />
            </div>
          </div>

          <div className="login-field">
            <label>Contraseña</label>
            <div className="input-wrapper">
              <i className="pi pi-lock input-icon-main" />
              <InputText
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="modern-input"
                required
              />
              <i
                className={`pi ${showPassword ? "pi-eye-slash" : "pi-eye"} toggle-pass`}
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>
          </div>

          <Button
            type="submit"
            label="Ingresar al Sistema"
            icon="pi pi-sign-in"
            loading={loading}
            className="modern-button"
          />
        </form>

        <div className="login-footer-text">
          © {new Date().getFullYear()} Sistema de Gestión de Custodias
        </div>
      </div>
    </div>
  );
}

export default Login;
