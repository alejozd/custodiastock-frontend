import axiosClient from "../api/axiosClient";

const toList = (response) => response.data?.data ?? response.data ?? [];

const userService = {
  async getUsers() {
    const response = await axiosClient.get("/users");
    return toList(response);
  },

  async getUserById(id) {
    const response = await axiosClient.get(`/users/${id}`);
    return response.data?.data ?? response.data;
  },

  async createUser(payload) {
    const response = await axiosClient.post("/users", payload);
    return response.data?.data ?? response.data;
  },

  async updateUser(id, payload) {
    const response = await axiosClient.put(`/users/${id}`, payload);
    return response.data?.data ?? response.data;
  },

  async deleteUser(id) {
    const response = await axiosClient.delete(`/users/${id}`);
    return response.data?.data ?? response.data;
  },
};

export default userService;
