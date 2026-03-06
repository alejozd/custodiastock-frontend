import axiosClient from "../api/axiosClient";

const TOKEN_KEY = "token";
const USER_KEY = "currentUser";

const parseJwt = (token) => {
  try {
    const payload = token.split(".")[1];
    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(normalized));
  } catch {
    return null;
  }
};

const resolveRole = (user, token) => {
  if (user?.role) {
    return String(user.role).toUpperCase();
  }

  const payload = parseJwt(token);
  const tokenRole = payload?.role ?? payload?.user?.role ?? null;
  return tokenRole ? String(tokenRole).toUpperCase() : null;
};

const authService = {
  async login(username, password) {
    const response = await axiosClient.post("/auth/login", { username, password });
    const token = response.data?.token;
    const responseUser = response.data?.user ?? {};

    if (!token) {
      throw new Error("No se recibió token de autenticación.");
    }

    const role = resolveRole(responseUser, token);
    const user = { ...responseUser, username, role: role ?? responseUser.role };

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return { token, user };
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getCurrentUser() {
    try {
      const storedUser = JSON.parse(localStorage.getItem(USER_KEY) || "null");
      const token = this.getToken();

      if (!storedUser && !token) {
        return null;
      }

      const role = resolveRole(storedUser, token);
      if (storedUser) {
        return { ...storedUser, role: role ?? storedUser.role };
      }

      return role ? { role } : null;
    } catch {
      return null;
    }
  },

  getRole() {
    return String(this.getCurrentUser()?.role ?? "").toUpperCase();
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
};

export default authService;
