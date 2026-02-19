import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  // Boot: if token exists, fetch user
  useEffect(() => {
    async function boot() {
      try {
        if (!token) {
          setBooting(false);
          return;
        }
        const res = await api.get("/user");
        setUser(res.data?.data ?? res.data);
      } catch (e) {
        // token invalid or header missing -> clear
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setBooting(false);
      }
    }
    boot();
  }, [token]);

  async function login(email, password) {
    const res = await api.post("/login", { email, password });
    const newToken = res.data?.token;
    if (!newToken) throw new Error("Token not found in login response");

    localStorage.setItem("token", newToken);
    setToken(newToken);

    // use user from response to avoid extra request
    setUser(res.data?.user ?? null);
  }

  async function logout() {
    try {
      await api.post("/logout");
    } catch {
      // ignore
    }
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({ token, user, booting, login, logout }),
    [token, user, booting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
