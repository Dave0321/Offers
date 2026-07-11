"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useIssues } from "@/lib/issue-context";
import { useAuth } from "@/lib/auth-context";
import type { Issue } from "@/lib/reportje-data";
import {
  BrainCircuit,
  Camera,
  MapPin,
  Sparkles,
  Upload,
  CheckCircle2,
  X,
  Target,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Portal Modal (renders directly into document.body) ──────────────────────
function ModalPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

export default function AiQuickReport() {
  const [open, setOpen] = React.useState(false);
  const [phase, setPhase] = React.useState<"idle" | "upload" | "analyzing" | "success">("idle");
  const [loadingText, setLoadingText] = React.useState("Scanning image...");
  const [description, setDescription] = React.useState("");

  const { addIssue } = useIssues();
  const { user } = useAuth();

  const handleOpen = () => {
    setOpen(true);
    setPhase("upload");
    setDescription("");
    setLoadingText("Scanning image...");
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
  };

  const handleClose = () => {
    if (phase === "analyzing") return;
    setOpen(false);
    document.body.style.overflow = "";
    setTimeout(() => setPhase("idle"), 300);
  };

  const handleUpload = () => {
    setPhase("analyzing");
    setTimeout(() => setLoadingText("Retrieving GPS coordinates..."), 1500);
    setTimeout(() => setLoadingText("Identifying severity & routing..."), 3000);

    setTimeout(() => {
      const newIssue: Issue = {
        id: `AI-${Math.floor(Math.random() * 10000)}`,
        title: "Large Pothole (AI Detected)",
        description: description.trim()
          ? `User note: ${description}\n\nAI Notes: AI identified a severe pothole causing traffic slowdowns. Immediate patching recommended.`
          : "AI identified a severe pothole causing traffic slowdowns. Immediate patching recommended.",
        category: "road",
        status: "submitted",
        priority: "high",
        location: "Jalan Ampang, Kuala Lumpur",
        lat: 3.158,
        lng: 101.714,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reportedBy: user?.name ?? "Citizen",
        reporterHandle: user?.email ? `@${user.email.split("@")[0]}` : "@citizen",
        upvotes: 1,
        image: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800",
        timeline: [
          {
            status: "submitted",
            label: "Report submitted via AI",
            note: "Automatically routed to DBKL for assessment.",
            actor: "AI System",
            date: new Date().toISOString(),
          },
        ],
      };
      addIssue(newIssue);
      setPhase("success");
    }, 4500);
  };

  return (
    <>
      {/* ── Trigger Button ── */}
      <button
        onClick={handleOpen}
        className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-full bg-foreground px-6 py-3 text-sm font-bold text-background transition-transform hover:scale-105 hover:shadow-xl hover:shadow-primary/30 w-full sm:w-auto"
      >
        <div className="absolute inset-0 bg-primary translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0" />
        <Zap className="relative z-10 size-4 text-primary group-hover:text-primary-foreground transition-colors" />
        <span className="relative z-10 group-hover:text-primary-foreground transition-colors">
          AI Quick Report
        </span>
      </button>

      {/* ── Modal via Portal (escapes all stacking contexts) ── */}
      <ModalPortal>
        {open && (
          <>
            {/* Full-screen darkened backdrop */}
            <div
              style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.75)" }}
              onClick={handleClose}
            />

            {/* Centered card */}
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1rem",
                pointerEvents: "none",
              }}
            >
              <div
                style={{ pointerEvents: "auto" }}
                className={cn(
                  "relative w-full max-w-md overflow-hidden rounded-3xl bg-card border border-border shadow-2xl transition-all duration-500",
                  phase === "analyzing" ? "scale-95" : "scale-100"
                )}
              >
                {/* Close Button */}
                {phase !== "analyzing" && (
                  <button
                    onClick={handleClose}
                    className="absolute right-4 top-4 z-10 rounded-full bg-muted/80 p-2 hover:bg-muted transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                )}

                {/* ── Phase: Upload ── */}
                {phase === "upload" && (
                  <div className="flex flex-col items-center p-8 animate-in fade-in zoom-in duration-300">
                    <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-5">
                      <Camera className="size-8" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-center">Capture Issue</h3>
                    <p className="text-center text-sm text-muted-foreground mb-6">
                      Upload a photo of the problem. Our AI will automatically identify the issue,
                      grab your location, and route it to the right agency.
                    </p>

                    {/* Fake Upload Zone */}
                    <div className="w-full flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/30 py-8 px-6 mb-4">
                      <div className="flex size-12 items-center justify-center rounded-full bg-background shadow-sm">
                        <Upload className="size-5 text-muted-foreground" />
                      </div>
                      <span className="font-semibold text-sm text-muted-foreground">
                        Photo upload (simulated)
                      </span>
                    </div>

                    {/* Description Field */}
                    <div className="w-full text-left">
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                        Additional Context{" "}
                        <span className="font-normal">(Optional)</span>
                      </label>
                      <Textarea
                        placeholder="E.g., It has been here for 2 weeks, near the bus stop…"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                        className="resize-none"
                      />
                    </div>

                    <Button
                      className="w-full mt-5 rounded-full font-bold"
                      size="lg"
                      onClick={handleUpload}
                    >
                      <Sparkles className="size-4 mr-2" />
                      Analyze with AI
                    </Button>
                  </div>
                )}

                {/* ── Phase: Analyzing ── */}
                {phase === "analyzing" && (
                  <div className="flex flex-col items-center justify-center p-12 min-h-[400px] animate-in fade-in duration-300">
                    <div className="relative w-48 h-48 rounded-2xl overflow-hidden mb-8 border border-border bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400"
                        alt="Scanning"
                        className="w-full h-full object-cover opacity-50"
                      />
                      {/* Laser sweep */}
                      <div
                        className="absolute top-0 left-0 w-full h-1 bg-primary"
                        style={{
                          boxShadow: "0 0 15px 4px var(--primary)",
                          animation: "ai-scan 2s ease-in-out infinite",
                        }}
                      />
                      {/* Grid overlay */}
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage:
                            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
                          backgroundSize: "20px 20px",
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <BrainCircuit className="size-5 text-primary animate-pulse" />
                      <p className="font-semibold animate-pulse">{loadingText}</p>
                    </div>
                  </div>
                )}

                {/* ── Phase: Success ── */}
                {phase === "success" && (
                  <div className="flex flex-col items-center p-8 animate-in slide-in-from-bottom-8 fade-in duration-500">
                    <div className="relative flex size-20 items-center justify-center rounded-full bg-success/20 text-success mb-6">
                      <div className="absolute inset-0 rounded-full bg-success/20 animate-ping" />
                      <CheckCircle2 className="size-10 relative z-10" />
                    </div>

                    <h3 className="text-2xl font-bold mb-2">Issue Reported!</h3>
                    <p className="text-center text-sm text-muted-foreground mb-6">
                      AI successfully analyzed the situation and dispatched the report.
                    </p>

                    <div className="w-full rounded-2xl bg-muted/50 border border-border p-4 flex flex-col gap-3 mb-8">
                      <div className="flex items-center gap-3 text-sm">
                        <Target className="size-4 text-primary" />
                        <span className="font-medium">Large Pothole</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="size-4 text-primary" />
                        <span className="font-medium">Jalan Ampang, KL</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm pt-3 border-t border-border/50">
                        <Sparkles className="size-4 text-primary" />
                        <span className="text-muted-foreground">
                          Routed to:{" "}
                          <strong className="text-foreground">DBKL (Roads)</strong>
                        </span>
                      </div>
                    </div>

                    <Button onClick={handleClose} size="lg" className="w-full rounded-full">
                      Back to Dashboard
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Keyframe for laser scan */}
            <style>{`
              @keyframes ai-scan {
                0%   { transform: translateY(0); }
                50%  { transform: translateY(188px); }
                100% { transform: translateY(0); }
              }
            `}</style>
          </>
        )}
      </ModalPortal>
    </>
  );
}
