import api from "../api/apiClient";

const TOKEN_KEY = "token";

export const authService = {
  async login(credentials) {
    const response = await api.post("/auth/login", credentials);
    const token = response.data?.token;

    if (!token) {
      throw new Error("Authentication token not found in response.");
    }

    localStorage.setItem(TOKEN_KEY, token);
    return response.data;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated() {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  },
};
