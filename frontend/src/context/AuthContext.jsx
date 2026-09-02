import React, { createContext, useContext, useState } from "react";
import api from "../api/axios.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const requestCode = async (purpose, fields) => {
    const { data } = await api.post("/auth/request-code", { purpose, ...fields });
    return data;
  };

  const verifyCode = async (purpose, email, code) => {
    const { data } = await api.post("/auth/verify-code", { purpose, email, code });
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = (nextUser) => {
    const merged = { ...user, ...nextUser };
    localStorage.setItem("user", JSON.stringify(merged));
    setUser(merged);
  };

  return (
    <AuthContext.Provider value={{ user, requestCode, verifyCode, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
