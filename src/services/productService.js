import axiosClient from "../api/axiosClient";

const toList = (response) => response.data?.data ?? response.data ?? [];

const productService = {
  async getProducts() {
    const response = await axiosClient.get("/products");
    return toList(response);
  },

  async getProductById(id) {
    const response = await axiosClient.get(`/products/${id}`);
    return response.data?.data ?? response.data;
  },

  async createProduct(payload) {
    const response = await axiosClient.post("/products", payload);
    return response.data?.data ?? response.data;
  },

  async updateProduct(id, payload) {
    const response = await axiosClient.put(`/products/${id}`, payload);
    return response.data?.data ?? response.data;
  },

  async deleteProduct(id) {
    const response = await axiosClient.delete(`/products/${id}`);
    return response.data?.data ?? response.data;
  },

  async importProductsFromFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosClient.post("/products/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data?.data ?? response.data;
  },
};

export default productService;
