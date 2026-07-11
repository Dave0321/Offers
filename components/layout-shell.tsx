"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { MobileHeader } from "@/components/dashboard/mobile-header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth-context";

const PUBLIC_PATHS = ["/login"];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (!isPublic && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isPublic, router]);

  // Login page — full screen, no shell
  if (isPublic) {
    return <>{children}</>;
  }

  // Not yet authenticated → render nothing (redirect is in flight)
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated → full dashboard shell
  return (
    <SidebarProvider>
      {/* Mobile Header */}
      <MobileHeader />

      {/* Desktop Layout */}
      <div className="flex w-full min-h-screen lg:gap-gap lg:px-sides relative overflow-x-hidden">
        <DashboardSidebar className="hidden lg:flex" />
        <main className="flex-1 w-full min-w-0 transition-all duration-300">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
