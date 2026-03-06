import api from "../api/apiClient";

const TOKEN_KEY = "token";
const USER_KEY = "auth_user";

const parseJwt = (token) => {
  try {
    const payload = token.split(".")[1];
    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

const getRoleFromToken = (token) => {
  const payload = parseJwt(token);
  return payload?.role ?? payload?.user?.role ?? null;
};

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) ?? "null");
  } catch {
    return null;
  }
};

export const authService = {
  async login(credentials) {
    const response = await api.post("/auth/login", credentials);
    const token = response.data?.token;

    if (!token) {
      throw new Error("No se recibió el token de autenticación.");
    }

    const userFromResponse = response.data?.user ?? null;
    const role = userFromResponse?.role ?? getRoleFromToken(token);
    const user = userFromResponse ? { ...userFromResponse, role } : { role };

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return { token, user };
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser() {
    const user = getStoredUser();

    if (user?.role) {
      return user;
    }

    const token = this.getToken();
    if (!token) {
      return null;
    }

    const role = getRoleFromToken(token);
    if (!role) {
      return user;
    }

    const resolvedUser = { ...(user ?? {}), role };
    localStorage.setItem(USER_KEY, JSON.stringify(resolvedUser));
    return resolvedUser;
  },

  getRole() {
    return (this.getUser()?.role ?? "").toUpperCase();
  },

  isAuthenticated() {
    return Boolean(this.getToken());
  },
};
