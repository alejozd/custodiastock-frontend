import axiosClient from "../api/axiosClient";
import pkg from "../../package.json";

const getPayload = (response) => response.data?.data ?? response.data ?? {};

// Mapeo remoto -> local usando backend/DocuCloud como única fuente de verdad.
const mapRemoteToLocal = (payload = {}) => ({
  ...payload,
  status: payload.status,
  licenseType: payload.licenseType,
  activationDate: payload.activationDate,
  expirationDate: payload.expirationDate,
  daysRemaining: payload.daysRemaining,
  offlineMode: payload.offlineMode,
  lastValidationAt: payload.lastValidationAt ?? payload.lastValidation,
  installationHash: payload.installationHash,
  offlineDeadlineAt: payload.offlineDeadlineAt ?? payload.offlineGraceUntil,
  applicationName: payload.applicationName ?? "CustodiaStock",
  version: payload.version ?? `v${pkg.version}`,
  nit: payload.nit,
});

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
    const response = await axiosClient.post("/license/register", payload);
    return mapRemoteToLocal(getPayload(response));
  },
};

export { mapRemoteToLocal };
export default licenseService;
