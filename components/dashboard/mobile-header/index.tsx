"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Megaphone } from "lucide-react";
import MobileNotifications from "@/components/dashboard/notifications/mobile-notifications";
import BellIcon from "@/components/icons/bell";
import { NOTIFICATIONS } from "@/lib/reportje-data";
import type { Notification } from "@/types/dashboard";

export function MobileHeader() {
  const notifications = NOTIFICATIONS as Notification[];
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="lg:hidden h-header-mobile sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Sidebar Menu */}
        <SidebarTrigger />

        {/* Center: ReportJe wordmark */}
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 bg-primary rounded flex items-center justify-center">
            <Megaphone className="size-4 text-primary-foreground" />
          </div>
          <span className="text-xl font-display">ReportJe</span>
        </Link>

        <Sheet>
          {/* Right: Notifications Menu */}
          <SheetTrigger asChild>
            <Button variant="secondary" size="icon" className="relative">
              {unreadCount > 0 && (
                <Badge className="absolute border-2 border-background -top-1 -left-2 h-5 w-5 text-xs p-0 flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
              <BellIcon className="size-4" />
            </Button>
          </SheetTrigger>

          {/* Notifications Sheet */}
          <SheetContent
            closeButton={false}
            side="right"
            className="w-[80%] max-w-md p-0"
          >
            <MobileNotifications initialNotifications={notifications} />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
