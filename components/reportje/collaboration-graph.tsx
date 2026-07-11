"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { 
  Building2, 
  Network, 
  ShieldAlert, 
  Droplet, 
  Zap, 
  TrafficCone, 
  Users,
  MessageSquare,
  Video,
  X,
  FileText,
  Clock,
  Radio,
  Activity,
  AlertOctagon,
  Flame,
  Waves,
  ShieldCheck,
  Send,
  Sliders,
  Cpu,
  RefreshCw,
  Eye,
  Maximize2,
  MapPin
} from "lucide-react";

// ─── Types & Definitions ───────────────────────────────────────────────────
type SubNode = {
  id: string;
  label: string;
  role: string;
  status: "online" | "en-route" | "offline";
  x: number;
  y: number;
};

type AgencyNode = {
  id: string;
  label: string;
  name: string;
  icon: React.ElementType;
  x: number;
  y: number;
  color: string;
  glowColor: string;
  description: string;
  liaison: string;
  frequency: string;
  ip: string;
  subNodes: SubNode[];
};

type Edge = {
  id: string;
  source: string;
  target: string;
  active: boolean;
  type: "data" | "radio" | "patrol";
};

type IncidentCase = {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium";
  location: string;
  description: string;
  nodes: AgencyNode[];
  edges: Edge[];
  logs: { timestamp: string; sender: string; message: string }[];
};

// ─── Futuristic Mock Data ──────────────────────────────────────────────────
const INCIDENTS: IncidentCase[] = [
  {
    id: "INC-2091",
    title: "Jalan Tun Razak Flash Flood & Road Lock",
    severity: "critical",
    location: "Jalan Tun Razak (near Tun Razak Exchange)",
    description: "Sudden high-volume flash flood has submerged 3 lanes. Vehicles trapped. Gridlock spreading back to SMART Tunnel.",
    nodes: [
      {
        id: "dbkl",
        label: "DBKL",
        name: "Kuala Lumpur City Hall",
        icon: Building2,
        x: 50,
        y: 50,
        color: "oklch(0.62 0.14 155)",
        glowColor: "rgba(16, 185, 129, 0.4)",
        description: "Primary coordination hub and municipal response center.",
        liaison: "Cmdr. Azlan Shah",
        frequency: "410.82 MHz (Encrypted)",
        ip: "10.11.200.1",
        subNodes: [
          { id: "dbkl-1", label: "HQ Command", role: "Coordination", status: "online", x: 45, y: 40 },
          { id: "dbkl-2", label: "Rescue Unit A", role: "Search & Rescue", status: "online", x: 55, y: 60 }
        ]
      },
      {
        id: "bomba",
        label: "BOMBA",
        name: "Fire and Rescue Department",
        icon: Flame,
        x: 20,
        y: 20,
        color: "var(--destructive)",
        glowColor: "rgba(239, 68, 68, 0.4)",
        description: "Specialized search, water rescue, and evacuation operations.",
        liaison: "Superintendent Roslan",
        frequency: "154.25 MHz (Secure Link)",
        ip: "10.11.205.14",
        subNodes: [
          { id: "bomba-1", label: "Hazmat Boat 1", role: "Evacuation", status: "online", x: 15, y: 15 },
          { id: "bomba-2", label: "Diving Squad", role: "Rescue", status: "en-route", x: 30, y: 30 }
        ]
      },
      {
        id: "pdrm",
        label: "PDRM",
        name: "Royal Malaysia Police",
        icon: ShieldAlert,
        x: 80,
        y: 20,
        color: "var(--primary)",
        glowColor: "rgba(59, 130, 246, 0.4)",
        description: "Traffic control, highway blockades, and logistics safety perimeter.",
        liaison: "Insp. Haris Tan",
        frequency: "450.15 MHz (Encrypted)",
        ip: "10.11.201.55",
        subNodes: [
          { id: "pdrm-1", label: "Traffic Patrol 4", role: "Diversion", status: "online", x: 85, y: 12 },
          { id: "pdrm-2", label: "Interceptor Unit", role: "Perimeter", status: "online", x: 70, y: 32 }
        ]
      },
      {
        id: "rela",
        label: "RELA",
        name: "Malaysia Volunteers Corps",
        icon: Users,
        x: 50,
        y: 82,
        color: "var(--chart-2)",
        glowColor: "rgba(234, 179, 8, 0.4)",
        description: "Secondary logistics assistance and local traffic guidance.",
        liaison: "Captain Subramaniam",
        frequency: "148.50 MHz (Analog)",
        ip: "10.11.212.8",
        subNodes: [
          { id: "rela-1", label: "Volunteers Sector B", role: "Crowd Control", status: "online", x: 40, y: 88 }
        ]
      },
      {
        id: "jkr",
        label: "JKR",
        name: "Public Works Department",
        icon: TrafficCone,
        x: 20,
        y: 75,
        color: "var(--chart-4)",
        glowColor: "rgba(249, 115, 22, 0.4)",
        description: "Drainage clearing, water pumping structures monitoring.",
        liaison: "Ir. Kelvin Wong",
        frequency: "420.90 MHz (Secure Link)",
        ip: "10.11.203.20",
        subNodes: [
          { id: "jkr-1", label: "Pumping Station 3", role: "Dewatering", status: "online", x: 12, y: 80 }
        ]
      }
    ],
    edges: [
      { id: "e1", source: "dbkl", target: "bomba", active: true, type: "data" },
      { id: "e2", source: "dbkl", target: "pdrm", active: true, type: "data" },
      { id: "e3", source: "dbkl", target: "rela", active: true, type: "radio" },
      { id: "e4", source: "dbkl", target: "jkr", active: true, type: "data" },
      { id: "e5", source: "bomba", target: "pdrm", active: true, type: "radio" },
      { id: "e6", source: "jkr", target: "bomba", active: false, type: "data" }
    ],
    logs: [
      { timestamp: "14:20:12", sender: "DBKL HQ", message: "Water levels at Jalan Tun Razak exceeding 0.6 meters. Flooding confirmed." },
      { timestamp: "14:21:40", sender: "BOMBA Team", message: "Dispatched specialized Hazmat Rescue Boat 1 and diving squads." },
      { timestamp: "14:23:05", sender: "PDRM Patrol", message: "Locked down lanes at TRX tunnel junction. Traffic diverted to Jalan Imbi." },
      { timestamp: "14:26:18", sender: "JKR Engineering", message: "Activating auxiliary water pumps at Station 3. Flow rate: 4500L/min." },
      { timestamp: "14:28:44", sender: "RELA Unit", message: "Arrived at diverted route points. Supporting police traffic flows." }
    ]
  },
  {
    id: "INC-2092",
    title: "Jalan Ampang Downed Power Lines & Traffic Lights Failure",
    severity: "high",
    location: "Jalan Ampang (near KLCC crossroads)",
    description: "A large fallen tree has ruptured overhead power cables, causing sudden blackout. Traffic lights at KLCC intersection are fully offline.",
    nodes: [
      {
        id: "dbkl",
        label: "DBKL",
        name: "Kuala Lumpur City Hall",
        icon: Building2,
        x: 50,
        y: 50,
        color: "oklch(0.62 0.14 155)",
        glowColor: "rgba(16, 185, 129, 0.4)",
        description: "Primary coordination hub and municipal response center.",
        liaison: "Cmdr. Azlan Shah",
        frequency: "410.82 MHz (Encrypted)",
        ip: "10.11.200.1",
        subNodes: [
          { id: "dbkl-1", label: "HQ Command", role: "Coordination", status: "online", x: 45, y: 40 }
        ]
      },
      {
        id: "tnb",
        label: "TNB",
        name: "Tenaga Nasional Berhad",
        icon: Zap,
        x: 20,
        y: 40,
        color: "var(--warning)",
        glowColor: "rgba(234, 179, 8, 0.4)",
        description: "National power provider. Grid isolation and high-voltage repairs.",
        liaison: "En. Faizal Tahir",
        frequency: "468.22 MHz (Encrypted)",
        ip: "10.11.208.9",
        subNodes: [
          { id: "tnb-1", label: "Substation 4", role: "Isolation", status: "online", x: 10, y: 35 },
          { id: "tnb-2", label: "Cable Crew 3", role: "High-Voltage Fix", status: "en-route", x: 25, y: 30 }
        ]
      },
      {
        id: "pdrm",
        label: "PDRM",
        name: "Royal Malaysia Police",
        icon: ShieldAlert,
        x: 80,
        y: 40,
        color: "var(--primary)",
        glowColor: "rgba(59, 130, 246, 0.4)",
        description: "Traffic control, highway blockades, and logistics safety perimeter.",
        liaison: "Insp. Haris Tan",
        frequency: "450.15 MHz (Encrypted)",
        ip: "10.11.201.55",
        subNodes: [
          { id: "pdrm-1", label: "Traffic Patrol 4", role: "Diversion", status: "online", x: 85, y: 35 }
        ]
      },
      {
        id: "jkr",
        label: "JKR",
        name: "Public Works Department",
        icon: TrafficCone,
        x: 50,
        y: 80,
        color: "var(--chart-4)",
        glowColor: "rgba(249, 115, 22, 0.4)",
        description: "Obstruction clearing and heavy machinery operations.",
        liaison: "Ir. Kelvin Wong",
        frequency: "420.90 MHz (Secure Link)",
        ip: "10.11.203.20",
        subNodes: [
          { id: "jkr-1", label: "Obstruction Crew", role: "Debris Removal", status: "online", x: 55, y: 88 }
        ]
      }
    ],
    edges: [
      { id: "e1", source: "dbkl", target: "tnb", active: true, type: "data" },
      { id: "e2", source: "dbkl", target: "pdrm", active: true, type: "data" },
      { id: "e3", source: "dbkl", target: "jkr", active: true, type: "data" },
      { id: "e4", source: "tnb", target: "jkr", active: true, type: "radio" }
    ],
    logs: [
      { timestamp: "18:45:00", sender: "DBKL HQ", message: "Power line collapse reported on Jalan Ampang. Grid status requested." },
      { timestamp: "18:46:20", sender: "TNB Substation", message: "Ruptured grid line detected. Remotely isolating Section 4 sector." },
      { timestamp: "18:48:10", sender: "PDRM Patrol", message: "Manual traffic directing deployed at KLCC junction. Area dangerous due to hanging live cables." },
      { timestamp: "18:52:15", sender: "JKR Obstruction", message: "Dispatched tree cutters and cranes to site. Awaiting TNB safety clearance." }
    ]
  },
  {
    id: "INC-2093",
    title: "Burst Main Water Pipe & Sinkhole on Jalan Duta",
    severity: "high",
    location: "Jalan Tuanku Abdul Halim (Jalan Duta)",
    description: "A major water main ruptured underground, causing soil erosion and a 4-meter wide sinkhole. Road surface structurally compromised.",
    nodes: [
      {
        id: "dbkl",
        label: "DBKL",
        name: "Kuala Lumpur City Hall",
        icon: Building2,
        x: 50,
        y: 50,
        color: "oklch(0.62 0.14 155)",
        glowColor: "rgba(16, 185, 129, 0.4)",
        description: "Primary coordination hub and municipal response center.",
        liaison: "Cmdr. Azlan Shah",
        frequency: "410.82 MHz (Encrypted)",
        ip: "10.11.200.1",
        subNodes: [
          { id: "dbkl-1", label: "HQ Command", role: "Coordination", status: "online", x: 45, y: 40 }
        ]
      },
      {
        id: "syabas",
        label: "SYABAS",
        name: "Water Supply Agency",
        icon: Droplet,
        x: 20,
        y: 50,
        color: "var(--cyan)",
        glowColor: "rgba(6, 182, 212, 0.4)",
        description: "Water pressure management, main line valve shutoff, and pipe repair.",
        liaison: "Pn. Aisyah Aziz",
        frequency: "162.45 MHz (Secure Line)",
        ip: "10.11.207.2",
        subNodes: [
          { id: "syabas-1", label: "Valve Control", role: "Shutoff Unit", status: "online", x: 12, y: 55 },
          { id: "syabas-2", label: "Welding Crew", role: "Pipe Repair", status: "en-route", x: 28, y: 45 }
        ]
      },
      {
        id: "jkr",
        label: "JKR",
        name: "Public Works Department",
        icon: TrafficCone,
        x: 80,
        y: 50,
        color: "var(--chart-4)",
        glowColor: "rgba(249, 115, 22, 0.4)",
        description: "Geotechnical structural analysis, ground stability survey, and resurfacing.",
        liaison: "Ir. Kelvin Wong",
        frequency: "420.90 MHz (Secure Link)",
        ip: "10.11.203.20",
        subNodes: [
          { id: "jkr-1", label: "Geo-Tech Unit", role: "Soil Testing", status: "online", x: 88, y: 45 },
          { id: "jkr-2", label: "Asphalt Crew 5", role: "Resurfacing", status: "offline", x: 82, y: 58 }
        ]
      }
    ],
    edges: [
      { id: "e1", source: "dbkl", target: "syabas", active: true, type: "data" },
      { id: "e2", source: "dbkl", target: "jkr", active: true, type: "data" },
      { id: "e3", source: "syabas", target: "jkr", active: true, type: "radio" }
    ],
    logs: [
      { timestamp: "09:12:00", sender: "DBKL HQ", message: "Severe underground water burst reported. Roadway bubbling." },
      { timestamp: "09:15:30", sender: "SYABAS Team", message: "Pressure drop detected. Shutting down the 900mm main valve on Sector D." },
      { timestamp: "09:30:10", sender: "JKR Soil Team", message: "Initial GPR scan indicates heavy soil void beneath lanes. Highly unstable." }
    ]
  }
];

export default function CollaborationGraph() {
  const [activeIncidentId, setActiveIncidentId] = React.useState<string>(INCIDENTS[0].id);
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null);
  const [messageText, setMessageText] = React.useState("");
  const [hoveredEdgeId, setHoveredEdgeId] = React.useState<string | null>(null);

  // Active Incident Data
  const activeIncident = React.useMemo(() => {
    return INCIDENTS.find((inc) => inc.id === activeIncidentId) || INCIDENTS[0];
  }, [activeIncidentId]);

  // Selected Node Data
  const selectedNode = React.useMemo(() => {
    if (!selectedNodeId) return null;
    return activeIncident.nodes.find((n) => n.id === selectedNodeId) || null;
  }, [selectedNodeId, activeIncident]);

  // Handle active incident change
  const handleIncidentSelect = (id: string) => {
    setActiveIncidentId(id);
    setSelectedNodeId(null);
  };

  // Dispatch custom message to logs
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    // Add message locally in demo mode
    activeIncident.logs.push({
      timestamp: new Date().toTimeString().split(" ")[0].slice(0, 8),
      sender: "DBKL Command",
      message: messageText.trim()
    });
    
    setMessageText("");
  };

  // Severity style helper
  const getSeverityBadge = (sev: "critical" | "high" | "medium") => {
    switch (sev) {
      case "critical":
        return <Badge className="bg-destructive text-destructive-foreground border-none animate-pulse">CRITICAL</Badge>;
      case "high":
        return <Badge className="bg-orange-500 text-white border-none">HIGH SEVERITY</Badge>;
      default:
        return <Badge className="bg-yellow-500 text-black border-none">MEDIUM</Badge>;
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 select-none text-foreground font-sans p-1">
      {/* ── Header Information Bar ── */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <Cpu className="size-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 tracking-wide">
              TACTICAL INCIDENT ROOM
            </h2>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
              <span className="flex items-center gap-1.5"><Sliders className="size-3 text-primary" /> SECURE LINK ESTABLISHED</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>TX: 3.4 GB/s</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-primary font-mono tracking-wider bg-background">
            GRID FREQUENCY: 5.8 GHZ
          </Badge>
          <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 font-mono tracking-wider bg-background">
            ENCRYPTION: AES-256
          </Badge>
        </div>
      </div>

      {/* ── Main Tactical split-screen Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN (col-span-3): Active Incident selection */}
        <div className="lg:col-span-3 flex flex-col gap-4 bg-card border border-border rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <AlertOctagon className="size-4 text-primary" /> Active Incidents
            </h3>
            <span className="text-xs text-muted-foreground font-mono">({INCIDENTS.length} Active)</span>
          </div>

          <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
            {INCIDENTS.map((inc) => {
              const isActive = inc.id === activeIncidentId;
              return (
                <button
                  key={inc.id}
                  onClick={() => handleIncidentSelect(inc.id)}
                  className={cn(
                    "w-full text-left rounded-2xl p-4 border transition-all duration-300 flex flex-col gap-3 group relative overflow-hidden",
                    isActive 
                      ? "bg-primary/5 border-primary/40 shadow-sm" 
                      : "bg-background border-border hover:border-border/80 hover:bg-muted/50"
                  )}
                >
                  {/* Active highlight bar */}
                  {isActive && (
                    <div className="absolute top-0 bottom-0 left-0 w-1 bg-primary" />
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono text-primary uppercase tracking-wider">{inc.id}</span>
                    {getSeverityBadge(inc.severity)}
                  </div>
                  <div>
                    <h4 className={cn("font-bold text-sm leading-snug tracking-wide group-hover:text-primary transition-colors", isActive ? "text-primary" : "text-foreground")}>
                      {inc.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                      <MapPin className="size-3 text-muted-foreground shrink-0" />
                      <span className="truncate">{inc.location}</span>
                    </p>
                  </div>
                  
                  {/* Connected Nodes Summary */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-border mt-1">
                    <span className="text-[9px] text-muted-foreground font-bold uppercase mr-1">Units:</span>
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {inc.nodes.map((node) => {
                        const Icon = node.icon;
                        return (
                          <div 
                            key={node.id} 
                            style={{ backgroundColor: node.color }}
                            className="size-5 rounded-full border-2 border-background flex items-center justify-center text-white shrink-0 shadow-sm"
                          >
                            <Icon className="size-2.5" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* MIDDLE COLUMN (col-span-6): Interactive Network Graph */}
        <div className="lg:col-span-6 flex flex-col gap-4 bg-background border border-border rounded-3xl p-5 shadow-inner relative min-h-[500px] lg:min-h-[600px] overflow-hidden">
          
          {/* Tactical map background elements */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,145,178,0.06),transparent_70%)] pointer-events-none" />
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
              backgroundSize: "24px 24px"
            }}
          />

          {/* Incident Overlay details */}
          <div className="absolute top-4 left-4 z-20 bg-card/90 backdrop-blur-md border border-border rounded-xl px-4 py-2.5 max-w-sm pointer-events-auto shadow-sm">
            <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-wider block mb-0.5">CURRENT SECTOR MAP</span>
            <p className="text-sm font-bold text-foreground line-clamp-1">{activeIncident.title}</p>
          </div>

          <div className="absolute top-4 right-4 z-20 flex gap-2">
            <Button size="icon" variant="outline" className="h-8 w-8 bg-card/80 border-border text-muted-foreground hover:text-primary rounded-lg">
              <Maximize2 className="size-3.5" />
            </Button>
            <Button size="icon" variant="outline" className="h-8 w-8 bg-card/80 border-border text-muted-foreground hover:text-primary rounded-lg">
              <RefreshCw className="size-3.5" />
            </Button>
          </div>

          {/* SVG & Interactive Graph Area */}
          <div className="flex-1 w-full h-full relative min-h-[400px]">
            {/* SVG Link lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                {activeIncident.edges.map((edge) => {
                  const srcNode = activeIncident.nodes.find((n) => n.id === edge.source);
                  const destNode = activeIncident.nodes.find((n) => n.id === edge.target);
                  if (!srcNode || !destNode) return null;
                  return (
                    <linearGradient
                      key={edge.id}
                      id={`grad-tactical-${edge.id}`}
                      x1={`${srcNode.x}%`}
                      y1={`${srcNode.y}%`}
                      x2={`${destNode.x}%`}
                      y2={`${destNode.y}%`}
                    >
                      <stop offset="0%" stopColor={srcNode.color} />
                      <stop offset="100%" stopColor={destNode.color} />
                    </linearGradient>
                  );
                })}

                <filter id="glow-heavy" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {activeIncident.edges.map((edge) => {
                const srcNode = activeIncident.nodes.find((n) => n.id === edge.source);
                const destNode = activeIncident.nodes.find((n) => n.id === edge.target);
                if (!srcNode || !destNode) return null;

                const isLinkActive = edge.active;
                const isSelectedFocus = selectedNodeId 
                  ? (srcNode.id === selectedNodeId || destNode.id === selectedNodeId)
                  : true;

                return (
                  <g key={edge.id} className="transition-opacity duration-300" style={{ opacity: isSelectedFocus ? 1 : 0.15 }}>
                    {/* Underlying heavy glow line for active nodes */}
                    {isLinkActive && (
                      <line
                        x1={`${srcNode.x}%`}
                        y1={`${srcNode.y}%`}
                        x2={`${destNode.x}%`}
                        y2={`${destNode.y}%`}
                        stroke={`url(#grad-tactical-${edge.id})`}
                        strokeWidth="3.5"
                        filter="url(#glow-heavy)"
                        className="opacity-20"
                      />
                    )}
                    {/* Primary connection line */}
                    <motion.line
                      x1={`${srcNode.x}%`}
                      y1={`${srcNode.y}%`}
                      x2={`${destNode.x}%`}
                      y2={`${destNode.y}%`}
                      stroke={`url(#grad-tactical-${edge.id})`}
                      strokeWidth={hoveredEdgeId === edge.id ? 4 : isLinkActive ? 2 : 1}
                      strokeDasharray={isLinkActive ? "none" : "6,4"}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className="cursor-pointer"
                    />

                    {/* Glowing flow simulation (data packets) */}
                    {isLinkActive && (
                      <motion.circle
                        r="3.5"
                        fill="currentColor"
                        className="text-primary"
                        filter="url(#glow-heavy)"
                        animate={{
                          cx: [`${srcNode.x}%`, `${destNode.x}%`],
                          cy: [`${srcNode.y}%`, `${destNode.y}%`],
                        }}
                        transition={{
                          duration: edge.type === "data" ? 3 : 5,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Interactive Agency Nodes & Sub-Nodes */}
            {activeIncident.nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isNodeFocused = selectedNodeId
                ? node.id === selectedNodeId || activeIncident.edges.some(e => 
                    (e.source === node.id && e.target === selectedNodeId) || 
                    (e.target === node.id && e.source === selectedNodeId)
                  )
                : true;

              const NodeIcon = node.icon;

              return (
                <div key={node.id} className="transition-opacity duration-300" style={{ opacity: isNodeFocused ? 1 : 0.2 }}>
                  {/* Core Node Orb */}
                  <motion.div
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 cursor-pointer z-20 group"
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    whileHover={{ scale: 1.08 }}
                    onClick={() => setSelectedNodeId(node.id)}
                  >
                    <div 
                      className={cn(
                        "relative flex items-center justify-center rounded-full border-2 bg-card transition-all",
                        node.id === "dbkl" ? "size-20" : "size-14",
                        isSelected ? "ring-4 ring-offset-4 ring-offset-background" : ""
                      )}
                      style={{ 
                        borderColor: node.color,
                        boxShadow: isSelected ? `0 0 25px ${node.color}80` : `0 0 10px ${node.color}20`,
                        ringColor: node.color
                      }}
                    >
                      <NodeIcon className="size-1/2" style={{ color: node.color }} />
                      
                      {/* Active status ring pulsing */}
                      {node.id === "dbkl" && (
                        <div className="absolute inset-0 rounded-full animate-ping opacity-[0.08] pointer-events-none" style={{ backgroundColor: node.color }} />
                      )}
                    </div>
                    {/* Node Tag */}
                    <span className="px-2.5 py-0.5 rounded-md bg-card border border-border text-[10px] font-bold font-mono text-foreground tracking-wider shadow-sm">
                      {node.label}
                    </span>
                  </motion.div>

                  {/* Sub-Nodes (Field crews / Units) orbiting the parent node */}
                  {node.subNodes.map((sub) => {
                    const statusColors = {
                      online: "bg-emerald-500 shadow-emerald-500/40",
                      "en-route": "bg-yellow-500 shadow-yellow-500/40",
                      offline: "bg-muted-foreground"
                    };
                    return (
                      <motion.div
                        key={sub.id}
                        className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 bg-card/90 border border-border rounded-lg p-1.5 z-10 pointer-events-auto shadow-sm"
                        style={{ left: `${sub.x}%`, top: `${sub.y}%` }}
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: isNodeFocused ? 0.9 : 0.2 }}
                      >
                        <span className={cn("size-2 rounded-full animate-pulse", statusColors[sub.status])} />
                        <div className="flex flex-col">
                          <span className="text-[8px] font-bold text-foreground uppercase leading-none">{sub.label}</span>
                          <span className="text-[7px] text-muted-foreground leading-none mt-0.5">{sub.role}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Active stats bar at bottom of graph */}
          <div className="grid grid-cols-3 gap-2 border-t border-border pt-4 mt-auto bg-background z-20">
            <div className="bg-card/50 p-2.5 rounded-xl border border-border text-center">
              <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-mono">Incident Nodes</span>
              <p className="text-base font-bold text-primary mt-0.5">{activeIncident.nodes.length}</p>
            </div>
            <div className="bg-card/50 p-2.5 rounded-xl border border-border text-center">
              <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-mono">Active Streams</span>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {activeIncident.edges.filter(e => e.active).length}
              </p>
            </div>
            <div className="bg-card/50 p-2.5 rounded-xl border border-border text-center">
              <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-mono">Secure Channels</span>
              <p className="text-base font-bold text-indigo-500 mt-0.5">
                {activeIncident.nodes.reduce((acc, curr) => acc + curr.subNodes.length, 0)}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (col-span-3): Tactical Comms & Channel Intel */}
        <div className="lg:col-span-3 flex flex-col gap-5 bg-card border border-border rounded-3xl p-5 shadow-sm min-h-[500px]">
          
          <AnimatePresence mode="wait">
            {selectedNode ? (
              // Selected Node Intel Details
              <motion.div
                key="node-intel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex flex-col gap-5 h-full"
              >
                {/* Agency Title */}
                <div className="flex items-start justify-between border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="size-10 rounded-xl border-2 flex items-center justify-center bg-background"
                      style={{ borderColor: selectedNode.color }}
                    >
                      {React.createElement(selectedNode.icon, { className: "size-5", style: { color: selectedNode.color } })}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{selectedNode.label}</h3>
                      <span className="text-[9px] font-mono text-muted-foreground tracking-wider block">{selectedNode.ip}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedNodeId(null)}
                    className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Assigned Jurisdiction</span>
                  <p className="text-xs text-foreground/80 leading-relaxed bg-background border border-border p-3 rounded-xl">
                    {selectedNode.description}
                  </p>
                </div>

                {/* Sub-node details list */}
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Field Crew Status</span>
                  <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto pr-1">
                    {selectedNode.subNodes.map(sub => (
                      <div key={sub.id} className="flex items-center justify-between p-2 rounded-xl bg-background border border-border text-xs shadow-sm">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground/90">{sub.label}</span>
                          <span className="text-[9px] text-muted-foreground">{sub.role}</span>
                        </div>
                        <Badge variant="outline" className={cn(
                          "text-[8px] px-2 py-0.5 border-none",
                          sub.status === "online" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-500"
                        )}>
                          {sub.status.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Liaison Info */}
                <div className="bg-background/50 border border-border rounded-2xl p-3 flex flex-col gap-1">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">Liaison Officer</span>
                  <span className="text-xs font-semibold text-foreground/90">{selectedNode.liaison}</span>
                  <span className="text-[10px] font-mono text-primary">{selectedNode.frequency}</span>
                </div>

                <div className="flex-1" />

                {/* Comms Operations buttons */}
                <div className="flex flex-col gap-2 pt-2 border-t border-border mt-auto">
                  <Button 
                    className="w-full font-bold text-xs rounded-xl shadow-sm"
                    onClick={() => alert(`Broadcasting Video Link to ${selectedNode.name}`)}
                  >
                    <Video className="size-3.5 mr-2" /> Secure Live Feed
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full font-bold text-xs rounded-xl bg-background hover:bg-muted"
                    onClick={() => alert(`Calling radio channel ${selectedNode.frequency}`)}
                  >
                    <Radio className="size-3.5 mr-2" /> Patch Radio Link
                  </Button>
                </div>
              </motion.div>
            ) : (
              // Incident general logs / dispatch stream (Default View)
              <motion.div
                key="incident-logs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-4 h-full"
              >
                <div className="flex items-center gap-2 border-b border-border pb-4">
                  <Radio className="size-4 text-primary animate-pulse" />
                  <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Tactical Log Feed</h3>
                </div>

                {/* scrolling message stream */}
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[360px] pr-1 scrollbar-thin">
                  {activeIncident.logs.map((log, idx) => (
                    <div key={idx} className="flex flex-col gap-1 p-2.5 rounded-xl bg-background/80 border border-border text-xs shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary/90">{log.sender}</span>
                        <span className="text-[9px] font-mono text-muted-foreground">{log.timestamp}</span>
                      </div>
                      <p className="text-foreground/80 text-xs leading-relaxed mt-0.5">{log.message}</p>
                    </div>
                  ))}
                </div>

                {/* Comms Form Dispatch Input */}
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 mt-auto pt-3 border-t border-border">
                  <Input
                    placeholder="Broadcast to all sectors..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1 bg-background border-border text-foreground text-xs placeholder:text-muted-foreground rounded-xl"
                  />
                  <Button size="icon" type="submit" className="shrink-0 rounded-xl">
                    <Send className="size-3.5" />
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
