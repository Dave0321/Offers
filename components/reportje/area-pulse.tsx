"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { ISSUES } from "@/lib/reportje-data";

export default function AreaPulse({ area = "Kuala Lumpur" }: { area?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(timer);
  }, []);

  const open = ISSUES.filter(
    (i) => i.status !== "resolved" && i.status !== "rejected"
  ).length;
  const resolved = ISSUES.filter((i) => i.status === "resolved").length;

  return (
    <Card className="w-full relative overflow-hidden">
      <CardContent className="bg-primary text-primary-foreground flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm font-medium uppercase">
            <MapPin className="size-4" />
            {area}
          </div>
          <Badge className="bg-primary-foreground/15 text-primary-foreground border-transparent uppercase">
            Live
          </Badge>
        </div>

        <div className="text-4xl font-display leading-none" suppressHydrationWarning>
          {now
            ? now.toLocaleTimeString("en-MY", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "--:--"}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md bg-primary-foreground/10 p-2.5">
            <div className="text-2xl font-display leading-none">{open}</div>
            <div className="text-xs uppercase opacity-80 mt-1">Open in area</div>
          </div>
          <div className="rounded-md bg-primary-foreground/10 p-2.5">
            <div className="text-2xl font-display leading-none">{resolved}</div>
            <div className="text-xs uppercase opacity-80 mt-1">Resolved</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
