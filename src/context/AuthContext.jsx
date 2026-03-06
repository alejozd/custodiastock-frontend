/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(authService.getToken());
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  const login = async (username, password) => {
    const result = await authService.login(username, password);
    setToken(result.token);
    setCurrentUser(result.user ?? null);
    return result;
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setCurrentUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      currentUser,
      isAuthenticated: Boolean(token),
      login,
      logout,
      getToken: authService.getToken,
    }),
    [token, currentUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
