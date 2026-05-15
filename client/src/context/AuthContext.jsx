import { createContext, useContext, useState } from "react";
import { useGetMe, getGetMeQueryKey } from "@/hooks/useApi";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("tara_token"));
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useGetMe({
    query: {
      enabled: !!token,
      queryKey: getGetMeQueryKey(),
      retry: false,
    },
  });

  const login = (newToken) => {
    localStorage.setItem("tara_token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("tara_token");
    setToken(null);
    queryClient.clear();
    setLocation("/");
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === "admin";
  const isAuthLoading = !!token && isLoading;

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isAdmin, isLoading: isAuthLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
