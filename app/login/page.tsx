"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Megaphone, User, Building2, ArrowRight, Eye, EyeOff, ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { CURRENT_AGENCY } from "@/lib/reportje-data";
import type { Role } from "@/lib/reportje-data";
import type { AuthUser } from "@/lib/auth-context";
import { signInOfficer } from "@/lib/api";

// ─── Mock citizens ──────────────────────────────────────────────────────────
const MOCK_CITIZENS = [
  { name: "Nur Aisyah", handle: "@aisyah", email: "aisyah@warga.my", area: "Kuala Lumpur", avatar: "/avatars/user_mati.png", password: "pass123" },
  { name: "David Tan", handle: "@davidt", email: "david.tan@warga.my", area: "Petaling Jaya", avatar: "/avatars/user_krimson.png", password: "pass123" },
  { name: "Farah Idris", handle: "@farah", email: "farah.idris@warga.my", area: "Shah Alam", avatar: "/avatars/user_mati.png", password: "pass123" },
];

// ─── Mock agency credentials ─────────────────────────────────────────────────
const AGENCY_PASSWORD = "pass123";

// ─── Stats for hero pane ─────────────────────────────────────────────────────
const HERO_STATS = [
  { value: "12,400+", label: "Issues Resolved" },
  { value: "47", label: "Partner Agencies" },
  { value: "3.2h", label: "Avg Response Time" },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep] = React.useState<"role" | "form">("role");
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null);

  // Citizen form state
  const [citizenIdx, setCitizenIdx] = React.useState(0);
  const [citizenPwd, setCitizenPwd] = React.useState("");
  const [showCitizenPwd, setShowCitizenPwd] = React.useState(false);

  // Agency form state
  const [officerEmail, setOfficerEmail] = React.useState("");
  const [agencyPwd, setAgencyPwd] = React.useState("");
  const [showAgencyPwd, setShowAgencyPwd] = React.useState(false);

  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const selectRole = (r: Role) => {
    if (r === "citizen") {
      window.location.assign(process.env.NEXT_PUBLIC_REPORTJE_URL || "http://localhost:3000");
      return;
    }
    setSelectedRole(r);
    setError("");
    setStep("form");
  };

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const session = await signInOfficer(officerEmail, agencyPwd);
      const user: AuthUser = {
        name: "Government Officer",
        email: session.email,
        avatar: CURRENT_AGENCY.avatar,
        area: "Assigned authority",
        officer: session.email,
        agency: "Assigned authority",
        accessToken: session.accessToken,
      };
      login("agency", user);
      router.push("/agency");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── Hero pane ─────────────────────────────────────────────────────── */}
      <div className="relative flex flex-col justify-between p-8 lg:p-12 bg-primary text-primary-foreground lg:w-[45%] overflow-hidden min-h-[280px] lg:min-h-screen">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary-foreground/5" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-primary-foreground/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary-foreground/3" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3 z-10">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary-foreground/15 backdrop-blur-sm">
            <Megaphone className="size-5" />
          </div>
          <span className="text-2xl font-display">ReportJe</span>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 flex flex-col gap-5 my-8 lg:my-0">
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-display leading-[1.1]">
            One report.<br />
            The right agency.
          </h1>
          <p className="text-lg text-primary-foreground/75 max-w-sm leading-relaxed">
            ReportJe connects Malaysian residents with the local agencies that can actually fix the problem — road, drain, lamp, or otherwise.
          </p>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-2">
            {HERO_STATS.map((s) => (
              <div key={s.label} className="flex flex-col gap-0.5">
                <span className="text-2xl font-display">{s.value}</span>
                <span className="text-xs text-primary-foreground/60 uppercase">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tagline */}
        <p className="relative z-10 text-xs text-primary-foreground/50 uppercase tracking-wider">
          Civic issues, one system
        </p>
      </div>

      {/* ── Form pane ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md flex flex-col gap-8">
          {step === "role" ? (
            /* Role selection */
            <>
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-display">Welcome back</h2>
                <p className="text-muted-foreground">How are you signing in today?</p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  id="role-citizen"
                  onClick={() => selectRole("citizen")}
                  className="group flex items-center gap-4 rounded-xl border-2 border-border bg-card p-5 text-left transition-all hover:border-primary hover:bg-accent"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <User className="size-6" />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-display">I&apos;m a Citizen</div>
                    <p className="text-sm text-muted-foreground mt-0.5">Report issues, track progress in your area</p>
                  </div>
                  <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </button>

                <button
                  id="role-agency"
                  onClick={() => selectRole("agency")}
                  className="group flex items-center gap-4 rounded-xl border-2 border-border bg-card p-5 text-left transition-all hover:border-primary hover:bg-accent"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Building2 className="size-6" />
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-display">I&apos;m an Agency</div>
                    <p className="text-sm text-muted-foreground mt-0.5">Manage and respond to assigned reports</p>
                  </div>
                  <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </button>
              </div>
            </>
          ) : (
            /* Login form */
            <>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { setStep("role"); setError(""); }}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
                >
                  ← Back
                </button>
                <h2 className="text-3xl font-display mt-1">
                  {selectedRole === "citizen" ? "Citizen login" : "Agency login"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Use your assigned Supabase officer credentials.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {selectedRole === "citizen" ? (
                  <>
                    {/* Citizen name dropdown */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="citizen-name" className="text-sm text-foreground">Account</label>
                      <div className="relative">
                        <select
                          id="citizen-name"
                          value={citizenIdx}
                          onChange={(e) => { setCitizenIdx(Number(e.target.value)); setError(""); }}
                          className="w-full appearance-none rounded-lg border border-border bg-card px-4 py-3 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                        >
                          {MOCK_CITIZENS.map((c, i) => (
                            <option key={c.handle} value={i}>
                              {c.name} ({c.area})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="citizen-pwd" className="text-sm text-foreground">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="citizen-pwd"
                          type={showCitizenPwd ? "text" : "password"}
                        placeholder="Your officer password"
                          value={citizenPwd}
                          onChange={(e) => { setCitizenPwd(e.target.value); setError(""); }}
                          className="w-full rounded-lg border border-border bg-card px-4 py-3 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setShowCitizenPwd((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showCitizenPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="officer-email" className="text-sm text-foreground">Officer email</label>
                      <input
                        id="officer-email"
                        type="email"
                        placeholder="officer@authority.gov.my"
                        value={officerEmail}
                        onChange={(e) => { setOfficerEmail(e.target.value); setError(""); }}
                        className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                      />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="agency-pwd" className="text-sm text-foreground">
                        Password <span className="text-muted-foreground">(optional)</span>
                      </label>
                      <div className="relative">
                        <input
                          id="agency-pwd"
                          type={showAgencyPwd ? "text" : "password"}
                          placeholder="pass123"
                          value={agencyPwd}
                          onChange={(e) => { setAgencyPwd(e.target.value); setError(""); }}
                          className="w-full rounded-lg border border-border bg-card px-4 py-3 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setShowAgencyPwd((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showAgencyPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">Demo password: <code className="text-foreground">pass123</code></p>
                    </div>
                  </>
                )}

                {/* Error */}
                {error && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    id="login-submit"
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full rounded-lg bg-primary px-4 py-3 text-sm text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="size-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                    ) : (
                      <>Sign in <ArrowRight className="size-4" /></>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
