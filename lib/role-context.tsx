"use client";

// Backwards-compatibility re-export so existing components (sidebar, right-rail, etc.)
// that import useRole() continue working without changes.

import { useAuth } from "@/lib/auth-context";
import type { Role } from "@/lib/reportje-data";
import { createContext, useContext, ReactNode } from "react";

// Keep the original context shape for compatibility
type RoleContextType = {
  role: Role;
  setRole: (role: Role) => void;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  // RoleProvider is now a no-op wrapper; AuthProvider handles state.
  return <>{children}</>;
}

/** @deprecated use useAuth() instead */
export function useRole(): RoleContextType {
  const { role } = useAuth();
  // Default to "citizen" if not yet authenticated (avoids null issues during login redirect)
  return {
    role: (role ?? "citizen") as Role,
    setRole: () => {},
  };
}
