import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
  try {
    const res = await api.get("/api/v1/candidates/profile");
    setUser({ role: "candidate", info: res.data.user });
  } catch {
    try {
      const res = await api.get("/api/v1/teachers/profile");
      setUser({ role: "teacher", info: res.data.user });
    } catch {
      setUser(null);
    }
  } finally {
    setLoading(false);
  }
};

  const logout = async () => {
    try {
      if (user?.role === "teacher")
        await api.post("/api/v1/teachers/logout");
      else
        await api.post("/api/v1/candidates/logout");
    } catch (err) {
      console.error("Logout failed:", err);
    }
    setUser(null);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
