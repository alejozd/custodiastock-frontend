import axiosClient from "../api/axiosClient";

const TOKEN_KEY = "token";
const USER_KEY = "currentUser";

const authService = {
  async login(username, password) {
    const response = await axiosClient.post("/auth/login", { username, password });
    const token = response.data?.token;
    const user = response.data?.user ?? null;

    if (!token) {
      throw new Error("No se recibió token de autenticación.");
    }

    localStorage.setItem(TOKEN_KEY, token);
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    return { token, user };
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
};

export default authService;
