import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import ActivationScreen from "../components/ActivationScreen";
import licenseService from "../services/licenseService";
import "../styles/License.css";

const STATUS_LABELS = {
  PENDING_ACTIVATION: "Pendiente de activación",
  DEMO: "Demo",
  ACTIVE: "Activa",
  BLOCKED: "Bloqueada",
};

const severityByStatus = {
  PENDING_ACTIVATION: "warning",
  ACTIVE: "success",
  DEMO: "warning",
  BLOCKED: "danger",
};

const fallback = "No disponible";

const formatDate = (value) => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(date);
};

function LicensePage() {
  const [licenseInfo, setLicenseInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState("");
  const toast = useRef(null);
  const navigate = useNavigate();
  const debugMode = new URLSearchParams(window.location.search).get("debug") === "true";

  const loadLicenseStatus = async () => {
    try {
      setError("");
      const data = await licenseService.getLicenseStatus();
      setLicenseInfo(data);
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo cargar el estado de la licencia.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLicenseStatus();
  }, []);

  const statusCode = String(licenseInfo?.status || "").toUpperCase();

  const alerts = useMemo(() => {
    if (!licenseInfo) return [];
    const alertList = [];

    if (statusCode === "BLOCKED") {
      alertList.push({ key: "blocked", severity: "error", text: "Licencia bloqueada. Contacta a soporte para reactivación." });
    }
    if (statusCode === "DEMO") {
      alertList.push({ key: "demo", severity: "warn", text: "Modo demo: algunas acciones críticas pueden estar restringidas." });
    }
    if (licenseInfo?.offlineMode) {
      alertList.push({ key: "offline", severity: "warn", text: "Modo offline activo." });
    }

    return alertList;
  }, [licenseInfo, statusCode]);

  const handleValidateNow = async () => {
    try {
      setValidating(true);
      await licenseService.validateLicense();
      await loadLicenseStatus();
      toast.current?.show({ severity: "success", summary: "Licencia validada", detail: "Estado actualizado correctamente." });
    } catch (err) {
      toast.current?.show({ severity: "error", summary: "Error", detail: err.response?.data?.message || "No se pudo validar la licencia." });
    } finally {
      setValidating(false);
    }
  };

  const handleActivate = async (nit) => {
    if (!nit?.trim()) {
      toast.current?.show({ severity: "warn", summary: "Atención", detail: "Debe ingresar un NIT válido." });
      return;
    }

    try {
      setActivating(true);
      await licenseService.activateLicense({ nit: nit.trim() });
      await loadLicenseStatus();
      toast.current?.show({ severity: "success", summary: "Licencia activada", detail: "Activación completada correctamente." });
      navigate("/dashboard");
    } catch (err) {
      toast.current?.show({ severity: "error", summary: "No se pudo activar", detail: err.response?.data?.message || "Error al activar la licencia." });
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <div className="license-page license-page-loading">
        <div className="flex flex-column align-items-center gap-3"><ProgressSpinner strokeWidth="4" /><span className="text-600 font-medium">Validando licencia...</span></div>
      </div>
    );
  }

  if (statusCode === "PENDING_ACTIVATION") {
    return (
      <>
        <Toast ref={toast} />
        <ActivationScreen onActivate={handleActivate} activating={activating} />
      </>
    );
  }

  return (
    <div className="license-page animate-fade-in">
      <Toast ref={toast} />
      <div className="license-header">
        <div>
          <h1 className="page-title m-0">Licencia del sistema</h1>
          <p className="text-600 mt-2 mb-0">Consulta el estado de activación y validación del entorno actual.</p>
        </div>
        <div className="license-actions">
          <Button icon="pi pi-refresh" label="Validar ahora" onClick={handleValidateNow} loading={validating} />
        </div>
      </div>
      {error && <Message severity="error" text={error} className="w-full" />}
      <div className="license-alerts">{alerts.map((alert) => <Message key={alert.key} severity={alert.severity} text={alert.text} className="w-full" />)}</div>

      <div className="license-grid">
        <Card className="license-card">
          <div className="card-header">
            <h2>Estado de licencia</h2>
            <Tag value={licenseInfo?.status ? (STATUS_LABELS[statusCode] ?? licenseInfo.status) : fallback} severity={severityByStatus[statusCode] ?? "info"} />
          </div>
          <div className="license-fields">
            <div><span>Tipo</span><strong>{licenseInfo?.licenseType ?? fallback}</strong></div>
            <div><span>NIT</span><strong>{licenseInfo?.nit ?? fallback}</strong></div>
            <div><span>Aplicación</span><strong>{licenseInfo?.applicationName ?? fallback}</strong></div>
            <div><span>Versión</span><strong>{licenseInfo?.version ?? fallback}</strong></div>
            <div><span>Activación</span><strong>{formatDate(licenseInfo?.activationDate)}</strong></div>
            <div><span>Expiración</span><strong>{formatDate(licenseInfo?.expirationDate)}</strong></div>
            <div><span>Días restantes</span><strong>{typeof licenseInfo?.daysRemaining === "number" ? licenseInfo.daysRemaining : fallback}</strong></div>
          </div>
        </Card>
        <Card className="license-card">
          <div className="card-header">
            <h2>Validación e instalación</h2>
            {debugMode && <Button icon="pi pi-copy" label="Copiar hash" outlined onClick={() => navigator.clipboard.writeText(licenseInfo?.installationHash || "")} disabled={!licenseInfo?.installationHash} />}
          </div>
          <div className="license-fields">
            {debugMode && <div><span>Installation Hash</span><strong className="hash-field">{licenseInfo?.installationHash ?? fallback}</strong></div>}
            <div><span>Última validación</span><strong>{formatDate(licenseInfo?.lastValidationAt)}</strong></div>
            <div><span>Límite modo offline</span><strong>{formatDate(licenseInfo?.offlineDeadlineAt)}</strong></div>
            <div><span>Modo offline</span><Tag value={licenseInfo?.offlineMode ? "Activo" : "Inactivo"} severity={licenseInfo?.offlineMode ? "warning" : "success"} /></div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default LicensePage;
