"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import MobileNotifications from "@/components/dashboard/notifications/mobile-notifications";
import BellIcon from "@/components/icons/bell";
import { useIssues } from "@/lib/issue-context";

export function DesktopHeader() {
  const { notifications } = useIssues();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="hidden lg:flex items-center justify-end px-6 py-4 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="secondary" size="icon" className="relative rounded-full">
            {unreadCount > 0 && (
              <Badge className="absolute border-2 border-background -top-1 -left-2 h-5 w-5 text-xs p-0 flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
            <BellIcon className="size-5" />
          </Button>
        </SheetTrigger>

        <SheetContent
          closeButton={true}
          side="right"
          className="w-[400px] sm:max-w-md p-0"
        >
          <MobileNotifications initialNotifications={notifications} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
