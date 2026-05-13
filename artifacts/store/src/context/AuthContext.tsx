import React, { createContext, useContext, useEffect, useState } from "react";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("tara_token"));
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useGetMe({
    query: {
      enabled: !!token,
      queryKey: getGetMeQueryKey(),
      retry: false,
    }
  });

  const login = (newToken: string) => {
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

  // Provide an initial loading state if token exists but user data hasn't loaded
  const isAuthLoading = !!token && isLoading;

  return (
    <AuthContext.Provider value={{ user: user as User, isAuthenticated, isAdmin, isLoading: isAuthLoading, login, logout }}>
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
