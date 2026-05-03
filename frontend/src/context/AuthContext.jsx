import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { role, info }
  const [loading, setLoading] = useState(true);

  // Save token & user on login
  const loginSuccess = async (role, token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("user", JSON.stringify(userData));

    // Set default Authorization header
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    setUser({ role, info: userData });
  };

  const logout = async () => {
    try {
      if (!user) return;

      if (user.role === "teacher") await api.post("/api/v1/teachers/logout");
      else await api.post("/api/v1/candidates/logout");
    } catch (err) {
      console.error("Logout failed:", err);
    }

    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
  };

  // Restore session on page load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const userData = localStorage.getItem("user");

    if (token && role && userData) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser({ role, info: JSON.parse(userData) });
    }

    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, loginSuccess, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
