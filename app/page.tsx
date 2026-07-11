"use client";

import Link from "next/link";
import IssueCard from "@/components/reportje/issue-card";
import AiQuickReport from "@/components/reportje/ai-quick-report";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryIcon } from "@/components/reportje/ui";
import { useIssues } from "@/lib/issue-context";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import MobileNotifications from "@/components/dashboard/notifications/mobile-notifications";
import BellIcon from "@/components/icons/bell";
import {
  FileText,
  CheckCircle2,
  Timer,
  ArrowRight,
  Sparkles,
  BrainCircuit,
  MapPin,
  TrendingUp,
} from "lucide-react";
import {
  countByStatus,
  ISSUES,
  CATEGORY_META,
  categoryBreakdown,
  type IssueCategory,
} from "@/lib/reportje-data";

// ─── Stat Card Component ──────────────────────────────────────────────────────
function StatCard({
  title,
  value,
  icon: Icon,
  colorClass,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 group transition-all hover:shadow-md">
      <div className={`absolute -right-4 -top-4 size-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity ${colorClass.split(" ")[0]}`} />
      <div className="flex flex-col gap-3 relative z-10">
        <div className={`flex size-10 items-center justify-center rounded-xl ${colorClass}`}>
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-3xl font-bold leading-tight">{value}</p>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Quick Report Button ──────────────────────────────────────────────────────
function QuickReportButton({ category, label, blurb }: { category: IssueCategory; label: string; blurb: string }) {
  return (
    <Link href={`/report?category=${category}`} className="flex-1 flex flex-col items-start gap-3 rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md group">
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
        <CategoryIcon category={category} className="size-6" />
      </div>
      <div>
        <p className="font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{blurb}</p>
      </div>
    </Link>
  );
}

export default function CitizenDashboard() {
  const { issues, notifications } = useIssues();
  const unreadCount = notifications.filter((n) => !n.read).length;
  
  // For the demo, we assume all issues in context are relevant to the user/community.
  const counts = countByStatus(issues);
  const open = counts.submitted + counts.acknowledged + counts.in_progress;
  const resolved = counts.resolved;
  
  // Recent reports (non-scrollable, just taking the top 3)
  const recent = [...issues]
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    .slice(0, 3);

  // Area breakdown stats (using ISSUES baseline for variety, or we could use live issues)
  const breakdown = categoryBreakdown(issues).sort((a, b) => b.count - a.count);
  const maxCount = Math.max(...breakdown.map((b) => b.count), 1);
  const totalAreaIssues = breakdown.reduce((sum, b) => sum + b.count, 0);

  const stats = [
    { title: "Open Reports", value: open, icon: FileText, colorClass: "bg-warning text-warning-foreground" },
    { title: "Resolved", value: resolved, icon: CheckCircle2, colorClass: "bg-success text-success-foreground" },
    { title: "Avg Response", value: "31h", icon: Timer, colorClass: "bg-primary text-primary-foreground" },
  ];

  return (
    <div className="flex flex-col w-full gap-6 lg:gap-8 px-4 lg:px-6 py-6 md:py-8 max-w-7xl mx-auto relative">
      
      {/* ─── Hero Section ─── */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 sm:p-10">
        {/* Absolute Bell for Desktop/Full screen view */}
        <div className="hidden lg:block absolute top-6 right-6 z-20">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary" size="icon" className="relative rounded-full shadow-sm hover:shadow-md transition-shadow">
                {unreadCount > 0 && (
                  <Badge className="absolute border-2 border-background -top-1 -left-2 h-5 w-5 text-xs p-0 flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
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

        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between mt-4 lg:mt-0">
          <div className="flex flex-col gap-3 max-w-xl">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Make your community better.</h1>
            <p className="text-muted-foreground text-lg">Report civic issues easily. We use AI to instantly route your reports to the right local agency.</p>
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              {/* THE NEW AI QUICK REPORT BUTTON */}
              <AiQuickReport />
              
              <Button asChild size="lg" variant="outline" className="rounded-full px-6 py-6 border-2 font-semibold hover:bg-accent w-full sm:w-auto">
                <Link href="/report">Standard Report</Link>
              </Button>
            </div>
          </div>

          
          <div className="hidden md:flex flex-col gap-2 p-5 rounded-2xl bg-muted/50 border border-border/50 max-w-xs shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="size-4 text-primary" />
              <p className="text-sm font-semibold">Community Impact</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Citizens in your area have reported <strong className="text-foreground">{totalAreaIssues} issues</strong> this month. Thank you for helping keep the neighborhood safe!
            </p>
          </div>
        </div>
      </div>

      {/* ─── Quick Actions ─── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="size-5 text-muted-foreground" /> Common Issues
          </h2>
          <Link href="/report" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
            See all categories <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickReportButton category="road" label="Road & Pothole" blurb="Damaged roads, potholes" />
          <QuickReportButton category="streetlight" label="Streetlight" blurb="Broken or flickering" />
          <QuickReportButton category="drainage" label="Drainage" blurb="Clogged drains, floods" />
          <QuickReportButton category="tree" label="Fallen Tree" blurb="Dangerous branches" />
        </div>
      </div>

      {/* ─── Two Column Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Left Column: Stats & Recent Reports (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6 lg:gap-8">
          
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((s, i) => <StatCard key={i} {...s} />)}
          </div>

          {/* AI Insights Card */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <BrainCircuit className="size-5" />
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="font-semibold text-sm flex items-center gap-2">
                AI Neighborhood Insights
                <Badge variant="outline" className="text-[10px] border-primary/30 text-primary uppercase">Auto-generated</Badge>
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Most streetlight issues in your area are currently being resolved within <strong>48 hours</strong> by TNB. 
                Your recent report for <strong>Jalan Ampang</strong> has been prioritized due to multiple community reports.
              </p>
            </div>
          </div>

          {/* Recent Reports */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="size-5 text-muted-foreground" /> My Recent Reports
              </h2>
              <Badge variant="secondary" className="font-mono">{issues.length} Total</Badge>
            </div>
            
            {/* Non-scrollable list of max 3 items */}
            <div className="flex flex-col gap-3">
              {recent.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border py-12 text-center bg-card">
                  <p className="text-sm text-muted-foreground">You haven&apos;t reported anything yet.</p>
                  <Button asChild variant="link" className="mt-2">
                    <Link href="/report">Make your first report</Link>
                  </Button>
                </div>
              ) : (
                recent.map((issue) => (
                  <div key={issue.id} className="transition-transform hover:-translate-y-0.5">
                    <IssueCard issue={issue} />
                  </div>
                ))
              )}
            </div>

            {/* View All Button */}
            {issues.length > 3 && (
              <Button asChild variant="outline" className="w-full mt-2 rounded-xl border-dashed">
                <Link href="/progress">View all {issues.length} reports</Link>
              </Button>
            )}
          </div>
          
        </div>

        {/* Right Column: Area Breakdown (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="rounded-3xl border border-border bg-card p-6 flex flex-col gap-6 h-full">
            <div className="flex flex-col gap-1 border-b border-border pb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <MapPin className="size-5 text-muted-foreground" /> Kuala Lumpur
              </h3>
              <p className="text-sm text-muted-foreground">Top reported issues around you</p>
            </div>
            
            <div className="flex flex-col gap-5 flex-1">
              {breakdown.slice(0, 6).map((row, i) => {
                const colors = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5", "bg-primary"];
                const color = colors[i % colors.length];
                return (
                  <div key={row.category} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium flex items-center gap-2">
                        <CategoryIcon category={row.category as IssueCategory} className="size-4 text-muted-foreground" />
                        {CATEGORY_META[row.category as keyof typeof CATEGORY_META].label}
                      </span>
                      <span className="font-semibold">{row.count}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
                        style={{ width: `${(row.count / maxCount) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            <Button variant="outline" className="w-full mt-4 rounded-xl">View Area Map</Button>
          </div>
        </div>

      </div>
    </div>
  );
}
