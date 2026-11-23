
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getAccessToken, setAccessToken } from "../services/accessToken";
import { refreshAccessToken as refreshSessionToken } from "../services/api";

const AuthContext = createContext(null);

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5001/api/v1"
).replace(/\/$/, "");

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(getAccessToken() ? { Authorization: `Bearer ${getAccessToken()}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const refreshUser = useCallback(async () => {
    try {
      const data = await request("/auth/me");
      const currentUser = data.user || data.data?.user || null;

      setUser(currentUser);
      setAuthError("");

      return currentUser;
    } catch (error) {
      setUser(null);
      throw error;
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        await refreshSessionToken();
        const data = await request("/auth/me");

        if (active) {
          setUser(data.user || data.data?.user || null);
        }
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadUser();

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    setAuthError("");

    try {
      const data = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });

      const loggedInUser = data.user || data.data?.user || null;
      setAccessToken(data.accessToken);
      setUser(loggedInUser);

      if (!loggedInUser) {
        await refreshUser();
      }

      return data;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  }, [refreshUser]);

  const register = useCallback(async (details) => {
    setAuthError("");

    try {
      return await request("/auth/register", {
        method: "POST",
        body: JSON.stringify(details),
      });
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  }, []);

  const verifyEmail = useCallback((token) => request("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  }), []);

  const logout = useCallback(async () => {
    setAuthError("");

    try {
      await request("/auth/logout", {
        method: "POST",
        body: JSON.stringify({}),
      });
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((current) =>
      current ? { ...current, ...updates } : current
    );
  }, []);

  const value = useMemo(() => ({
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    authError,
    login,
    register,
    verifyEmail,
    logout,
    refreshUser,
    updateUser,
    setUser,
    setAuthError,
  }), [
    user,
    isLoading,
    authError,
    login,
    register,
    verifyEmail,
    logout,
    refreshUser,
    updateUser,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}

export default AuthContext;
