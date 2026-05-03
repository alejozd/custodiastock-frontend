import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import ActivationScreen from "../components/ActivationScreen";
import licenseService from "../services/licenseService";
import "../styles/License.css";
import { shouldShowActivationScreen } from "../utils/licenseGuards";

const STATUS_LABELS = { PENDING_ACTIVATION: "Pendiente de activación", ACTIVE: "Activa", BLOCKED: "Bloqueada" };
const LICENSE_TYPE_LABELS = { DEMO: "Demo", ANNUAL: "Anual", PERMANENT: "Permanente" };
const severityByStatus = { PENDING_ACTIVATION: "warning", ACTIVE: "success", BLOCKED: "danger" };
const formatDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(d);
};

function LicensePage() {
  const [licenseInfo, setLicenseInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState("");
  const toast = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
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

  useEffect(() => { loadLicenseStatus(); }, []);

  const statusCode = String(licenseInfo?.status || "").toUpperCase();
  const isLicenseActive = statusCode === "ACTIVE";
  const isBlocked = statusCode === "BLOCKED";
  const isDemo = licenseInfo?.licenseType === "DEMO";
  const isExpired = Boolean(licenseInfo?.expirationDate && new Date(licenseInfo.expirationDate) < new Date());
  const isFunctionallyBlocked = isBlocked || isExpired;

  const alerts = useMemo(() => {
    if (!licenseInfo) return [];
    const list = [];
    if (isFunctionallyBlocked) list.push({ key: "blocked", severity: "error", text: "Licencia bloqueada o expirada. Contacta a soporte." });
    if (isDemo) list.push({ key: "demo", severity: "warn", text: "Modo demo: algunas acciones críticas están restringidas." });
    return list;
  }, [licenseInfo, isDemo, isFunctionallyBlocked]);

  const handleRefreshStatus = async () => {
    try {
      setValidating(true);
      await licenseService.validateLicense();
      await loadLicenseStatus();
      toast.current?.show({ severity: "success", summary: "Licencia validada", detail: "Estado actualizado correctamente." });
    } catch (err) {
      toast.current?.show({ severity: "error", summary: "Error", detail: err.response?.data?.message || "No se pudo validar la licencia." });
    } finally { setValidating(false); }
  };

  const handleActivate = async (nit) => {
    if (!nit?.trim()) return toast.current?.show({ severity: "warn", summary: "Atención", detail: "Debe ingresar un NIT válido." });
    try {
      setActivating(true);
      await licenseService.activateLicense({ nit: nit.trim() });
      await loadLicenseStatus();
      toast.current?.show({ severity: "success", summary: "Licencia activada", detail: "Activación completada correctamente." });
      navigate("/dashboard");
    } catch (err) {
      toast.current?.show({ severity: "error", summary: "No se pudo activar", detail: err.response?.data?.message || "Error al activar la licencia." });
    } finally { setActivating(false); }
  };

  if (loading) return <div className="license-page license-page-loading"><div className="flex flex-column align-items-center gap-3"><ProgressSpinner strokeWidth="4" /><span className="text-600 font-medium">Validando licencia...</span></div></div>;

  if (shouldShowActivationScreen(licenseInfo)) return <div className="license-page animate-fade-in"><Toast ref={toast} /><Message severity="warn" text="El sistema requiere activación con NIT para continuar." className="w-full" />{location.state?.activationRequired && <Message severity="info" text="Licencia pendiente de activación." className="w-full" />}<div className="mb-3"><Button icon="pi pi-refresh" label="Validar licencia" onClick={handleRefreshStatus} loading={validating} /></div><ActivationScreen onActivate={handleActivate} activating={activating} /></div>;

  if (isFunctionallyBlocked) return <div className="license-page animate-fade-in"><Toast ref={toast} /><Message severity="error" text="Licencia bloqueada o expirada. Contacta al administrador para reactivar el sistema." className="w-full" /><div className="mt-3"><Button icon="pi pi-refresh" label="Validar licencia" onClick={handleRefreshStatus} loading={validating} /></div></div>;

  const rows = [
    ["Tipo", LICENSE_TYPE_LABELS[licenseInfo?.licenseType]],
    ["NIT", licenseInfo?.nit],
    ["Aplicación", licenseInfo?.applicationName],
    ["Versión", licenseInfo?.version],
    ["Activación", formatDate(licenseInfo?.activationDate)],
    ["Expiración", formatDate(licenseInfo?.expirationDate)],
    ["Días restantes", typeof licenseInfo?.daysRemaining === "number" ? licenseInfo.daysRemaining : null],
  ].filter(([, value]) => value !== null && value !== undefined && value !== "");

  return (
    <div className="license-page animate-fade-in">
      <Toast ref={toast} />
      <div className="license-header"><div><h1 className="page-title m-0">Licencia del sistema</h1><p className="text-600 mt-2 mb-0">Consulta el estado de activación y validación del entorno actual.</p></div><div className="license-actions">{statusCode === "ACTIVE" && <Button icon="pi pi-refresh" label="Revalidar" size="small" onClick={handleRefreshStatus} loading={validating} />} {(statusCode === "BLOCKED" || statusCode === "PENDING_ACTIVATION") && <Button icon="pi pi-refresh" label="Validar licencia" onClick={handleRefreshStatus} loading={validating} />} </div></div>
      {error && <Message severity="error" text={error} className="w-full" />}
      <div className="license-alerts">{alerts.map((a) => <Message key={a.key} severity={a.severity} text={a.text} className="w-full" />)}</div>

      <div className="license-grid">
        <Card className="license-card">
          <div className="card-header"><h2>Estado de licencia</h2>{STATUS_LABELS[statusCode] && <Tag value={STATUS_LABELS[statusCode]} severity={severityByStatus[statusCode] ?? "info"} />}</div>
          <div className="license-fields">{rows.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
        </Card>

        <Card className="license-card">
          <div className="card-header"><h2>Validación e instalación</h2>{debugMode && <Button icon="pi pi-copy" label="Copiar hash" outlined onClick={() => navigator.clipboard.writeText(licenseInfo?.installationHash || "")} disabled={!licenseInfo?.installationHash} />}</div>
          <div className="license-fields">
            {debugMode && licenseInfo?.installationHash && <div><span>Installation Hash</span><strong className="hash-field">{licenseInfo.installationHash}</strong></div>}
            {formatDate(licenseInfo?.lastValidationAt) && <div><span>Última validación</span><strong>{formatDate(licenseInfo.lastValidationAt)}</strong></div>}
            {formatDate(licenseInfo?.offlineDeadlineAt) && <div><span>Límite modo offline</span><strong>{formatDate(licenseInfo.offlineDeadlineAt)}</strong></div>}
            <div><span>Modo offline</span><Tag value={licenseInfo?.offlineMode ? "Activo" : "Inactivo"} severity={licenseInfo?.offlineMode ? "warning" : "success"} /></div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default LicensePage;
