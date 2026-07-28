"use client";

import * as React from "react";
import type { LoginInput, RegisterInput } from "@/interfaces/AuthRepository";
import type { User } from "@/interfaces/types";
import { getAuthService } from "@/services/container";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  authDialogOpen: boolean;
  setAuthDialogOpen: (v: boolean) => void;
  requireAuth: () => boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = React.createContext<AuthContextValue>({
  user: null,
  loading: true,
  isAuthenticated: false,
  authDialogOpen: false,
  setAuthDialogOpen: () => {},
  requireAuth: () => false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [authDialogOpen, setAuthDialogOpen] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    getAuthService()
      .getCurrentUser()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => void 0)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = React.useCallback(async (input: LoginInput) => {
    const { user: u } = await getAuthService().login(input);
    setUser(u);
  }, []);

  const register = React.useCallback(async (input: RegisterInput) => {
    const { user: u } = await getAuthService().register(input);
    setUser(u);
  }, []);

  const logout = React.useCallback(async () => {
    await getAuthService().logout();
    setUser(null);
  }, []);

  const requireAuth = React.useCallback(() => {
    if (user) return true;
    setAuthDialogOpen(true);
    return false;
  }, [user]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      authDialogOpen,
      setAuthDialogOpen,
      requireAuth,
      login,
      register,
      logout,
    }),
    [user, loading, authDialogOpen, requireAuth, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
