import axios from "axios";
import { TOKEN_KEY, USER_KEY } from "../constants/authStorage";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// A 401 anywhere except the login endpoint itself means the session is no
// longer valid (expired token, or the user was deactivated/deleted and
// auth.middleware's re-check on the backend now rejects it) — the SPA must
// drop the stale session and send the user back to /login instead of
// leaving them on a screen that looks logged in but every request fails.
// A 401 from /auth/login is just "wrong username/password" and must keep
// surfacing as a normal rejected promise so Login.jsx can show its own error.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes("/auth/login");

    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      if (window.location.pathname !== "/login") {
        // This can be triggered by a silent background request (e.g. the
        // license-status poll in Sidebar.jsx), not just a user-initiated
        // action, so Login.jsx reads this flag on mount and explains the
        // redirect instead of leaving the user wondering what happened to
        // whatever they were doing.
        sessionStorage.setItem("sessionExpiredMessage", "true");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
