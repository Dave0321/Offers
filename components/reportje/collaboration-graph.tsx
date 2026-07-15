"use client";

import * as React from "react";
import {
  AlertOctagon, Building2, Cpu, Droplet, MapPin, Network, Radio,
  RefreshCw, Send, TrafficCone, Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import {
  addIncidentUpdate, getGovernmentComplaints, getIncidentNetwork,
  type GovernmentComplaint, type IncidentNetwork,
} from "@/lib/api";

type NodeVisual = {
  id: string;
  label: string;
  name: string;
  role: string;
  reason: string | null;
  status: string;
  x: number;
  y: number;
  Icon: React.ElementType;
  color: string;
};

const visualFor = (code: string | null) => {
  switch (code) {
    case "TNB": return { Icon: Zap, color: "#d97706" };
    case "IWK":
    case "AIR_SELANGOR": return { Icon: Droplet, color: "#0891b2" };
    case "JKR": return { Icon: TrafficCone, color: "#ea580c" };
    default: return { Icon: Building2, color: "#1667c8" };
  }
};

const labelFor = (type: string) => type.replaceAll("_", " ");

function nodesFromNetwork(network: IncidentNetwork): NodeVisual[] {
  const lead = network.nodes.find((node) => node.role === "LEAD") ?? network.nodes[0];
  const rest = network.nodes.filter((node) => node.complaint_id !== lead?.complaint_id);
  const toNode = (node: IncidentNetwork["nodes"][number], x: number, y: number): NodeVisual => {
    const visual = visualFor(node.authority_code);
    return {
      id: node.complaint_id,
      label: node.authority_code || "AGENCY",
      name: node.authority_name || "Assigned authority",
      role: node.role || "INFORMED",
      reason: node.reason,
      status: node.status,
      x, y, Icon: visual.Icon, color: visual.color,
    };
  };
  if (!lead) return [];
  return [
    toNode(lead, 50, 50),
    ...rest.map((node, index) => {
      const angle = -Math.PI / 2 + (index * 2 * Math.PI) / Math.max(rest.length, 1);
      return toNode(node, 50 + Math.cos(angle) * 33, 50 + Math.sin(angle) * 33);
    }),
  ];
}

export default function CollaborationGraph() {
  const { user } = useAuth();
  const [cases, setCases] = React.useState<GovernmentComplaint[]>([]);
  const [activeParentId, setActiveParentId] = React.useState<string | null>(null);
  const [network, setNetwork] = React.useState<IncidentNetwork | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState("");
  const [sending, setSending] = React.useState(false);

  const loadCases = React.useCallback(async () => {
    if (!user?.accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const assigned = await getGovernmentComplaints(user.accessToken);
      const incidentCases = assigned.filter((item) => item.parent_id);
      setCases(incidentCases);
      setActiveParentId((current) => current && incidentCases.some((item) => item.parent_id === current)
        ? current : incidentCases[0]?.parent_id || null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load coordinated incidents.");
    } finally {
      setLoading(false);
    }
  }, [user?.accessToken]);

  React.useEffect(() => { void loadCases(); }, [loadCases]);

  React.useEffect(() => {
    if (!user?.accessToken || !activeParentId) {
      setNetwork(null);
      return;
    }
    setNetwork(null);
    getIncidentNetwork(user.accessToken, activeParentId)
      .then(setNetwork)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Unable to load the incident network."));
  }, [activeParentId, user?.accessToken]);

  const nodes = React.useMemo(() => network ? nodesFromNetwork(network) : [], [network]);
  const activeCase = cases.find((item) => item.parent_id === activeParentId) ?? null;
  const sendUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!message.trim() || !user?.accessToken || !activeParentId) return;
    setSending(true);
    try {
      const update = await addIncidentUpdate(user.accessToken, activeParentId, { update_text: message.trim() });
      setNetwork((current) => current ? { ...current, updates: [...current.updates, update] } : current);
      setMessage("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to publish the update.");
    } finally {
      setSending(false);
    }
  };

  if (!user?.accessToken) return null;

  return (
    <div className="w-full flex flex-col gap-6 p-1">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary"><Cpu className="size-6" /></div>
          <div>
            <h2 className="text-xl font-bold tracking-wide">TACTICAL INCIDENT ROOM</h2>
            <p className="text-xs text-muted-foreground mt-1">Live parent/child authority coordination</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => void loadCases()} disabled={loading}><RefreshCw className={cn("size-3.5", loading && "animate-spin")} /> Refresh</Button>
      </div>

      {error && <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

      {!loading && cases.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
          <Network className="mx-auto size-8 text-muted-foreground" />
          <h3 className="mt-3 font-bold">No coordinated incidents assigned</h3>
          <p className="mt-1 text-sm text-muted-foreground">This room shows only reports with a parent incident and at least one assisting authority.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <section className="lg:col-span-3 bg-card border border-border rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-widest flex items-center gap-2"><AlertOctagon className="size-4 text-primary" /> Active incidents</h3>
              <span className="text-xs text-muted-foreground">{cases.length}</span>
            </div>
            <div className="flex flex-col gap-3 max-h-[540px] overflow-y-auto">
              {cases.map((item) => (
                <button key={item.id} onClick={() => setActiveParentId(item.parent_id)} className={cn("w-full text-left rounded-2xl p-4 border transition-colors", item.parent_id === activeParentId ? "bg-primary/5 border-primary/50" : "bg-background border-border hover:bg-muted/50")}>
                  <div className="flex justify-between gap-2"><span className="text-[10px] font-mono text-primary">{item.parent_id?.slice(0, 8)}</span><Badge className="bg-orange-500 text-white border-none">HIGH</Badge></div>
                  <h4 className="mt-2 font-bold text-sm">{labelFor(item.issue_type)}</h4>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{item.raw_input_text || "No report description."}</p>
                  <span className="mt-3 flex items-center gap-1 text-[10px] text-muted-foreground"><MapPin className="size-3" /> Assigned parent incident</span>
                </button>
              ))}
            </div>
          </section>

          <section className="lg:col-span-6 min-h-[590px] overflow-hidden rounded-3xl border border-border bg-[linear-gradient(to_right,rgba(148,163,184,.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,.12)_1px,transparent_1px)] bg-[size:24px_24px] p-5 relative">
            <div className="rounded-xl border border-border bg-card px-4 py-3 inline-block relative z-10"><span className="text-[9px] font-bold text-primary uppercase">Current incident</span><p className="text-sm font-bold">{activeCase ? labelFor(activeCase.issue_type) : "Loading network..."}</p></div>
            <div className="absolute inset-x-5 top-24 bottom-20">
              <svg className="absolute inset-0 h-full w-full overflow-visible">
                {nodes.slice(1).map((node) => <line key={node.id} x1="50%" y1="50%" x2={`${node.x}%`} y2={`${node.y}%`} stroke="#2563eb" strokeWidth="2" />)}
              </svg>
              {nodes.map((node) => {
                const Icon = node.Icon;
                return <div key={node.id} className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${node.x}%`, top: `${node.y}%` }}>
                  <div className="mx-auto flex size-16 items-center justify-center rounded-full border-2 bg-card shadow-sm" style={{ borderColor: node.color, color: node.color }}><Icon className="size-7" /></div>
                  <span className="mt-2 inline-block rounded bg-card px-2 py-1 text-[10px] font-bold shadow-sm">{node.label}</span>
                  <span className="block text-[9px] text-muted-foreground">{node.role}</span>
                </div>;
              })}
            </div>
            <div className="absolute inset-x-5 bottom-5 grid grid-cols-3 gap-2 border-t border-border pt-4"><Metric label="Incident nodes" value={nodes.length} /><Metric label="Active streams" value={Math.max(nodes.length - 1, 0)} /><Metric label="Updates" value={network?.updates.length || 0} /></div>
          </section>

          <section className="lg:col-span-3 flex min-h-[590px] flex-col gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-border pb-4"><Radio className="size-4 text-primary" /><h3 className="font-bold text-sm uppercase tracking-wider">Tactical log feed</h3></div>
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[420px]">
              {network?.updates.map((update) => <div key={update.id} className="rounded-xl border border-border bg-background p-3 text-xs"><div className="flex justify-between gap-2"><strong className="text-primary">{update.authority_code}</strong><span className="text-[9px] text-muted-foreground">{new Date(update.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></div><p className="mt-1.5 text-muted-foreground">{update.update_text}</p></div>)}
              {network && network.updates.length === 0 && <p className="pt-10 text-center text-xs text-muted-foreground">No shared updates yet.</p>}
            </div>
            <form onSubmit={sendUpdate} className="flex gap-2 border-t border-border pt-3"><Input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Broadcast to incident team..." /><Button size="icon" type="submit" disabled={sending || !activeParentId}><Send className="size-4" /></Button></form>
          </section>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl border border-border bg-card/80 p-2 text-center"><span className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</span><p className="text-base font-bold text-primary">{value}</p></div>;
}
