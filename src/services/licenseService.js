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

const normalizeLicense = (payload = {}) => {
  const backendOffline = payload.offlineMode ?? payload.isOffline ?? false;
  const offlineByValidationFailure = payload.lastValidationSuccess === false;

  return {
    ...payload,
    lastValidationAt: payload.lastValidationAt ?? payload.lastValidation ?? null,
    offlineDeadlineAt: payload.offlineDeadlineAt ?? payload.offlineGraceUntil ?? null,
    applicationName: payload.applicationName ?? "CustodiaStock",
    version: payload.version ?? `v${pkg.version}`,
    daysRemaining:
      payload.daysRemaining ?? calculateDaysRemaining(payload.expirationDate),
    offlineMode: Boolean(backendOffline || offlineByValidationFailure),
  };
};

const licenseService = {
  async getLicenseStatus() {
    const response = await axiosClient.get("/license/status");
    return normalizeLicense(getPayload(response));
  },

  async validateLicense() {
    const response = await axiosClient.post("/license/validate");
    return normalizeLicense(getPayload(response));
  },

  async activateLicense(payload = {}) {
    const response = await axiosClient.post("/license/activate", payload);
    return normalizeLicense(getPayload(response));
  },
};

export default licenseService;
