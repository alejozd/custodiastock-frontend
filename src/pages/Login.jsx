import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const onInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      await authService.login(form);
      toast.current?.show({
        severity: "success",
        summary: "Welcome",
        detail: "Login successful.",
        life: 2000,
      });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Unable to login.";
      toast.current?.show({
        severity: "error",
        summary: "Authentication failed",
        detail: message,
        life: 3500,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page min-h-screen flex align-items-center justify-content-center surface-ground p-3">
      <Toast ref={toast} />
      <Card title="CustodiaStock Login" className="w-full" style={{ maxWidth: "420px" }}>
        <form className="flex flex-column gap-4" onSubmit={handleSubmit}>
          <span className="p-float-label">
            <InputText
              id="email"
              value={form.email}
              onChange={(event) => onInputChange("email", event.target.value)}
              className="w-full"
              autoComplete="username"
              required
            />
            <label htmlFor="email">Email</label>
          </span>

          <span className="p-float-label">
            <Password
              id="password"
              value={form.password}
              onChange={(event) => onInputChange("password", event.target.value)}
              className="w-full"
              feedback={false}
              toggleMask
              inputClassName="w-full"
              autoComplete="current-password"
              required
            />
            <label htmlFor="password">Password</label>
          </span>

          <Button type="submit" label="Login" icon="pi pi-sign-in" loading={loading} />
        </form>
      </Card>
    </div>
  );
}

export default Login;
