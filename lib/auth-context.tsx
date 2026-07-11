"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import type { Role } from "@/lib/reportje-data";

export interface AuthUser {
  name: string;
  email: string;
  avatar: string;
  area: string;
  // agency-only
  officer?: string;
  agency?: string;
  agencyId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  role: Role | null;
  isAuthenticated: boolean;
  login: (role: Role, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = "reportje_auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Rehydrate from sessionStorage on mount
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as { user: AuthUser; role: Role };
        setUser(stored.user);
        setRole(stored.role);
      }
    } catch {
      // ignore parse errors
    }
    setHydrated(true);
  }, []);

  const login = useCallback((newRole: Role, newUser: AuthUser) => {
    setRole(newRole);
    setUser(newUser);
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user: newUser, role: newRole }));
    } catch {
      // ignore storage errors
    }
  }, []);

  const logout = useCallback(() => {
    setRole(null);
    setUser(null);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore storage errors
    }
  }, []);

  if (!hydrated) return null; // Avoid flash on SSR

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user && !!role,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
