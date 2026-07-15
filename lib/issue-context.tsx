"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { NOTIFICATIONS, type Issue, type IssueStatus, STATUS_META } from "@/lib/reportje-data";
import type { Notification } from "@/types/dashboard";
import { addGovernmentComplaintNote, getGovernmentComplaints, updateGovernmentComplaintStatus } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface IssueContextType {
  issues: Issue[];
  notifications: Notification[];
  apiError: string | null;
  addIssue: (issue: Issue) => void;
  updateIssueStatus: (id: string, status: IssueStatus, note: string, actor: string) => void;
  markAllNotificationsRead: () => void;
}

const IssueContext = createContext<IssueContextType | undefined>(undefined);

export function IssueProvider({ children }: { children: ReactNode }) {
  const { user, role } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS as Notification[]);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (role !== "agency" || !user?.accessToken) {
      setIssues([]);
      setApiError(null);
      return;
    }
    setApiError(null);
    getGovernmentComplaints(user.accessToken)
      .then((complaints) => setIssues(complaints.map((complaint) => ({
        id: complaint.id,
        title: complaint.issue_type.replaceAll("_", " "),
        category: toCategory(complaint.issue_type),
        description: complaint.raw_input_text || "No description provided.",
        location: complaint.maps_link || "Location available in case details",
        area: "Assigned authority",
        agency: "Assigned authority",
        status: toIssueStatus(complaint.status),
        priority: "medium",
        reportedBy: "Citizen",
        reporterHandle: "reportje",
        createdAt: complaint.created_at,
        updatedAt: complaint.created_at,
        upvotes: 0,
        image: complaint.photo_urls[0],
        timeline: [{ status: toIssueStatus(complaint.status), label: "Report received", note: "Submitted through ReportJe.", actor: "ReportJe", date: complaint.created_at }],
      }))))
      .catch((error: unknown) => setApiError(error instanceof Error ? error.message : "Unable to load assigned complaints."));
  }, [role, user?.accessToken]);

  const addIssue = (issue: Issue) => {
    setIssues((prev) => [issue, ...prev]);
  };

  const updateIssueStatus = (id: string, status: IssueStatus, note: string, actor: string) => {
    if (!user?.accessToken) return;
    void (async () => {
      try {
        if (note.trim()) {
          await addGovernmentComplaintNote(user.accessToken!, id, { note_text: note, is_shared: true });
        }
        await updateGovernmentComplaintStatus(user.accessToken!, id, {
          status: toGovernmentStatus(status),
          resolution_note: status === "resolved" ? note || undefined : undefined,
        });
        setIssues((prev) => prev.map((issue) => issue.id === id ? {
          ...issue,
          status,
          updatedAt: new Date().toISOString(),
          timeline: [...issue.timeline, {
            status,
            label: `Marked ${STATUS_META[status].label}`,
            note: note || `Status updated to ${STATUS_META[status].label}.`,
            actor,
            date: new Date().toISOString(),
          }],
        } : issue));
      } catch (error) {
        console.error("Unable to update complaint", error);
        setApiError(error instanceof Error ? error.message : "Unable to update this complaint.");
      }
    })();
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <IssueContext.Provider
      value={{
        issues,
        notifications,
        apiError,
        addIssue,
        updateIssueStatus,
        markAllNotificationsRead,
      }}
    >
      {children}
    </IssueContext.Provider>
  );
}

function toCategory(issueType: string): Issue["category"] {
  if (issueType.includes("TREE")) return "tree";
  if (issueType.includes("LIGHT")) return "streetlight";
  if (issueType.includes("DRAIN") || issueType.includes("FLOOD") || issueType.includes("WATER") || issueType.includes("SEWAGE")) return "drainage";
  if (issueType.includes("DUMP") || issueType.includes("WASTE")) return "waste";
  if (issueType.includes("ROAD") || issueType.includes("PAVEMENT")) return "road";
  return "other";
}

function toIssueStatus(status: string): IssueStatus {
  if (status === "ACKNOWLEDGED") return "acknowledged";
  if (status === "IN_PROGRESS") return "in_progress";
  if (status === "RESOLVED") return "resolved";
  if (status === "CLOSED") return "rejected";
  return "submitted";
}

function toGovernmentStatus(status: IssueStatus) {
  if (status === "acknowledged") return "ACKNOWLEDGED" as const;
  if (status === "in_progress") return "IN_PROGRESS" as const;
  if (status === "resolved") return "RESOLVED" as const;
  if (status === "rejected") return "CLOSED" as const;
  return "OPEN" as const;
}

export function useIssues() {
  const context = useContext(IssueContext);
  if (context === undefined) {
    throw new Error("useIssues must be used within an IssueProvider");
  }
  return context;
}
