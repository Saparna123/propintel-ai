import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api";

const Ctx = createContext(null);

export function AppProvider({ children }) {
  const [meta, setMeta] = useState(null);
  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState(localStorage.getItem("propintel_active") || "");
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(() => localStorage.getItem("propintel_user") || null);

  const getRegisteredUsers = () => {
    try {
      return JSON.parse(localStorage.getItem("propintel_demo_users") || "[]");
    } catch {
      return [];
    }
  };

  const registerUser = (fullName, email, username, password) => {
    const users = getRegisteredUsers();
    if (users.find((u) => u.username === username)) {
      return { success: false, error: "Username is already registered." };
    }
    if (users.find((u) => u.email === email)) {
      return { success: false, error: "Email is already registered." };
    }
    
    users.push({ fullName, email, username, password });
    localStorage.setItem("propintel_demo_users", JSON.stringify(users));
    return { success: true };
  };

  const login = (username, password) => {
    if (username === "admin" && password === "admin") {
      setUser(username);
      localStorage.setItem("propintel_user", username);
      return true;
    }

    const users = getRegisteredUsers();
    const foundUser = users.find(u => u.username === username && u.password === password);
    if (foundUser) {
      setUser(username);
      localStorage.setItem("propintel_user", username);
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("propintel_user");
  };

  const refreshList = async () => {
    const data = await api.listResearch();
    setItems(data.items || []);
    return data.items || [];
  };

  const loadActive = async (id) => {
    if (!id) {
      setActive(null);
      return;
    }
    const job = await api.getResearch(id);
    setActive(job);
    setActiveId(id);
    localStorage.setItem("propintel_active", id);
  };

  useEffect(() => {
    (async () => {
      try {
        const [m, list] = await Promise.all([api.meta(), api.listResearch()]);
        setMeta(m);
        setItems(list.items || []);
        const preferred = localStorage.getItem("propintel_active");
        const next = list.items?.find((x) => x.id === preferred) || list.items?.[0];
        if (next) {
          await loadActive(next.id);
        }
      } catch (e) {
        setError(e.message || "Backend unavailable");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = useMemo(
    () => ({
      meta,
      items,
      activeId,
      active,
      loading,
      error,
      setError,
      refreshList,
      user,
      login,
      logout,
      registerUser,
      loadActive,
      setActive,
      setItems,
    }),
    [meta, items, activeId, active, loading, error, user]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  return useContext(Ctx);
}
