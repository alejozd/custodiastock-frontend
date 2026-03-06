import { useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Toast } from "primereact/toast";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/usuarios" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      await login(username, password);
      toast.current?.show({ severity: "success", summary: "Bienvenido", detail: "Sesión iniciada." });
      navigate("/usuarios", { replace: true });
    } catch (error) {
      const message = error.response?.data?.message || "Usuario o contraseña inválidos.";
      toast.current?.show({ severity: "error", summary: "Error", detail: message, life: 3500 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper min-h-screen flex align-items-center justify-content-center p-3">
      <Toast ref={toast} />
      <Card className="w-full login-card" title="Iniciar sesión">
        <p className="text-700 mt-0 mb-4">Accede con tu cuenta para administrar el inventario.</p>

        <form className="flex flex-column gap-4" onSubmit={handleSubmit}>
          <span className="p-float-label">
            <InputText
              id="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full"
              required
            />
            <label htmlFor="username">Nombre de usuario</label>
          </span>

          <span className="p-float-label login-password">
            <Password
              id="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full"
              inputClassName="w-full"
              feedback={false}
              toggleMask
              required
            />
            <label htmlFor="password">Contraseña</label>
          </span>

          <Button type="submit" label="Ingresar" icon="pi pi-sign-in" loading={loading} className="login-btn" />
        </form>
      </Card>
    </div>
  );
}

export default Login;
