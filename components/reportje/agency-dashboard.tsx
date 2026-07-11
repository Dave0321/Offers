"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
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
import { CategoryIcon, StatusBadge, PriorityBadge, CategoryLabel } from "@/components/reportje/ui";
import {
  countByStatus,
  categoryBreakdown,
  REPORT_TRENDS,
  STATUS_META,
  STATUS_FLOW,
  formatRelative,
  type Issue,
  type IssueStatus,
  CATEGORY_META,
} from "@/lib/reportje-data";
import {
  MapPin,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Bell,
  TrendingUp,
  Layers,
  ArrowUp,
  Search,
  Send,
  X,
  ChevronRight,
  BarChart3,
  Activity,
  Target,
  Shield,
  BrainCircuit,
  Sparkles,
  Network,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import MobileNotifications from "@/components/dashboard/notifications/mobile-notifications";
import BellIcon from "@/components/icons/bell";
import { useAuth } from "@/lib/auth-context";
import { useIssues } from "@/lib/issue-context";
import { cn } from "@/lib/utils";
import Image from "next/image";
import StatusTracker from "@/components/reportje/status-tracker";
import CollaborationGraph from "@/components/reportje/collaboration-graph";

type Tab = "cases" | "analytics" | "collaboration" | "notifications";
type FilterStatus = "all" | IssueStatus;

const FILTERS: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "submitted", label: "New" },
  { value: "acknowledged", label: "Acknowledged" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

// ─── Creative Radial Progress ─────────────────────────────────────────────────
function RadialProgress({
  value,
  max,
  size = 80,
  strokeWidth = 7,
  color = "var(--primary)",
  label,
  sublabel,
}: {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label: string;
  sublabel?: string;
}) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circ * (1 - pct);
  const cx = size / 2;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={cx} cy={cx} r={r} stroke="var(--muted)" strokeWidth={strokeWidth} fill="none" />
          <circle
            cx={cx} cy={cx} r={r}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold leading-none">{value}</span>
        </div>
      </div>
      <span className="text-xs font-semibold text-center leading-tight">{label}</span>
      {sublabel && <span className="text-[10px] text-muted-foreground">{sublabel}</span>}
    </div>
  );
}

// ─── Creative Waveform Bar Chart ──────────────────────────────────────────────
function WaveBarChart({
  data,
  height = 120,
}: {
  data: { date: string; reported: number; resolved: number }[];
  height?: number;
}) {
  const max = Math.max(...data.flatMap((d) => [d.reported, d.resolved]), 1);
  const [hovered, setHovered] = React.useState<number | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-primary inline-block" /> Reported
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-emerald-500 inline-block" /> Resolved
        </span>
      </div>

      {/* Bars */}
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((d, i) => {
          const isHov = hovered === i;
          return (
            <div
              key={d.date}
              className="flex-1 flex flex-col items-center gap-0.5 cursor-pointer group"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Tooltip */}
              {isHov && (
                <div className="absolute -translate-y-full -translate-x-1/2 left-1/2 mb-2 bg-popover border border-border rounded-lg px-2.5 py-1.5 text-xs shadow-lg z-10 whitespace-nowrap pointer-events-none"
                  style={{ bottom: "100%" }}
                >
                  <div className="font-semibold">{d.date}</div>
                  <div className="text-primary">↑ {d.reported} reported</div>
                  <div className="text-emerald-500">✓ {d.resolved} resolved</div>
                </div>
              )}
              <div className="relative w-full flex flex-col justify-end gap-0.5" style={{ height: height - 20 }}>
                {/* Reported bar */}
                <div
                  className="w-full rounded-t-md transition-all duration-500"
                  style={{
                    height: `${(d.reported / max) * (height - 24)}px`,
                    background: isHov
                      ? "var(--primary)"
                      : "linear-gradient(180deg, var(--primary) 0%, oklch(0.52 0.16 255 / 0.5) 100%)",
                  }}
                />
              </div>
              {/* Resolved indicator dot */}
              <div
                className="rounded-sm transition-all"
                style={{
                  width: "100%",
                  height: `${(d.resolved / max) * (height - 24) * 0.5}px`,
                  background: isHov ? "rgb(16 185 129)" : "rgb(16 185 129 / 0.6)",
                  marginTop: 2,
                  borderRadius: "0 0 4px 4px",
                }}
              />
              <span className="text-[10px] text-muted-foreground mt-1">{d.date}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────
function DonutChart({
  data,
  size = 140,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
}) {
  const [hovered, setHovered] = React.useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = 55;
  const strokeW = 18;
  const circ = 2 * Math.PI * r;
  const cx = size / 2;

  let cumulative = 0;
  const segments = data.map((d, i) => {
    const pct = total > 0 ? d.value / total : 0;
    const dash = pct * circ;
    const gap = circ - dash;
    const offset = circ - cumulative * circ;
    cumulative += pct;
    return { ...d, dash, gap, offset, i };
  });

  const hov = hovered !== null ? data[hovered] : null;

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {total === 0 && (
            <circle cx={cx} cy={cx} r={r} stroke="var(--muted)" strokeWidth={strokeW} fill="none" />
          )}
          {segments.map((seg) => (
            <circle
              key={seg.i}
              cx={cx} cy={cx} r={r}
              stroke={seg.color}
              strokeWidth={hovered === seg.i ? strokeW + 3 : strokeW}
              fill="none"
              strokeLinecap="butt"
              strokeDasharray={`${seg.dash} ${seg.gap}`}
              strokeDashoffset={seg.offset}
              style={{ transition: "stroke-width 0.2s ease, stroke-dashoffset 1s ease" }}
              onMouseEnter={() => setHovered(seg.i)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          {hov ? (
            <>
              <span className="text-xl font-bold leading-none">{hov.value}</span>
              <span className="text-[10px] text-muted-foreground leading-tight text-center max-w-[60px]">{hov.label}</span>
            </>
          ) : (
            <>
              <span className="text-xl font-bold leading-none">{total}</span>
              <span className="text-[10px] text-muted-foreground">total</span>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {data.map((d, i) => (
          <div
            key={i}
            className={cn("flex items-center gap-2 text-sm cursor-pointer rounded px-1 py-0.5 transition-colors", hovered === i && "bg-accent")}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="size-3 rounded-sm shrink-0" style={{ background: d.color }} />
            <span className="text-muted-foreground flex-1">{d.label}</span>
            <span className="font-semibold tabular-nums">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Horizontal bar ───────────────────────────────────────────────────────────
function CategoryBar({
  label,
  value,
  max,
  color,
  icon,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  icon: React.ReactNode;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-accent text-primary text-xs">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm truncate">{label}</span>
          <span className="text-sm font-semibold tabular-nums text-muted-foreground">{value}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── KPI Tile ──────────────────────────────────────────────────────────────────
function KpiTile({
  label,
  value,
  suffix,
  icon: Icon,
  trend,
  color,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  icon: React.ElementType;
  trend?: string;
  color: string;
}) {
  return (
    <div className={cn("relative rounded-xl border border-border bg-card p-4 overflow-hidden group hover:shadow-md transition-shadow")}>
      <div className={cn("absolute top-0 right-0 size-20 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity", color)} />
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-3xl font-bold leading-none">{value}</span>
            {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
          </div>
          {trend && <p className="text-xs text-muted-foreground mt-1.5">{trend}</p>}
        </div>
        <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", color)}>
          <Icon className="size-4" />
        </div>
      </div>
    </div>
  );
}

// ─── Issue Card (grid card for Cases tab) ────────────────────────────────────
function IssueGridCard({
  issue,
  onClick,
}: {
  issue: Issue;
  onClick: () => void;
}) {
  const priorityColors: Record<string, string> = {
    urgent: "border-l-destructive",
    high: "border-l-warning",
    medium: "border-l-primary",
    low: "border-l-border",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-xl border border-border border-l-4 bg-card p-4 flex flex-col gap-3 transition-all hover:shadow-md hover:-translate-y-0.5 group",
        priorityColors[issue.priority]
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CategoryIcon category={issue.category} className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold leading-snug line-clamp-2 text-sm">{issue.title}</p>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{issue.id}</p>
          </div>
        </div>
        <ChevronRight className="size-4 text-muted-foreground shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Location */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="size-3 shrink-0" />
        <span className="truncate">{issue.location}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/60">
        <div className="flex items-center gap-2">
          <StatusBadge status={issue.status} />
          <PriorityBadge priority={issue.priority} />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ArrowUp className="size-3" />
          <span>{issue.upvotes}</span>
          <Clock className="size-3 ml-1" />
          <span>{formatRelative(issue.updatedAt)}</span>
        </div>
      </div>
    </button>
  );
}

// ─── Case Detail Slide-over ───────────────────────────────────────────────────
function CaseSlideOver({
  issue,
  onClose,
  onUpdate,
}: {
  issue: Issue;
  onClose: () => void;
  onUpdate: (id: string, status: IssueStatus, note: string) => void;
}) {
  const [nextStatus, setNextStatus] = React.useState<IssueStatus>(issue.status);
  const [note, setNote] = React.useState("");
  const canSubmit = nextStatus !== issue.status || note.trim().length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <p className="text-xs text-muted-foreground font-mono">CASE {issue.id}</p>
            <h2 className="font-bold text-lg leading-snug line-clamp-1">{issue.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={issue.status} />
            <button
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-lg hover:bg-accent transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-5 p-5">
          {/* Image */}
          {issue.image && (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border">
              <Image src={issue.image} alt={issue.title} fill className="object-cover" />
            </div>
          )}

          {/* Category + Description */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-primary font-medium">
              <CategoryIcon category={issue.category} className="size-4" />
              <CategoryLabel category={issue.category} />
            </div>
            {issue.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{issue.description}</p>
            )}
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Location", value: issue.location, icon: <MapPin className="size-3" /> },
              { label: "Reported by", value: `${issue.reportedBy} ${issue.reporterHandle}` },
              { label: "Reported", value: formatRelative(issue.createdAt), icon: <Clock className="size-3" /> },
              { label: "Upvotes", value: `${issue.upvotes}`, icon: <ArrowUp className="size-3" /> },
            ].map((m) => (
              <div key={m.label} className="rounded-lg bg-muted/50 p-3">
                <p className="text-[10px] uppercase text-muted-foreground tracking-wide font-medium mb-1">{m.label}</p>
                <p className="text-sm font-medium flex items-center gap-1">
                  {m.icon}{m.value}
                </p>
              </div>
            ))}
          </div>

          {/* Status tracker */}
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <StatusTracker status={issue.status} />
          </div>

          {/* Timeline */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Activity Log</p>
            <ol className="flex flex-col gap-3 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-border">
              {issue.timeline.slice().reverse().map((event, idx) => (
                <li key={idx} className="flex gap-3 pl-5 relative">
                  <span className="absolute left-0 top-1.5 size-3.5 rounded-full border-2 border-primary bg-card flex items-center justify-center shrink-0">
                    <span className="size-1.5 rounded-full bg-primary" />
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-semibold">{event.label}</p>
                    <p className="text-xs text-muted-foreground">{event.note}</p>
                    <p className="text-xs text-muted-foreground/60">{event.actor} · {formatRelative(event.date)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Respond panel */}
          {issue.status !== "resolved" && issue.status !== "rejected" ? (
            <div className="rounded-xl border border-border p-4 flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Respond to Citizen</p>
              <Select value={nextStatus} onValueChange={(v) => setNextStatus(v as IssueStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FLOW.map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>
                  ))}
                  <SelectItem value="rejected">Close / Reject</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add an update the reporter will see…"
                rows={3}
              />
              <Button
                disabled={!canSubmit}
                onClick={() => { onUpdate(issue.id, nextStatus, note.trim()); setNote(""); }}
                className="self-start"
              >
                <Send className="size-4" />
                Post update
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-success/30 bg-success/8 p-4 text-sm text-success">
              <CheckCircle2 className="size-4" />
              Case closed. No further action required.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Analytics Tab ─────────────────────────────────────────────────────────────
function AnalyticsTab({ issues }: { issues: Issue[] }) {
  const [period, setPeriod] = React.useState<"week" | "month" | "year">("week");
  const trendData = REPORT_TRENDS[period];
  const totals = countByStatus(issues);
  const categories = categoryBreakdown(issues).sort((a, b) => b.count - a.count);
  const maxCat = Math.max(...categories.map((c) => c.count), 1);

  const open = totals.submitted + totals.acknowledged + totals.in_progress;
  const resRate = issues.length > 0 ? Math.round((totals.resolved / issues.length) * 100) : 0;

  const donutData = [
    { label: "New", value: totals.submitted, color: "var(--chart-2)" },
    { label: "In Progress", value: totals.in_progress, color: "var(--chart-4)" },
    { label: "Resolved", value: totals.resolved, color: "oklch(0.62 0.14 155)" },
    { label: "Rejected", value: totals.rejected, color: "var(--chart-5)" },
  ].filter((d) => d.value > 0);

  const catColors = [
    "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"
  ];

  // Accumulative resolution area chart (simple SVG)
  const allTime = [
    { month: "Jan", reported: 210, resolved: 180 },
    { month: "Feb", reported: 240, resolved: 205 },
    { month: "Mar", reported: 300, resolved: 260 },
    { month: "Apr", reported: 280, resolved: 270 },
    { month: "May", reported: 320, resolved: 290 },
    { month: "Jun", reported: 360, resolved: 330 },
    { month: "Jul", reported: 89, resolved: 67 },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile label="Total Cases" value={issues.length} icon={FileText} color="bg-primary/10 text-primary" trend="All time assigned" />
        <KpiTile label="Open Cases" value={open} icon={AlertTriangle} color="bg-warning/15 text-warning" trend={`${totals.in_progress} in progress`} />
        <KpiTile label="Resolved" value={totals.resolved} icon={CheckCircle2} color="bg-emerald-500/15 text-emerald-600" trend="Successfully closed" />
        <KpiTile label="Resolution Rate" value={resRate} suffix="%" icon={Target} color="bg-primary/10 text-primary" trend="Based on current data" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Trend chart */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="size-4 text-muted-foreground" />
              <h3 className="font-semibold">Reported vs Resolved</h3>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
              {(["week", "month", "year"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-semibold uppercase transition-colors",
                    period === p ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <WaveBarChart data={trendData} height={160} />
        </div>

        {/* Right: Donut */}
        <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-muted-foreground" />
            <h3 className="font-semibold">Status Breakdown</h3>
          </div>
          <DonutChart data={donutData.length > 0 ? donutData : [{ label: "No data", value: 1, color: "var(--muted)" }]} size={150} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-muted-foreground" />
            <h3 className="font-semibold">Issues by Category</h3>
          </div>
          <div className="flex flex-col gap-3">
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data available.</p>
            ) : (
              categories.map((c, i) => (
                <CategoryBar
                  key={c.category}
                  label={CATEGORY_META[c.category as keyof typeof CATEGORY_META].label}
                  value={c.count}
                  max={maxCat}
                  color={catColors[i % catColors.length]}
                  icon={<CategoryIcon category={c.category as never} className="size-3.5" />}
                />
              ))
            )}
          </div>
        </div>

        {/* All-time trend */}
        <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-muted-foreground" />
            <h3 className="font-semibold">All-Time Performance</h3>
          </div>
          {/* SVG area chart */}
          <AllTimeAreaChart data={allTime} />

          {/* Radial stat row */}
          <div className="flex items-center justify-around pt-2 border-t border-border/60">
            <RadialProgress value={issues.length} max={30} color="var(--chart-1)" label="Assigned" sublabel="total" size={72} strokeWidth={6} />
            <RadialProgress value={totals.resolved} max={issues.length} color="oklch(0.62 0.14 155)" label="Resolved" sublabel="of assigned" size={72} strokeWidth={6} />
            <RadialProgress value={open} max={issues.length} color="var(--chart-4)" label="Open" sublabel="pending" size={72} strokeWidth={6} />
          </div>
        </div>
      </div>

      {/* AI Insight strip */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 flex items-start gap-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <BrainCircuit className="size-5" />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm">AI Insights</p>
            <Badge className="text-[10px] px-2 py-0.5">
              <Sparkles className="size-2.5 mr-1" />
              Auto-generated
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your agency has a <strong>{resRate}% resolution rate</strong> this cycle. Road & pothole issues have the highest volume — consider pre-allocating crew resources on Tuesdays and Thursdays, which historically see the highest incoming reports. {open > 3 ? `You currently have ${open} open cases requiring attention.` : "All priority cases are under control."}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── All-Time SVG Area Chart ──────────────────────────────────────────────────
function AllTimeAreaChart({ data }: { data: { month: string; reported: number; resolved: number }[] }) {
  const W = 320;
  const H = 100;
  const max = Math.max(...data.flatMap((d) => [d.reported, d.resolved]), 1);
  const pad = { top: 10, right: 8, bottom: 20, left: 8 };

  const xScale = (i: number) =>
    pad.left + (i / (data.length - 1)) * (W - pad.left - pad.right);
  const yScale = (v: number) =>
    H - pad.bottom - (v / max) * (H - pad.top - pad.bottom);

  const linePath = (key: "reported" | "resolved") =>
    data.map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(d[key])}`).join(" ");

  const areaPath = (key: "reported" | "resolved") => {
    const line = data.map((d, i) => `${i === 0 ? "M" : "L"} ${xScale(i)} ${yScale(d[key])}`).join(" ");
    return `${line} L ${xScale(data.length - 1)} ${H - pad.bottom} L ${xScale(0)} ${H - pad.bottom} Z`;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} className="overflow-visible">
      <defs>
        <linearGradient id="areaRep" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="areaRes" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.62 0.14 155)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="oklch(0.62 0.14 155)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map((t) => (
        <line key={t}
          x1={pad.left} y1={yScale(max * t)}
          x2={W - pad.right} y2={yScale(max * t)}
          stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4"
        />
      ))}
      {/* Areas */}
      <path d={areaPath("reported")} fill="url(#areaRep)" />
      <path d={areaPath("resolved")} fill="url(#areaRes)" />
      {/* Lines */}
      <path d={linePath("reported")} fill="none" stroke="var(--chart-1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={linePath("resolved")} fill="none" stroke="oklch(0.62 0.14 155)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* X labels */}
      {data.map((d, i) => (
        <text key={i} x={xScale(i)} y={H - 4} textAnchor="middle" fontSize="9" fill="var(--muted-foreground)">
          {d.month}
        </text>
      ))}
    </svg>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────
function NotificationsTab() {
  const { notifications, markAllNotificationsRead } = useIssues();
  const unread = notifications.filter((n) => !n.read).length;
  const typeColors: Record<string, string> = {
    success: "bg-emerald-500/15 text-emerald-600 border-emerald-200/50",
    warning: "bg-warning/15 text-warning border-warning/20",
    info: "bg-primary/10 text-primary border-primary/20",
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{unread} unread notification{unread !== 1 && "s"}</p>
        <Button variant="ghost" size="sm" className="text-xs" onClick={markAllNotificationsRead}>Mark all read</Button>
      </div>
      <div className="flex flex-col gap-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={cn(
              "flex gap-4 rounded-xl border p-4 transition-all",
              !n.read ? "bg-accent/40 border-border" : "bg-card border-transparent"
            )}
          >
            <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl border text-sm font-bold", typeColors[n.type])}>
              {n.priority === "high" ? "!" : n.type === "success" ? "✓" : "i"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-sm">{n.title}</p>
                {!n.read && <span className="size-2 rounded-full bg-primary shrink-0" />}
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.message}</p>
              <p className="text-xs text-muted-foreground/60 mt-2">{formatRelative(n.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AgencyDashboardView() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") as Tab) || "cases";

  const { issues: globalIssues, updateIssueStatus } = useIssues();
  const [filter, setFilter] = React.useState<FilterStatus>("all");
  const [query, setQuery] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  // Filter issues for agency view (in a real app this would filter by agency ID)
  const issues = globalIssues;

  const totals = countByStatus(issues);
  const open = totals.submitted + totals.acknowledged + totals.in_progress;
  const { notifications } = useIssues();
  const unreadNotif = notifications.filter((n) => !n.read).length;
  const agencyName = user?.agency ?? "Agency";

  const filtered = React.useMemo(() => {
    return issues
      .filter((i) => (filter === "all" ? true : i.status === filter))
      .filter((i) =>
        query.trim()
          ? (i.title + i.location + i.id).toLowerCase().includes(query.toLowerCase())
          : true
      )
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  }, [issues, filter, query]);

  const selected = selectedId ? issues.find((i) => i.id === selectedId) ?? null : null;

  function updateStatus(id: string, status: IssueStatus, note: string) {
    updateIssueStatus(id, status, note, user?.officer ?? "Agency Officer");
    setSelectedId(null);
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "cases", label: "Cases", icon: FileText, badge: open },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "collaboration", label: "Network", icon: Network },
    { id: "notifications", label: "Notifications", icon: Bell, badge: unreadNotif },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* ── Agency Header ── */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6">
        {/* Absolute Bell for Desktop/Full screen view */}
        <div className="hidden lg:block absolute top-6 right-6 z-20">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary" size="icon" className="relative rounded-full shadow-sm hover:shadow-md transition-shadow">
                {unreadNotif > 0 && (
                  <Badge className="absolute border-2 border-background -top-1 -left-2 h-5 w-5 text-xs p-0 flex items-center justify-center">
                    {unreadNotif > 9 ? "9+" : unreadNotif}
                  </Badge>
                )}
                <BellIcon className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent closeButton={true} side="right" className="w-[400px] sm:max-w-md p-0">
              <MobileNotifications initialNotifications={notifications} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Decorative gradient blob */}
        <div className="absolute -top-8 -right-8 size-40 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-4 -left-4 size-24 rounded-full bg-success/10 blur-xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Avatar */}
          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Shield className="size-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Agency Console</p>
              <Badge variant="outline" className="text-xs">{user?.area}</Badge>
            </div>
            <h1 className="text-2xl font-bold mt-0.5 leading-tight truncate">{agencyName}</h1>
            {user?.officer && (
              <p className="text-sm text-muted-foreground">Officer: {user.officer}</p>
            )}
          </div>
          {/* Quick stats */}
          <div className="flex items-center gap-4 shrink-0 lg:mr-12">
            <div className="text-center">
              <p className="text-2xl font-bold">{issues.length}</p>
              <p className="text-xs text-muted-foreground">Assigned</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">{open}</p>
              <p className="text-xs text-muted-foreground">Open</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-500">{totals.resolved}</p>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab Content ── */}
      {tab === "cases" && (
        <div className="flex flex-col gap-4">
          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by ID, title or location…"
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={cn(
                    "whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors shrink-0",
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

          {/* Results count */}
          <p className="text-xs text-muted-foreground">
            Showing {filtered.length} of {issues.length} cases
          </p>

          {/* Card grid */}
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-16 text-center">
              <FileText className="size-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No cases match your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((issue) => (
                <IssueGridCard
                  key={issue.id}
                  issue={issue}
                  onClick={() => setSelectedId(issue.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "analytics" && <AnalyticsTab issues={issues} />}
      {tab === "collaboration" && <CollaborationGraph />}
      {tab === "notifications" && <NotificationsTab />}

      {/* Case slide-over */}
      {selected && (
        <CaseSlideOver
          key={selected.id}
          issue={selected}
          onClose={() => setSelectedId(null)}
          onUpdate={updateStatus}
        />
      )}
    </div>
  );
}
