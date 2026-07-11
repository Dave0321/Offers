"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Search, MapPin, ArrowUp, Send, CheckCircle2, X } from "lucide-react";
import DashboardCard from "@/components/dashboard/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Bullet from "@/components/ui/bullet";
import { cn } from "@/lib/utils";
import {
  getAgencyIssues,
  STATUS_META,
  STATUS_FLOW,
  formatRelative,
  type Issue,
  type IssueStatus,
} from "@/lib/reportje-data";
import {
  CategoryIcon,
  StatusBadge,
  PriorityBadge,
  CategoryLabel,
} from "@/components/reportje/ui";
import StatusTracker from "@/components/reportje/status-tracker";

type FilterStatus = "all" | IssueStatus;

const FILTERS: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "submitted", label: "New" },
  { value: "acknowledged", label: "Acknowledged" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

export default function AgencyConsole() {
  const [issues, setIssues] = useState<Issue[]>(() =>
    getAgencyIssues().map((i) => ({ ...i, timeline: [...i.timeline] }))
  );
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(
    () => getAgencyIssues()[0]?.id ?? null
  );

  const filtered = useMemo(() => {
    return issues
      .filter((i) => (filter === "all" ? true : i.status === filter))
      .filter((i) =>
        query.trim()
          ? (i.title + i.location + i.id)
              .toLowerCase()
              .includes(query.toLowerCase())
          : true
      )
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  }, [issues, filter, query]);

  const selected = issues.find((i) => i.id === selectedId) ?? null;

  function updateStatus(id: string, status: IssueStatus, note: string) {
    setIssues((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              status,
              updatedAt: new Date().toISOString(),
              timeline: [
                ...i.timeline,
                {
                  status,
                  label: `Marked ${STATUS_META[status].label}`,
                  note: note || `Status updated to ${STATUS_META[status].label}.`,
                  actor: "DBKL Ops",
                  date: new Date().toISOString(),
                },
              ],
            }
          : i
      )
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {/* Queue */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <DashboardCard
          title="TRIAGE QUEUE"
          intent="default"
          addon={
            <span className="text-xs text-muted-foreground">
              {filtered.length} cases
            </span>
          }
        >
          <div className="p-3 flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by ID, title, location"
                className="pl-8"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    filter === f.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-accent"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-px bg-border max-h-[560px] overflow-y-auto">
            {filtered.map((issue) => {
              const isSel = issue.id === selectedId;
              return (
                <button
                  key={issue.id}
                  onClick={() => setSelectedId(issue.id)}
                  className={cn(
                    "flex flex-col gap-2 bg-card p-3 text-left transition-colors hover:bg-accent/60",
                    isSel && "bg-accent"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <CategoryIcon category={issue.category} className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold leading-tight">
                          {issue.title}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {issue.id}
                        </p>
                      </div>
                    </div>
                    <PriorityBadge priority={issue.priority} />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                      <MapPin className="size-3 shrink-0" />
                      <span className="truncate">{issue.location}</span>
                    </span>
                    <StatusBadge status={issue.status} />
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="bg-card p-8 text-center text-sm text-muted-foreground">
                No cases match your filters.
              </div>
            )}
          </div>
        </DashboardCard>
      </div>

      {/* Detail */}
      <div className="lg:col-span-3">
        {selected ? (
          <CaseDetail
            key={selected.id}
            issue={selected}
            onUpdate={updateStatus}
          />
        ) : (
          <DashboardCard title="CASE DETAIL" intent="default">
            <div className="p-8 text-center text-sm text-muted-foreground">
              Select a case from the queue to review and respond.
            </div>
          </DashboardCard>
        )}
      </div>
    </div>
  );
}

function CaseDetail({
  issue,
  onUpdate,
}: {
  issue: Issue;
  onUpdate: (id: string, status: IssueStatus, note: string) => void;
}) {
  const [nextStatus, setNextStatus] = useState<IssueStatus>(issue.status);
  const [note, setNote] = useState("");

  const canSubmit = nextStatus !== issue.status || note.trim().length > 0;

  return (
    <DashboardCard
      title={`CASE ${issue.id}`}
      intent="default"
      addon={<StatusBadge status={issue.status} />}
    >
      <div className="flex flex-col gap-5 p-4">
        {issue.image && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
            <Image
              src={issue.image || "/placeholder.svg"}
              alt={issue.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-primary font-medium">
            <CategoryIcon category={issue.category} className="size-4" />
            <CategoryLabel category={issue.category} />
          </div>
          <h3 className="text-lg font-semibold leading-snug text-balance">
            {issue.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {issue.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <Meta label="Location" value={issue.location} icon={<MapPin className="size-3.5" />} />
          <Meta label="Reported by" value={`${issue.reportedBy} ${issue.reporterHandle}`} />
          <Meta label="Reported" value={formatRelative(issue.createdAt)} />
          <Meta
            label="Community upvotes"
            value={`${issue.upvotes}`}
            icon={<ArrowUp className="size-3.5" />}
          />
        </div>

        <div className="rounded-lg border border-border bg-muted/40 p-4">
          <StatusTracker status={issue.status} />
        </div>

        {/* Timeline */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Activity log
          </p>
          <ol className="flex flex-col gap-3">
            {issue.timeline
              .slice()
              .reverse()
              .map((event, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="mt-1 flex size-2 shrink-0 rounded-full bg-primary" />
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium">{event.label}</p>
                    <p className="text-sm text-muted-foreground">{event.note}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.actor} · {formatRelative(event.date)}
                    </p>
                  </div>
                </li>
              ))}
          </ol>
        </div>

        {/* Respond */}
        {issue.status !== "resolved" && issue.status !== "rejected" ? (
          <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
            <div className="flex items-center gap-2">
              <Bullet />
              <p className="text-xs font-semibold uppercase">Respond to citizen</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Select
                value={nextStatus}
                onValueChange={(v) => setNextStatus(v as IssueStatus)}
              >
                <SelectTrigger className="sm:w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FLOW.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_META[s].label}
                    </SelectItem>
                  ))}
                  <SelectItem value="rejected">Close / Reject</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add an update the reporter will see (e.g. crew dispatched, ETA 2 days)…"
              rows={3}
            />
            <Button
              disabled={!canSubmit}
              onClick={() => {
                onUpdate(issue.id, nextStatus, note.trim());
                setNote("");
              }}
              className="self-start"
            >
              <Send className="size-4" />
              Post update
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-success/40 bg-success/10 p-4 text-sm text-success">
            {issue.status === "resolved" ? (
              <CheckCircle2 className="size-4" />
            ) : (
              <X className="size-4" />
            )}
            This case is closed. No further action required.
          </div>
        )}
      </div>
    </DashboardCard>
  );
}

function Meta({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs uppercase text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1.5 font-medium">
        {icon}
        {value}
      </span>
    </div>
  );
}
