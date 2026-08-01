import axiosClient from "../api/axiosClient";

const toList = (response) => response.data?.data ?? response.data ?? [];

const deliveryService = {
  async getDeliveries(params) {
    const response = await axiosClient.get("/deliveries", { params });
    return toList(response);
  },

  async getDeliveryById(id) {
    const response = await axiosClient.get(`/deliveries/${id}`);
    return response.data?.data ?? response.data;
  },

  async createDelivery(payload) {
    const response = await axiosClient.post("/deliveries", payload);
    return response.data?.data ?? response.data;
  },

  async cancelDelivery(id, payload) {
    const response = await axiosClient.patch(`/deliveries/${id}/cancel`, payload);
    return response.data?.data ?? response.data;
  },

  async getNextNumber() {
    const response = await axiosClient.get("/deliveries/next-number");
    return response.data?.data ?? response.data;
  },
};

export default deliveryService;
