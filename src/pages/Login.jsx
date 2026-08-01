import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
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

  useEffect(() => {
    if (sessionStorage.getItem("sessionExpiredMessage")) {
      sessionStorage.removeItem("sessionExpiredMessage");
      toast.current?.show({
        severity: "warn",
        summary: "Sesión finalizada",
        detail: "Tu sesión expiró o ya no es válida. Inicia sesión de nuevo.",
        life: 5000,
      });
    }
  }, []);

  const landingPath = role === "ADMIN" ? "/dashboard" : "/productos";
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
      const targetPath = userRole === "ADMIN" ? "/dashboard" : "/productos";
      navigate(targetPath, { replace: true });
      // navigate(userRole === "ADMIN" ? "/usuarios" : "/productos", {
      //   replace: true,
      // });
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
              <img src="/logo.svg" alt="CustodiaStock Logo" style={{ width: '42px', height: '42px' }} />
            </div>
          </div>
          <h1 className="login-title">CustodiaStock</h1>
          <p className="login-subtitle">Control de entregas corporativas</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label htmlFor="username">Usuario</label>
            <IconField iconPosition="left" className="input-wrapper">
              <InputIcon className="pi pi-user input-icon-main" />
              <InputText
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="usuario.admin"
                className="modern-input"
                required
              />
            </IconField>
          </div>

          <div className="login-field">
            <label htmlFor="password">Contraseña</label>
            <IconField iconPosition="left" className="input-wrapper">
              <InputIcon className="pi pi-lock input-icon-main" />
              <InputText
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="modern-input"
                required
              />
              <InputIcon
                className={`pi ${showPassword ? "pi-eye-slash" : "pi-eye"} password-toggle-icon`}
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: "pointer", pointerEvents: "auto", right: "16px", left: "auto" }}
              />
            </IconField>
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
