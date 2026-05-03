import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import licenseService from "../services/licenseService";
import "../styles/License.css";

const STATUS_LABELS = {
  DEMO: "Demo",
  ACTIVE: "Activa",
  BLOCKED: "Bloqueada",
};

const severityByStatus = {
  ACTIVE: "success",
  DEMO: "warning",
  BLOCKED: "danger",
};

const fallback = "No disponible";

const getSyncLabel = (licenseInfo) => {
  if (licenseInfo?.offlineMode) return "Modo offline activo";
  if (licenseInfo?.status === "DEMO" && licenseInfo?.offlineMode === false) return "Sin activar";
  return fallback;
};

const formatDate = (value, fallbackText = fallback) => {
  if (!value) return fallbackText;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallbackText;
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

function LicensePage() {
  const [licenseInfo, setLicenseInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [activating, setActivating] = useState(false);
  const [activateDialogVisible, setActivateDialogVisible] = useState(false);
  const [activationForm, setActivationForm] = useState({ nit: "", versionApp: "" });
  const [error, setError] = useState("");
  const toast = useRef(null);
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
  const daysRemaining = licenseInfo?.daysRemaining;

  const alerts = useMemo(() => {
    if (!licenseInfo) return [];

    const alertList = [];

    if (statusCode === "BLOCKED") {
      alertList.push({
        key: "blocked",
        severity: "error",
        text: "La licencia está bloqueada. Contacta al administrador para restablecerla.",
      });
    }

    if (statusCode === "DEMO" && typeof daysRemaining === "number" && daysRemaining <= 7) {
      alertList.push({
        key: "demo",
        severity: "warn",
        text: `La licencia demo vence pronto (${daysRemaining} días restantes).`,
      });
    }

    if (licenseInfo?.offlineMode) {
      alertList.push({
        key: "offline",
        severity: "warn",
        text: "El sistema está operando en modo offline. Valida la licencia cuanto antes.",
      });
    }

    return alertList;
  }, [daysRemaining, licenseInfo, statusCode]);

  const handleValidateNow = async () => {
    try {
      setValidating(true);
      await licenseService.validateLicense();
      await loadLicenseStatus();
      toast.current?.show({
        severity: "success",
        summary: "Licencia validada",
        detail: "La licencia fue validada y la información se actualizó correctamente.",
      });
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: err.response?.data?.message || "No se pudo validar la licencia en este momento.",
      });
    } finally {
      setValidating(false);
    }
  };

  const handleActivateLicense = async () => {
    if (!activationForm.nit.trim()) {
      toast.current?.show({ severity: "warn", summary: "Atención", detail: "El NIT es obligatorio." });
      return;
    }

    try {
      setActivating(true);
      const payload = {
        nit: activationForm.nit.trim(),
        app: "CustodiaStock",
      };

      if (activationForm.versionApp?.trim()) {
        payload.version_app = activationForm.versionApp.trim();
      }

      await licenseService.activateLicense(payload);
      await loadLicenseStatus();
      setActivateDialogVisible(false);
      toast.current?.show({
        severity: "success",
        summary: "Licencia activada",
        detail: "La licencia fue registrada correctamente y el estado se actualizó.",
      });
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "No se pudo activar",
        detail: err.response?.data?.message || "Ocurrió un error al registrar la licencia.",
      });
    } finally {
      setActivating(false);
    }
  };

  const copyHash = async () => {
    const hash = licenseInfo?.installationHash;
    if (!hash) return;

    try {
      await navigator.clipboard.writeText(hash);
      toast.current?.show({
        severity: "success",
        summary: "Hash copiado",
        detail: "El installation hash se copió al portapapeles.",
      });
    } catch {
      toast.current?.show({
        severity: "warn",
        summary: "Atención",
        detail: "No se pudo copiar el hash automáticamente.",
      });
    }
  };

  if (loading) {
    return (
      <div className="license-page license-page-loading">
        <div className="flex flex-column align-items-center gap-3"><ProgressSpinner strokeWidth="4" /><span className="text-600 font-medium">Validando licencia...</span></div>
      </div>
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
          <Button
            icon="pi pi-key"
            label="Activar licencia"
            outlined
            onClick={() => setActivateDialogVisible(true)}
            loading={activating}
          />
        </div>
      </div>

      {error && <Message severity="error" text={error} className="w-full" />}

      <div className="license-alerts">
        {alerts.map((alert) => (
          <Message key={alert.key} severity={alert.severity} text={alert.text} className="w-full" />
        ))}
      </div>

      <div className="license-grid">
        <Card className="license-card">
          <div className="card-header">
            <h2>Estado de licencia</h2>
            <Tag value={licenseInfo?.status ? (STATUS_LABELS[statusCode] ?? licenseInfo.status) : getSyncLabel(licenseInfo)} severity={severityByStatus[statusCode] ?? "info"} />
          </div>

          <div className="license-fields">
            <div><span>Tipo</span><strong>{licenseInfo?.licenseType ?? getSyncLabel(licenseInfo)}</strong></div>
            <div><span>NIT</span><strong>{licenseInfo?.nit ?? getSyncLabel(licenseInfo)}</strong></div>
            <div><span>Aplicación</span><strong>{licenseInfo?.applicationName ?? getSyncLabel(licenseInfo)}</strong></div>
            <div><span>Versión</span><strong>{licenseInfo?.version ?? getSyncLabel(licenseInfo)}</strong></div>
            <div><span>Activación</span><strong>{formatDate(licenseInfo?.activationDate, getSyncLabel(licenseInfo))}</strong></div>
            <div><span>Expiración</span><strong>{formatDate(licenseInfo?.expirationDate, getSyncLabel(licenseInfo))}</strong></div>
            <div><span>Días restantes</span><strong>{typeof daysRemaining === "number" ? daysRemaining : getSyncLabel(licenseInfo)}</strong></div>
          </div>
        </Card>

        <Card className="license-card">
          <div className="card-header">
            <h2>Validación e instalación</h2>
            {debugMode && <Button icon="pi pi-copy" label="Copiar hash" outlined onClick={copyHash} disabled={!licenseInfo?.installationHash} />}
          </div>

          <div className="license-fields">
            {debugMode && <div><span>Installation Hash</span><strong className="hash-field">{licenseInfo?.installationHash ?? getSyncLabel(licenseInfo)}</strong></div>}
            <div><span>Última validación</span><strong>{formatDate(licenseInfo?.lastValidationAt)}</strong></div>
            <div><span>Límite modo offline</span><strong>{formatDate(licenseInfo?.offlineDeadlineAt)}</strong></div>
            <div>
              <span>Modo offline</span>
              <Tag value={licenseInfo?.offlineMode ? "Activo" : "Inactivo"} severity={licenseInfo?.offlineMode ? "warning" : "success"} />
            </div>
          </div>
        </Card>
      </div>

      <Dialog
        header="Activar licencia"
        visible={activateDialogVisible}
        style={{ width: "min(92vw, 460px)" }}
        onHide={() => setActivateDialogVisible(false)}
        footer={(
          <div className="flex justify-content-end gap-2">
            <Button label="Cancelar" text icon="pi pi-times" onClick={() => setActivateDialogVisible(false)} />
            <Button label="Registrar" icon="pi pi-check" onClick={handleActivateLicense} loading={activating} />
          </div>
        )}
        modal
      >
        <div className="flex flex-column gap-3 mt-2">
          <div className="flex flex-column gap-2">
            <label htmlFor="nit" className="font-semibold">NIT</label>
            <InputText
              id="nit"
              value={activationForm.nit}
              onChange={(e) => setActivationForm((prev) => ({ ...prev, nit: e.target.value }))}
              placeholder="Ej: 901234567"
            />
          </div>
          <div className="flex flex-column gap-2">
            <label htmlFor="versionApp" className="font-semibold">Versión de app (opcional)</label>
            <InputText
              id="versionApp"
              value={activationForm.versionApp}
              onChange={(e) => setActivationForm((prev) => ({ ...prev, versionApp: e.target.value }))}
              placeholder="Ej: 1.2.0"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default LicensePage;
