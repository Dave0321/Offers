// ReportJe - Civic issue reporting platform mock data & domain model

export type IssueCategory =
  | "road"
  | "tree"
  | "streetlight"
  | "drainage"
  | "waste"
  | "other";

export type IssueStatus =
  | "submitted"
  | "acknowledged"
  | "in_progress"
  | "resolved"
  | "rejected";

export type IssuePriority = "low" | "medium" | "high" | "urgent";

export type Role = "citizen" | "agency";

export interface TimelineEvent {
  status: IssueStatus | "note";
  label: string;
  note: string;
  actor: string;
  date: string; // ISO
}

export interface Issue {
  id: string; // e.g. RPJ-2041
  title: string;
  category: IssueCategory;
  description: string;
  location: string;
  area: string; // council / district
  agency: string;
  status: IssueStatus;
  priority: IssuePriority;
  reportedBy: string;
  reporterHandle: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  upvotes: number;
  image?: string;
  timeline: TimelineEvent[];
}

export const CATEGORY_META: Record<
  IssueCategory,
  { label: string; icon: string; blurb: string }
> = {
  road: { label: "Road & Pothole", icon: "TrafficCone", blurb: "Damaged roads, potholes, cracks" },
  tree: { label: "Fallen Tree", icon: "TreePine", blurb: "Fallen or dangerous trees & branches" },
  streetlight: { label: "Streetlight", icon: "Lightbulb", blurb: "Broken or flickering street lamps" },
  drainage: { label: "Drainage & Flood", icon: "Droplets", blurb: "Clogged drains, flooding, leaks" },
  waste: { label: "Waste & Cleanliness", icon: "Trash2", blurb: "Illegal dumping, uncollected rubbish" },
  other: { label: "Other", icon: "CircleAlert", blurb: "Anything else needing attention" },
};

export const STATUS_META: Record<
  IssueStatus,
  { label: string; variant: "default" | "secondary" | "outline-warning" | "outline-success" | "outline-destructive" }
> = {
  submitted: { label: "Submitted", variant: "secondary" },
  acknowledged: { label: "Acknowledged", variant: "outline" as never },
  in_progress: { label: "In Progress", variant: "outline-warning" },
  resolved: { label: "Resolved", variant: "outline-success" },
  rejected: { label: "Closed", variant: "outline-destructive" },
};

export const PRIORITY_META: Record<
  IssuePriority,
  { label: string; variant: "secondary" | "outline-warning" | "outline-destructive" }
> = {
  low: { label: "Low", variant: "secondary" },
  medium: { label: "Medium", variant: "secondary" },
  high: { label: "High", variant: "outline-warning" },
  urgent: { label: "Urgent", variant: "outline-destructive" },
};

// Order of the resolution pipeline used for progress trackers
export const STATUS_FLOW: IssueStatus[] = [
  "submitted",
  "acknowledged",
  "in_progress",
  "resolved",
];

export const AGENCIES: { id: string; name: string; area: string; handles: IssueCategory[] }[] = [
  { id: "dbkl", name: "DBKL — Kuala Lumpur City Hall", area: "Kuala Lumpur", handles: ["road", "streetlight", "drainage", "waste", "other"] },
  { id: "mbpj", name: "MBPJ — Petaling Jaya City Council", area: "Petaling Jaya", handles: ["road", "tree", "streetlight", "waste"] },
  { id: "mbsa", name: "MBSA — Shah Alam City Council", area: "Shah Alam", handles: ["road", "drainage", "tree", "waste"] },
  { id: "jps", name: "JPS — Dept. of Irrigation & Drainage", area: "Selangor", handles: ["drainage"] },
  { id: "tnb", name: "TNB — National Electricity", area: "Nationwide", handles: ["streetlight"] },
];

export function suggestAgency(category: IssueCategory, area: string): string {
  const match = AGENCIES.find(
    (a) => a.handles.includes(category) && a.area.toLowerCase().includes(area.toLowerCase())
  );
  if (match) return match.name;
  const byCategory = AGENCIES.find((a) => a.handles.includes(category));
  return byCategory?.name ?? "General Municipal Services";
}

export const ISSUES: Issue[] = [
  {
    id: "RPJ-2087",
    title: "Deep pothole causing motorbike accidents",
    category: "road",
    description:
      "A large pothole roughly 40cm wide has formed on Jalan Ampang near the LRT exit. Several motorcyclists have swerved to avoid it during rain.",
    location: "Jalan Ampang, near KLCC LRT",
    area: "Kuala Lumpur",
    agency: "DBKL — Kuala Lumpur City Hall",
    status: "in_progress",
    priority: "urgent",
    reportedBy: "Nur Aisyah",
    reporterHandle: "@aisyah",
    createdAt: "2026-07-05T08:12:00Z",
    updatedAt: "2026-07-10T09:30:00Z",
    upvotes: 42,
    image: "/issues/pothole.png",
    timeline: [
      { status: "submitted", label: "Report submitted", note: "Reported via mobile with photo and GPS pin.", actor: "Nur Aisyah", date: "2026-07-05T08:12:00Z" },
      { status: "acknowledged", label: "Acknowledged by agency", note: "DBKL Roads Division confirmed and logged the case.", actor: "DBKL", date: "2026-07-06T10:05:00Z" },
      { status: "in_progress", label: "Crew dispatched", note: "Patching crew scheduled. Temporary cones placed on site.", actor: "DBKL Field Team", date: "2026-07-10T09:30:00Z" },
    ],
  },
  {
    id: "RPJ-2091",
    title: "Large tree branch blocking pedestrian walkway",
    category: "tree",
    description:
      "Heavy rain last night brought down a large branch across the pavement. Pedestrians are forced onto the road.",
    location: "Jalan SS2/24, Petaling Jaya",
    area: "Petaling Jaya",
    agency: "MBPJ — Petaling Jaya City Council",
    status: "acknowledged",
    priority: "high",
    reportedBy: "David Tan",
    reporterHandle: "@davidt",
    createdAt: "2026-07-09T22:40:00Z",
    updatedAt: "2026-07-10T07:15:00Z",
    upvotes: 18,
    image: "/issues/tree.png",
    timeline: [
      { status: "submitted", label: "Report submitted", note: "Submitted with 2 photos.", actor: "David Tan", date: "2026-07-09T22:40:00Z" },
      { status: "acknowledged", label: "Acknowledged by agency", note: "MBPJ Landscape Unit received the report and is scheduling removal.", actor: "MBPJ", date: "2026-07-10T07:15:00Z" },
    ],
  },
  {
    id: "RPJ-2065",
    title: "Streetlight out for over a week — dark junction",
    category: "streetlight",
    description:
      "The streetlight at the junction has been off for 8 days, making the crossing dangerous at night.",
    location: "Jalan Kuchai Lama junction",
    area: "Kuala Lumpur",
    agency: "TNB — National Electricity",
    status: "resolved",
    priority: "medium",
    reportedBy: "Nur Aisyah",
    reporterHandle: "@aisyah",
    createdAt: "2026-06-28T19:05:00Z",
    updatedAt: "2026-07-03T14:20:00Z",
    upvotes: 27,
    image: "/issues/streetlight.png",
    timeline: [
      { status: "submitted", label: "Report submitted", note: "Reported after dark.", actor: "Nur Aisyah", date: "2026-06-28T19:05:00Z" },
      { status: "acknowledged", label: "Acknowledged by agency", note: "TNB logged the fault reference LT-8841.", actor: "TNB", date: "2026-06-29T09:00:00Z" },
      { status: "in_progress", label: "Technician assigned", note: "Faulty ballast identified, replacement ordered.", actor: "TNB Field", date: "2026-07-01T11:30:00Z" },
      { status: "resolved", label: "Issue resolved", note: "Lamp replaced and tested. Junction now lit.", actor: "TNB Field", date: "2026-07-03T14:20:00Z" },
    ],
  },
  {
    id: "RPJ-2093",
    title: "Clogged drain flooding the back lane",
    category: "drainage",
    description:
      "The monsoon drain behind the shoplots is blocked with debris, water backs up into the lane after rain.",
    location: "Seksyen 14 back lane, Shah Alam",
    area: "Shah Alam",
    agency: "JPS — Dept. of Irrigation & Drainage",
    status: "submitted",
    priority: "high",
    reportedBy: "Farah Idris",
    reporterHandle: "@farah",
    createdAt: "2026-07-10T06:50:00Z",
    updatedAt: "2026-07-10T06:50:00Z",
    upvotes: 9,
    image: "/issues/drainage.png",
    timeline: [
      { status: "submitted", label: "Report submitted", note: "Awaiting agency triage.", actor: "Farah Idris", date: "2026-07-10T06:50:00Z" },
    ],
  },
  {
    id: "RPJ-2072",
    title: "Illegal dumping of construction waste",
    category: "waste",
    description:
      "A pile of construction debris and old furniture has been dumped on the empty lot next to the playground.",
    location: "Taman Melawati open field",
    area: "Kuala Lumpur",
    agency: "DBKL — Kuala Lumpur City Hall",
    status: "in_progress",
    priority: "medium",
    reportedBy: "David Tan",
    reporterHandle: "@davidt",
    createdAt: "2026-07-02T13:20:00Z",
    updatedAt: "2026-07-08T10:00:00Z",
    upvotes: 15,
    image: "/issues/waste.png",
    timeline: [
      { status: "submitted", label: "Report submitted", note: "Photos of the dumping site attached.", actor: "David Tan", date: "2026-07-02T13:20:00Z" },
      { status: "acknowledged", label: "Acknowledged by agency", note: "DBKL Enforcement opened investigation.", actor: "DBKL", date: "2026-07-03T09:40:00Z" },
      { status: "in_progress", label: "Cleanup scheduled", note: "Contractor scheduled to clear the lot this week.", actor: "DBKL Enforcement", date: "2026-07-08T10:00:00Z" },
    ],
  },
  {
    id: "RPJ-2058",
    title: "Faded road markings at school crossing",
    category: "road",
    description:
      "The zebra crossing markings outside the primary school are almost invisible, risky during school hours.",
    location: "SK Taman Tun, Kuala Lumpur",
    area: "Kuala Lumpur",
    agency: "DBKL — Kuala Lumpur City Hall",
    status: "resolved",
    priority: "medium",
    reportedBy: "Farah Idris",
    reporterHandle: "@farah",
    createdAt: "2026-06-20T07:30:00Z",
    updatedAt: "2026-06-27T16:00:00Z",
    upvotes: 33,
    timeline: [
      { status: "submitted", label: "Report submitted", note: "Reported before morning drop-off.", actor: "Farah Idris", date: "2026-06-20T07:30:00Z" },
      { status: "acknowledged", label: "Acknowledged by agency", note: "DBKL Traffic Unit reviewed.", actor: "DBKL", date: "2026-06-22T09:00:00Z" },
      { status: "in_progress", label: "Repainting scheduled", note: "Line-marking crew booked.", actor: "DBKL Traffic Unit", date: "2026-06-25T08:00:00Z" },
      { status: "resolved", label: "Issue resolved", note: "Crossing repainted with reflective paint.", actor: "DBKL Traffic Unit", date: "2026-06-27T16:00:00Z" },
    ],
  },
  {
    id: "RPJ-2094",
    title: "Broken manhole cover on busy street",
    category: "other",
    description:
      "A manhole cover is cracked and shifts when vehicles drive over it, creating loud noise and a hazard.",
    location: "Jalan Tun Razak service road",
    area: "Kuala Lumpur",
    agency: "DBKL — Kuala Lumpur City Hall",
    status: "submitted",
    priority: "urgent",
    reportedBy: "Nur Aisyah",
    reporterHandle: "@aisyah",
    createdAt: "2026-07-10T11:05:00Z",
    updatedAt: "2026-07-10T11:05:00Z",
    upvotes: 6,
    timeline: [
      { status: "submitted", label: "Report submitted", note: "Awaiting agency triage.", actor: "Nur Aisyah", date: "2026-07-10T11:05:00Z" },
    ],
  },
  {
    id: "RPJ-2049",
    title: "Overflowing public bins at market",
    category: "waste",
    description:
      "Public bins at the morning market are overflowing every weekend, attracting pests.",
    location: "Pasar Chow Kit",
    area: "Kuala Lumpur",
    agency: "DBKL — Kuala Lumpur City Hall",
    status: "rejected",
    priority: "low",
    reportedBy: "David Tan",
    reporterHandle: "@davidt",
    createdAt: "2026-06-15T09:00:00Z",
    updatedAt: "2026-06-18T15:30:00Z",
    upvotes: 4,
    timeline: [
      { status: "submitted", label: "Report submitted", note: "Weekend overflow reported.", actor: "David Tan", date: "2026-06-15T09:00:00Z" },
      { status: "acknowledged", label: "Acknowledged by agency", note: "Reviewed by DBKL Solid Waste.", actor: "DBKL", date: "2026-06-16T10:00:00Z" },
      { status: "rejected", label: "Closed — duplicate", note: "Merged with existing scheduled collection upgrade RPJ-2011.", actor: "DBKL Solid Waste", date: "2026-06-18T15:30:00Z" },
    ],
  },
];

// The signed-in citizen (mock)
export const CURRENT_CITIZEN = {
  name: "Nur Aisyah",
  handle: "@aisyah",
  email: "aisyah@warga.my",
  area: "Kuala Lumpur",
  avatar: "/avatars/user_mati.png",
};

// The signed-in agency officer (mock)
export const CURRENT_AGENCY = {
  name: "DBKL Ops",
  officer: "En. Kamal",
  email: "ops@dbkl.gov.my",
  area: "Kuala Lumpur",
  avatar: "/avatars/user_krimson.png",
  agency: "DBKL — Kuala Lumpur City Hall",
};

// ---- Derived helpers ----

export function getCitizenIssues(): Issue[] {
  return ISSUES.filter((i) => i.reporterHandle === CURRENT_CITIZEN.handle);
}

export function getAgencyIssues(): Issue[] {
  return ISSUES.filter((i) => i.agency === CURRENT_AGENCY.agency);
}

export function countByStatus(issues: Issue[]): Record<IssueStatus, number> {
  const base: Record<IssueStatus, number> = {
    submitted: 0,
    acknowledged: 0,
    in_progress: 0,
    resolved: 0,
    rejected: 0,
  };
  for (const i of issues) base[i.status]++;
  return base;
}

export function categoryBreakdown(issues: Issue[]) {
  const map = new Map<IssueCategory, number>();
  for (const i of issues) map.set(i.category, (map.get(i.category) ?? 0) + 1);
  return Array.from(map.entries()).map(([category, count]) => ({
    category,
    label: CATEGORY_META[category].label,
    count,
  }));
}

export function formatRelative(iso: string): string {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${Math.max(mins, 1)}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString("en-MY", { day: "numeric", month: "short" });
}

// Weekly reports vs resolved trend for charts
export const REPORT_TRENDS = {
  week: [
    { date: "Mon", reported: 12, resolved: 8 },
    { date: "Tue", reported: 18, resolved: 11 },
    { date: "Wed", reported: 9, resolved: 14 },
    { date: "Thu", reported: 22, resolved: 10 },
    { date: "Fri", reported: 16, resolved: 19 },
    { date: "Sat", reported: 7, resolved: 12 },
    { date: "Sun", reported: 5, resolved: 9 },
  ],
  month: [
    { date: "Wk 1", reported: 64, resolved: 48 },
    { date: "Wk 2", reported: 72, resolved: 61 },
    { date: "Wk 3", reported: 58, resolved: 66 },
    { date: "Wk 4", reported: 81, resolved: 70 },
  ],
  year: [
    { date: "Jan", reported: 210, resolved: 180 },
    { date: "Feb", reported: 240, resolved: 205 },
    { date: "Mar", reported: 300, resolved: 260 },
    { date: "Apr", reported: 280, resolved: 270 },
    { date: "May", reported: 320, resolved: 290 },
    { date: "Jun", reported: 360, resolved: 330 },
  ],
};

export const NOTIFICATIONS = [
  {
    id: "n1",
    title: "RPJ-2087 UPDATE",
    message: "Crew dispatched for the pothole on Jalan Ampang. Cones placed on site.",
    timestamp: "2026-07-10T09:30:00Z",
    type: "info" as const,
    read: false,
    priority: "high" as const,
  },
  {
    id: "n2",
    title: "RPJ-2065 RESOLVED",
    message: "Your streetlight report at Kuchai Lama has been marked resolved.",
    timestamp: "2026-07-03T14:20:00Z",
    type: "success" as const,
    read: false,
    priority: "medium" as const,
  },
  {
    id: "n3",
    title: "NEW NEARBY REPORT",
    message: "A drainage issue was reported near you in Seksyen 14.",
    timestamp: "2026-07-10T06:50:00Z",
    type: "warning" as const,
    read: true,
    priority: "low" as const,
  },
  {
    id: "n4",
    title: "COMMUNITY MILESTONE",
    message: "Your area crossed 1,000 resolved issues this year. Thank you.",
    timestamp: "2026-07-09T18:00:00Z",
    type: "success" as const,
    read: true,
    priority: "low" as const,
  },
];
