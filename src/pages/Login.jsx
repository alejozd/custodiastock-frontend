import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Toast } from "primereact/toast";
import { authService } from "../auth/authService";

const initialForm = { email: "", password: "" };

function Login() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const toast = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (authService.isAuthenticated()) {
      const role = authService.getRole();
      navigate(role === "ADMIN" ? "/dashboard" : "/productos", { replace: true });
    }
  }, [navigate]);

  if (authService.isAuthenticated()) {
    return <Navigate to="/productos" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      const result = await authService.login(form);
      toast.current?.show({
        severity: "success",
        summary: "Bienvenido",
        detail: "Inicio de sesión exitoso.",
        life: 2000,
      });

      const role = (result?.user?.role ?? authService.getRole() ?? "").toUpperCase();
      navigate(role === "ADMIN" ? "/dashboard" : "/productos", { replace: true });
    } catch (error) {
      const message = error.response?.data?.message || "No fue posible iniciar sesión.";
      toast.current?.show({
        severity: "error",
        summary: "Error de autenticación",
        detail: message,
        life: 3500,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper min-h-screen flex align-items-center justify-content-center p-3">
      <Toast ref={toast} />
      <Card className="w-full login-card" title="Acceso a CustodiaStock">
        <p className="text-600 mt-0 mb-4">Ingresa tus credenciales para continuar.</p>

        <form className="flex flex-column gap-4" onSubmit={handleSubmit}>
          <span className="p-float-label">
            <InputText
              id="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full"
              autoComplete="username"
              required
            />
            <label htmlFor="email">Correo electrónico</label>
          </span>

          <span className="p-float-label">
            <Password
              id="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              className="w-full"
              feedback={false}
              toggleMask
              inputClassName="w-full"
              autoComplete="current-password"
              required
            />
            <label htmlFor="password">Contraseña</label>
          </span>

          <Button type="submit" label="Ingresar" icon="pi pi-sign-in" loading={loading} />
        </form>
      </Card>
    </div>
  );
}

export default Login;
