export interface OfficerSession {
  accessToken: string;
  email: string;
}

export interface GovernmentComplaint {
  id: string;
  issue_type: string;
  status: "OPEN" | "ACKNOWLEDGED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  raw_input_text: string | null;
  photo_urls: string[];
  maps_link: string | null;
  routing_source: string | null;
  parent_id: string | null;
  created_at: string;
}

export interface AuthorityStats {
  total_this_month: number;
  open_count: number;
  resolved_count: number;
  average_resolution_hours: number | null;
}

export interface IncidentNode {
  complaint_id: string;
  authority_code: string | null;
  authority_name: string | null;
  status: string;
  role: "LEAD" | "ASSIST" | "INFORMED" | null;
  reason: string | null;
}

export interface IncidentUpdate {
  id: string;
  authority_code: string;
  update_text: string;
  created_at: string;
}

export interface IncidentNetwork {
  parent_id: string;
  nodes: IncidentNode[];
  updates: IncidentUpdate[];
}

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

const apiBaseUrl = () => (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");

async function apiRequest<T>(path: string, accessToken: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${accessToken}`, ...(init?.headers || {}) },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { detail?: string } | null;
    throw new ApiError(body?.detail || "The service could not complete your request.", response.status);
  }
  return response.json() as Promise<T>;
}

export async function signInOfficer(email: string, password: string): Promise<OfficerSession> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    throw new ApiError("Officer sign-in is not configured. Set the Offers Supabase environment variables.", 503);
  }
  const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: anonKey },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => null) as { msg?: string; error_description?: string; message?: string } | null;
    throw new ApiError(error?.msg || error?.error_description || error?.message || "Invalid officer email or password.", response.status);
  }
  const body = await response.json() as { access_token: string; user: { email?: string } };
  return { accessToken: body.access_token, email: body.user.email || email };
}

export const getGovernmentComplaints = (token: string) => apiRequest<GovernmentComplaint[]>("/gov/complaints", token);
export const getAuthorityStats = (token: string) => apiRequest<AuthorityStats>("/gov/stats", token);
export const updateGovernmentComplaintStatus = (token: string, complaintId: string, payload: { status: GovernmentComplaint["status"]; resolution_note?: string }) =>
  apiRequest(`/gov/complaints/${complaintId}/status`, token, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
export const addGovernmentComplaintNote = (token: string, complaintId: string, payload: { note_text: string; is_shared: boolean }) =>
  apiRequest(`/gov/complaints/${complaintId}/notes`, token, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
export const getIncidentNetwork = (token: string, parentId: string) =>
  apiRequest<IncidentNetwork>(`/gov/incidents/${parentId}/network`, token);
export const addIncidentUpdate = (token: string, parentId: string, payload: { update_text: string }) =>
  apiRequest<IncidentUpdate>(`/gov/incidents/${parentId}/updates`, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
