import axiosClient from "../api/axiosClient";

const normalize = (response) => response.data?.data ?? response.data;

const licenseService = {
  async getLicenseStatus() {
    const response = await axiosClient.get("/license/status");
    return normalize(response) ?? {};
  },

  async validateLicense() {
    const response = await axiosClient.post("/license/validate");
    return normalize(response) ?? {};
  },

  async activateLicense(payload = {}) {
    const response = await axiosClient.post("/license/activate", payload);
    return normalize(response) ?? {};
  },
};

export default licenseService;
