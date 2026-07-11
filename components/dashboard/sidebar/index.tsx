"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  FilePlus2,
  ListChecks,
  Building2,
  BarChart3,
  Users,
  Megaphone,
  ChevronsUpDown,
  LogOut,
  Settings,
  Network,
  Bell,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Bullet } from "@/components/ui/bullet";
import LockIcon from "@/components/icons/lock";
import { useIsV0 } from "@/lib/v0-context";
import { useAuth } from "@/lib/auth-context";
import type { Role } from "@/lib/reportje-data";

type NavItem = {
  title: string;
  url: string;
  icon: React.ElementType;
  locked?: boolean;
};

const NAV: Record<Role, { label: string; items: NavItem[] }> = {
  citizen: {
    label: "My Community",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
      { title: "Report an Issue", url: "/report", icon: FilePlus2 },
      { title: "Track Progress", url: "/progress", icon: ListChecks },
    ],
  },
  agency: {
    label: "Agency Console",
    items: [
      { title: "Dashboard", url: "/agency", icon: Building2 },
      { title: "Analytics", url: "/agency?tab=analytics", icon: BarChart3 },
      { title: "Network", url: "/agency?tab=collaboration", icon: Network },
      { title: "Notifications", url: "/agency?tab=notifications", icon: Bell },
    ],
  },
};

export function DashboardSidebar({
  className,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const isV0 = useIsV0();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, role, logout } = useAuth();

  const currentRole = role ?? "citizen";
  const nav = NAV[currentRole];

  // Display name: officer name for agency, first name for citizen
  const displayName =
    currentRole === "agency" && user?.officer
      ? user.officer
      : user?.name ?? "User";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <Sidebar {...props} className={cn("py-sides", className)} collapsible="icon">
      <SidebarHeader className="rounded-t-lg flex gap-3 flex-row items-center rounded-b-none justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex shrink-0 items-center justify-center rounded bg-primary size-11 text-primary-foreground">
            <Megaphone className="size-6" />
          </div>
          <div className="grid flex-1 text-left leading-tight group-data-[state=collapsed]:hidden">
            <span className="text-2xl font-display">ReportJe</span>
            <span className="text-xs uppercase text-muted-foreground truncate">
              {currentRole === "agency" ? (user?.agency ?? "Agency Console") : "Civic issues, one system"}
            </span>
          </div>
        </div>
        <SidebarTrigger className="group-data-[state=collapsed]:hidden" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <Bullet className="mr-2" />
            {nav.label}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.items.map((item) => {
                const tabQuery = searchParams.get("tab");
                const currentFullUrl = pathname + (tabQuery ? `?tab=${tabQuery}` : "");
                const isActive = currentFullUrl === item.url;
                return (
                  <SidebarMenuItem
                    key={item.title}
                    className={cn(
                      item.locked && "pointer-events-none opacity-50",
                      isV0 && item.locked && "pointer-events-none"
                    )}
                    data-disabled={item.locked}
                  >
                    <SidebarMenuButton
                      asChild={!item.locked}
                      isActive={isActive}
                      disabled={item.locked}
                      className={cn(
                        "disabled:cursor-not-allowed",
                        item.locked && "pointer-events-none"
                      )}
                    >
                      {item.locked ? (
                        <div className="flex items-center gap-3 w-full">
                          <item.icon className="size-5" />
                          <span>{item.title}</span>
                        </div>
                      ) : (
                        <Link href={item.url}>
                          <item.icon className="size-5" />
                          <span>{item.title}</span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                    {item.locked && (
                      <SidebarMenuBadge>
                        <LockIcon className="size-5 block" />
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-0">
        <SidebarGroup>
          <SidebarGroupLabel>
            <Bullet className="mr-2" />
            {currentRole === "citizen" ? "Account" : "Officer"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Popover>
                  <PopoverTrigger className="flex gap-0.5 w-full group cursor-pointer">
                    <div className="shrink-0 flex size-14 items-center justify-center rounded-lg bg-primary text-primary-foreground overflow-clip">
                      {user?.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={displayName}
                          width={120}
                          height={120}
                        />
                      ) : (
                        <span className="text-xl font-display">{displayName[0]}</span>
                      )}
                    </div>
                    <div className="group/item pl-3 pr-1.5 pt-2 pb-1.5 flex-1 flex bg-sidebar-accent hover:bg-sidebar-accent-active/75 items-center rounded group-data-[state=open]:bg-sidebar-accent-active">
                      <div className="grid flex-1 text-left leading-tight">
                        <span className="truncate text-xl font-display">
                          {displayName}
                        </span>
                        <span className="truncate text-xs uppercase text-muted-foreground group-hover/item:text-foreground">
                          {user?.email ?? ""}
                        </span>
                      </div>
                      <ChevronsUpDown className="ml-auto size-4" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-56 p-0"
                    side="top"
                    align="end"
                    sideOffset={4}
                  >
                    <div className="flex flex-col">
                      {/* Profile info */}
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm truncate">{user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        {currentRole === "agency" && user?.agency && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{user.agency}</p>
                        )}
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-accent">
                        <Settings className="h-4 w-4" />
                        Settings
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-accent text-destructive"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
