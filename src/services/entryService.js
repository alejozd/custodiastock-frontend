import axiosClient from "../api/axiosClient";

const toList = (response) => response.data?.data ?? response.data ?? [];

const entryService = {
  async getEntries(params) {
    const response = await axiosClient.get("/entries", { params });
    return toList(response);
  },

  async getEntryById(id) {
    const response = await axiosClient.get(`/entries/${id}`);
    return response.data?.data ?? response.data;
  },

  async createEntry(payload) {
    const response = await axiosClient.post("/entries", payload);
    return response.data?.data ?? response.data;
  },

  async cancelEntry(id, payload) {
    const response = await axiosClient.patch(`/entries/${id}/cancel`, payload);
    return response.data?.data ?? response.data;
  },

  async getNextNumber() {
    const response = await axiosClient.get("/entries/next-number");
    return response.data?.data ?? response.data;
  },
};

export default entryService;
