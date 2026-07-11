"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bullet } from "@/components/ui/bullet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CATEGORY_ICONS } from "@/components/reportje/ui";
import StatusTracker from "@/components/reportje/status-tracker";
import { useIssues } from "@/lib/issue-context";
import { useAuth } from "@/lib/auth-context";
import {
  CATEGORY_META,
  AGENCIES,
  suggestAgency,
  type IssueCategory,
  type IssuePriority,
} from "@/lib/reportje-data";
import {
  Building2,
  Camera,
  CheckCircle2,
  MapPin,
  ListChecks,
  X,
  BrainCircuit,
  Sparkles,
  Shield,
} from "lucide-react";

const CATEGORIES = Object.keys(CATEGORY_META) as IssueCategory[];
const AREAS = Array.from(new Set(AGENCIES.map((a) => a.area)));
const PRIORITIES: { value: IssuePriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

// ─── AI Loading Overlay ──────────────────────────────────────────────────────
function AILoadingOverlay() {
  const [step, setStep] = React.useState(0);
  const steps = [
    "Scanning report content…",
    "Classifying issue category…",
    "Identifying responsible agency…",
    "Routing via AI analysis…",
  ];

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s < steps.length - 1 ? s + 1 : s));
    }, 380);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md">
      <div className="flex flex-col items-center gap-6 p-8 max-w-sm w-full text-center">
        {/* Animated rings */}
        <div className="relative flex items-center justify-center">
          <div className="absolute size-24 rounded-full border-2 border-primary/20 animate-ping" style={{ animationDuration: "1.5s" }} />
          <div className="absolute size-20 rounded-full border-2 border-primary/30 animate-ping" style={{ animationDuration: "1s", animationDelay: "0.2s" }} />
          <div className="relative flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <BrainCircuit className="size-8 animate-pulse" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-lg font-semibold">AI Analysis in Progress</p>
          <div className="h-5 overflow-hidden">
            <p key={step} className="text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-1 duration-300">
              {steps[step]}
            </p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── AI Success Popup ─────────────────────────────────────────────────────────
function AISuccessPopup({
  agency,
  trackingId,
  onDismiss,
}: {
  agency: string;
  trackingId: string;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-md p-4">
      <div
        className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300"
      >
        {/* Decorative top gradient */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-success to-primary opacity-80" />

        <div className="flex flex-col items-center gap-5 p-8 text-center">
          {/* Success icon */}
          <div className="relative">
            <div className="flex size-20 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="size-10 text-success animate-in zoom-in duration-500 delay-150" />
            </div>
            <div className="absolute -top-1 -right-1 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
              <Sparkles className="size-3.5" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold">Report Successfully Sent!</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your report has been analysed and routed to
            </p>
            <div className="flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 mt-1">
              <Building2 className="size-4 text-primary shrink-0" />
              <span className="font-semibold text-sm text-primary text-center leading-snug">{agency}</span>
            </div>
          </div>

          {/* AI badge */}
          <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-xs text-primary">
            <BrainCircuit className="size-3.5" />
            <span>Routed via AI-powered issue classification</span>
          </div>

          {/* Tracking ID */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted px-5 py-3 w-full">
            <Shield className="size-4 text-muted-foreground shrink-0" />
            <div className="flex flex-col items-start">
              <span className="text-xs uppercase text-muted-foreground tracking-wider">Tracking ID</span>
              <span className="font-display text-xl font-bold tracking-wide">{trackingId}</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            The agency will review and update your report. You can track the progress anytime.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button asChild className="flex-1">
              <Link href="/progress">
                <ListChecks className="size-4" /> Track progress
              </Link>
            </Button>
            <Button variant="outline" className="flex-1" onClick={onDismiss}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReportForm() {
  const params = useSearchParams();
  const initialCategory = params.get("category") as IssueCategory | null;

  const [category, setCategory] = React.useState<IssueCategory>(
    initialCategory && CATEGORIES.includes(initialCategory)
      ? initialCategory
      : "road"
  );
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [area, setArea] = React.useState(AREAS[0]);
  const [priority, setPriority] = React.useState<IssuePriority>("medium");
  const [photo, setPhoto] = React.useState<string | null>(null);
  const [phase, setPhase] = React.useState<"form" | "loading" | "popup" | "done">("form");
  const [trackingId, setTrackingId] = React.useState("");

  const agency = suggestAgency(category, area);
  const canSubmit = title.trim().length > 3 && location.trim().length > 2;

  const { addIssue } = useIssues();
  const { user } = useAuth();

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPhoto(URL.createObjectURL(file));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const id = `RPJ-${Math.floor(2100 + Math.random() * 800)}`;
    setTrackingId(id);
    setPhase("loading");
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // Add to global state for demo
    const newIssue = {
      id,
      title,
      description,
      category,
      status: "submitted" as const,
      priority,
      location,
      lat: 3.15,
      lng: 101.71,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reportedBy: user?.name ?? "Citizen",
      reporterHandle: user?.email ? `@${user.email.split("@")[0]}` : "@citizen",
      upvotes: 1,
      image: photo || undefined,
      timeline: [
        {
          status: "submitted" as const,
          label: "Report submitted",
          note: `Routed to ${agency} for assessment.`,
          actor: "System",
          date: new Date().toISOString(),
        }
      ]
    };
    addIssue(newIssue);

    // After 1.8s show the AI success popup
    setTimeout(() => setPhase("popup"), 1800);
  };

  if (phase === "done") {
    return (
      <Card className="w-full">
        <CardContent className="bg-card flex flex-col items-center gap-6 p-8 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="size-9" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-display">Report submitted</h2>
            <p className="text-muted-foreground max-w-md text-pretty">
              Your report has been routed to{" "}
              <span className="text-foreground font-medium">{agency}</span>.
              We&apos;ll notify you as it progresses.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-4 py-2.5">
            <span className="text-xs uppercase text-muted-foreground">
              Tracking ID
            </span>
            <span className="font-display text-xl">{trackingId}</span>
          </div>
          <div className="w-full max-w-md rounded-lg border border-border bg-muted/50 p-4">
            <StatusTracker status="submitted" />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
            <Button asChild className="flex-1">
              <Link href="/progress">
                <ListChecks className="size-4" /> Track progress
              </Link>
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setPhase("form");
                setTitle("");
                setDescription("");
                setLocation("");
                setPhoto(null);
              }}
            >
              Report another
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }


  return (
    <>
      {/* AI Loading Overlay */}
      {phase === "loading" && <AILoadingOverlay />}

      {/* AI Success Popup */}
      {phase === "popup" && (
        <AISuccessPopup
          agency={agency}
          trackingId={trackingId}
          onDismiss={() => setPhase("done")}
        />
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Category */}
      <Card className="w-full">
        <CardContent className="bg-card flex flex-col gap-4 p-4 md:p-6">
          <div className="flex items-center gap-2 text-sm font-medium uppercase">
            <Bullet /> 1. What kind of issue?
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat];
              const active = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors",
                    active
                      ? "border-primary bg-accent ring-2 ring-primary/30"
                      : "border-border bg-card hover:border-primary/50"
                  )}
                  aria-pressed={active}
                >
                  <div
                    className={cn(
                      "flex size-9 items-center justify-center rounded-md",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent text-primary"
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  <span className="text-sm font-medium leading-tight">
                    {CATEGORY_META[cat].label}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card className="w-full">
        <CardContent className="bg-card flex flex-col gap-5 p-4 md:p-6">
          <div className="flex items-center gap-2 text-sm font-medium uppercase">
            <Bullet /> 2. Describe the problem
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g. Deep pothole near the LRT exit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Give the agency helpful details: how big, how long, any danger to the public…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="location">Exact location</Label>
              <Input
                id="location"
                placeholder="Street, landmark or coordinates"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Council / district</Label>
              <Select value={area} onValueChange={setArea}>
                <SelectTrigger>
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  {AREAS.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Priority</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm font-medium uppercase transition-colors",
                    priority === p.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/50"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo */}
      <Card className="w-full">
        <CardContent className="bg-card flex flex-col gap-4 p-4 md:p-6">
          <div className="flex items-center gap-2 text-sm font-medium uppercase">
            <Bullet /> 3. Add a photo (optional)
          </div>
          {photo ? (
            <div className="relative overflow-hidden rounded-lg border border-border">
              <Image
                src={photo || "/placeholder.svg"}
                alt="Uploaded evidence preview"
                width={800}
                height={400}
                className="h-56 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setPhoto(null)}
                className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow"
                aria-label="Remove photo"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/40 py-10 text-center transition-colors hover:border-primary hover:bg-accent">
              <Camera className="size-7 text-muted-foreground" />
              <span className="text-sm font-medium">Tap to add a photo</span>
              <span className="text-xs text-muted-foreground">
                A clear photo helps agencies act faster
              </span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handlePhoto}
              />
            </label>
          )}
        </CardContent>
      </Card>

      {/* Routing summary + submit */}
      <Card className="w-full">
        <CardContent className="bg-card flex flex-col gap-4 p-4 md:p-6">
          <div className="flex items-start gap-3 rounded-lg bg-accent p-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Building2 className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs uppercase text-muted-foreground">
                Auto-routed to
              </div>
              <div className="font-medium text-pretty">{agency}</div>
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3.5" /> {area}
                <Badge variant="secondary" className="ml-2 uppercase">
                  {CATEGORY_META[category].label}
                </Badge>
              </div>
            </div>
          </div>
          <Button type="submit" size="xl" disabled={!canSubmit} className="w-full">
            Submit report
          </Button>
          {!canSubmit && (
            <p className="text-center text-xs text-muted-foreground">
              Add a title and location to submit.
            </p>
          )}
        </CardContent>
      </Card>
    </form>
    </>
  );
}
