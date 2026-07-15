import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginCandidate, registerCandidate } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("govt_exam_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("govt_exam_user");

    if (token) {
      try {
        setUser(storedUser ? JSON.parse(storedUser) : null);
      } catch (error) {
        localStorage.removeItem("govt_exam_user");
        setUser(null);
      }
    } else {
      setUser(null);
    }

    setLoading(false);
  }, [token]);

  const login = async (payload) => {
    const data = await loginCandidate(payload);
    localStorage.setItem("govt_exam_token", data.token);
    localStorage.setItem("govt_exam_user", JSON.stringify(data.candidate));
    setToken(data.token);
    setUser(data.candidate);
    return data;
  };

  const register = async (payload) => {
    const data = await registerCandidate(payload);
    localStorage.setItem("govt_exam_token", data.token);
    localStorage.setItem("govt_exam_user", JSON.stringify(data.candidate));
    setToken(data.token);
    setUser(data.candidate);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("govt_exam_token");
    localStorage.removeItem("govt_exam_user");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
