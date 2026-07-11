"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bullet } from "@/components/ui/bullet";
import AreaPulse from "@/components/reportje/area-pulse";
import Notifications from "@/components/dashboard/notifications";
import { useRole } from "@/lib/role-context";
import { NOTIFICATIONS, getAgencyIssues } from "@/lib/reportje-data";
import { FilePlus2, Timer, TriangleAlert } from "lucide-react";
import type { Notification } from "@/types/dashboard";

function CitizenCta() {
  return (
    <Card className="w-full">
      <CardContent className="bg-card flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2 text-sm font-medium uppercase">
          <Bullet />
          Spotted a problem?
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Report it once. We route it to the right local agency automatically.
        </p>
        <Button asChild size="lg" className="w-full">
          <Link href="/report">
            <FilePlus2 className="size-4" />
            Report an Issue
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function AgencyCta() {
  const issues = getAgencyIssues();
  const urgent = issues.filter((i) => i.priority === "urgent").length;
  const awaiting = issues.filter((i) => i.status === "submitted").length;

  return (
    <Card className="w-full">
      <CardContent className="bg-card flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2 text-sm font-medium uppercase">
          <Bullet variant="warning" />
          Needs attention
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between rounded-md bg-destructive/10 text-destructive px-3 py-2">
            <span className="flex items-center gap-2 text-sm font-medium">
              <TriangleAlert className="size-4" /> Urgent cases
            </span>
            <span className="font-display text-lg leading-none">{urgent}</span>
          </div>
          <div className="flex items-center justify-between rounded-md bg-warning/10 text-warning px-3 py-2">
            <span className="flex items-center gap-2 text-sm font-medium">
              <Timer className="size-4" /> Awaiting triage
            </span>
            <span className="font-display text-lg leading-none">{awaiting}</span>
          </div>
        </div>
        <Button asChild size="lg" variant="outline" className="w-full">
          <Link href="/agency">Open Command Center</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function RightRail() {
  const { role } = useRole();

  return (
    <div className="space-y-gap py-sides min-h-screen max-h-screen sticky top-0 overflow-y-auto no-scrollbar">
      {role === "citizen" ? <CitizenCta /> : <AgencyCta />}
      <AreaPulse />
      <Notifications initialNotifications={NOTIFICATIONS as Notification[]} />
    </div>
  );
}
