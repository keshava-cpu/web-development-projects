import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { loginUser } from "../api/auth";

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

const readStoredUser = () => {
  const raw = localStorage.getItem("rnd_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("rnd_token"));
  console.log("auth context token:", token);
  const [user, setUser] = useState(readStoredUser);

  // ── Email / Password login ────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const response = await loginUser({ email, password });

    // The response body is strictly { status, message, data: { user: { ... } } }
    const { user: nextUser } = response.data;

    if (nextUser) {
      localStorage.setItem("rnd_user", JSON.stringify(nextUser));
      setUser(nextUser);
    }

    return response;
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      // Clear the httpOnly cookie on the server
      await fetch(`${API_BASE}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore network errors on logout
    }
    localStorage.removeItem("rnd_token");
    localStorage.removeItem("rnd_user");
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [token, user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
