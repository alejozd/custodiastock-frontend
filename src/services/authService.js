import axiosClient from "../api/axiosClient";
import { TOKEN_KEY, USER_KEY } from "../constants/authStorage";

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

const resolveUserId = (user, token) => {
  if (user?.id) {
    return user.id;
  }

  const payload = parseJwt(token);
  return payload?.id ?? payload?.userId ?? payload?.sub ?? payload?.user?.id ?? null;
};

// If the token has no `exp` claim we can't tell either way, so treat it as
// not-expired here and rely on the axiosClient 401 interceptor as the
// backstop for that case.
const isTokenExpired = (token) => {
  const payload = parseJwt(token);
  if (!payload?.exp) return false;
  return Date.now() >= payload.exp * 1000;
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
    const id = resolveUserId(responseUser, token);
    const user = { ...responseUser, id, username, role: role ?? responseUser.role };

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
      // getToken() first: if the token is expired it clears localStorage
      // (including USER_KEY), so the stored-user read below correctly sees
      // nothing left rather than returning a user whose session just ended.
      // Called as `authService.getToken()` (not `this.getToken()`) so this
      // still works if a caller destructures getCurrentUser off authService
      // and invokes it standalone, losing `this` in the process.
      const token = authService.getToken();
      const storedUser = JSON.parse(localStorage.getItem(USER_KEY) || "null");

      if (!storedUser && !token) {
        return null;
      }

      const role = resolveRole(storedUser, token);
      const id = resolveUserId(storedUser, token);

      if (storedUser) {
        return { ...storedUser, id: storedUser.id ?? id, role: role ?? storedUser.role };
      }

      return role || id ? { id, role } : null;
    } catch {
      return null;
    }
  },

  getRole() {
    return String(authService.getCurrentUser()?.role ?? "").toUpperCase();
  },

  getToken() {
    const token = localStorage.getItem(TOKEN_KEY);

    // A token that has already expired must not be treated as a valid
    // session just because it's still sitting in localStorage (e.g. after
    // the tab was closed and reopened past its expiry) — drop it here so
    // a fresh mount (AuthProvider's initial useState) starts from an
    // anonymous state instead of a stale one. This does NOT resync an
    // already-mounted AuthContext: isAuthenticated only updates on explicit
    // login()/logout(), so a session that expires mid-session still relies
    // on axiosClient's 401 interceptor as the real-time backstop. Calls
    // `authService.logout()` (not `this.logout()`) so getToken keeps working
    // if it's ever destructured off authService and invoked standalone (as
    // AuthContext.jsx already does: `getToken: authService.getToken`).
    if (token && isTokenExpired(token)) {
      authService.logout();
      return null;
    }

    return token;
  },
};

export default authService;
