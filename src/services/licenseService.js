import axiosClient from "../api/axiosClient";
import pkg from "../../package.json";

const getPayload = (response) => response.data?.data ?? response.data ?? {};
const MS_PER_DAY = 1000 * 60 * 60 * 24;

const calculateDaysRemaining = (expirationDate) => {
  if (!expirationDate) return 0;

  const expiration = new Date(expirationDate);
  if (Number.isNaN(expiration.getTime())) return 0;

  const now = new Date();
  const diff = expiration.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / MS_PER_DAY));
};

// Mapeo remoto -> local sin alterar vigencia oficial de DocuCloud.
const mapRemoteToLocal = (payload = {}) => {
  const backendOffline = payload.offlineMode ?? payload.isOffline ?? false;
  const offlineByValidationFailure = payload.lastValidationSuccess === false;

  const activationDate = payload.activationDate ?? null;
  const expirationDate = payload.expirationDate ?? null;
  const licenseType = payload.licenseType ?? null;
  const status = payload.status ?? "DEMO";

  return {
    ...payload,
    // Campos oficiales de DocuCloud preservados tal cual.
    activationDate,
    expirationDate,
    licenseType,
    status,

    // Compatibilidad con la página actual.
    lastValidationAt: payload.lastValidationAt ?? payload.lastValidation ?? null,
    offlineDeadlineAt: payload.offlineDeadlineAt ?? payload.offlineGraceUntil ?? null,
    applicationName: payload.applicationName ?? "CustodiaStock",
    version: payload.version ?? `v${pkg.version}`,
    daysRemaining: calculateDaysRemaining(expirationDate),

    // Offline solo depende de señales de estado offline.
    offlineMode: Boolean(backendOffline || offlineByValidationFailure),
  };
};

const licenseService = {
  async getLicenseStatus() {
    const response = await axiosClient.get("/license/status");
    return mapRemoteToLocal(getPayload(response));
  },

  async validateLicense() {
    const response = await axiosClient.post("/license/validate");
    return mapRemoteToLocal(getPayload(response));
  },

  async activateLicense(payload = {}) {
    const response = await axiosClient.post("/license/activate", payload);
    return mapRemoteToLocal(getPayload(response));
  },
};

export default licenseService;
