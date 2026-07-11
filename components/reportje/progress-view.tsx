"use client";

import * as React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CategoryIcon, StatusBadge, PriorityBadge } from "@/components/reportje/ui";
import StatusTracker from "@/components/reportje/status-tracker";
import {
  formatRelative,
  type Issue,
  type IssueStatus,
} from "@/lib/reportje-data";
import { MapPin, Building2, ChevronDown, ArrowBigUp } from "lucide-react";

type Filter = "all" | "open" | "resolved";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Active" },
  { value: "resolved", label: "Resolved" },
];

const OPEN_STATUSES: IssueStatus[] = ["submitted", "acknowledged", "in_progress"];

function ProgressItem({ issue }: { issue: Issue }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Card className="w-full">
      <CardContent className="bg-card p-0 overflow-hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-start gap-3 p-4 text-left"
          aria-expanded={open}
        >
          {issue.image ? (
            <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-muted">
              <Image
                src={issue.image || "/placeholder.svg"}
                alt={issue.title}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex size-16 shrink-0 items-center justify-center rounded-md bg-accent text-primary">
              <CategoryIcon category={issue.category} className="size-7" />
            </div>
          )}

          <div className="flex flex-1 flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {issue.id}
              </span>
              <StatusBadge status={issue.status} />
            </div>
            <h3 className="font-display text-lg leading-tight text-pretty">
              {issue.title}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" /> {issue.location}
              </span>
              <span>Updated {formatRelative(issue.updatedAt)}</span>
            </div>
          </div>

          <ChevronDown
            className={cn(
              "size-5 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
          />
        </button>

        {/* Status tracker always visible */}
        <div className="px-4 pb-4">
          <StatusTracker status={issue.status} />
        </div>

        {open && (
          <div className="border-t border-border bg-muted/40 p-4 flex flex-col gap-4">
            {issue.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {issue.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <PriorityBadge priority={issue.priority} />
              <Badge variant="secondary" className="uppercase gap-1">
                <ArrowBigUp className="size-3.5" /> {issue.upvotes} upvotes
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Building2 className="size-3.5" /> {issue.agency}
              </Badge>
            </div>

            <div>
              <div className="text-xs uppercase text-muted-foreground mb-3">
                Activity timeline
              </div>
              <ol className="relative flex flex-col gap-4 border-l-2 border-border pl-5">
                {[...issue.timeline].reverse().map((event, i) => (
                  <li key={i} className="relative">
                    <span
                      className={cn(
                        "absolute -left-[27px] top-1 size-3 rounded-full ring-4 ring-background",
                        i === 0 ? "bg-primary" : "bg-border"
                      )}
                    />
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span className="text-sm">{event.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelative(event.date)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-snug mt-0.5">
                      {event.note}
                    </p>
                    <span className="text-xs text-muted-foreground/70">
                      — {event.actor}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProgressView({ issues }: { issues: Issue[] }) {
  const [filter, setFilter] = React.useState<Filter>("all");

  const filtered = issues.filter((i) => {
    if (filter === "open") return OPEN_STATUSES.includes(i.status);
    if (filter === "resolved") return i.status === "resolved";
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1 w-full sm:max-w-sm">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-md px-3 py-2 text-sm uppercase transition-colors",
              filter === f.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card py-16 text-center">
            <p className="text-muted-foreground">No reports in this view.</p>
          </div>
        ) : (
          filtered
            .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
            .map((issue) => <ProgressItem key={issue.id} issue={issue} />)
        )}
      </div>
    </div>
  );
}
