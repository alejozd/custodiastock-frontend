import axiosClient from "../api/axiosClient";

const getPayload = (response) => response.data?.data ?? response.data ?? {};

const licenseService = {
  async getLicenseStatus() {
    const response = await axiosClient.get("/license/status");
    return getPayload(response);
  },

  async validateLicense() {
    const response = await axiosClient.post("/license/validate");
    return getPayload(response);
  },

  async activateLicense(payload = {}) {
    const response = await axiosClient.post("/license/register", payload);
    return getPayload(response);
  },
};

export default licenseService;
