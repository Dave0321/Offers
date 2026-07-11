"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { ISSUES, NOTIFICATIONS, type Issue, type IssueStatus, type IssuePriority, STATUS_META } from "@/lib/reportje-data";
import type { Notification } from "@/types/dashboard";

interface IssueContextType {
  issues: Issue[];
  notifications: Notification[];
  addIssue: (issue: Issue) => void;
  updateIssueStatus: (id: string, status: IssueStatus, note: string, actor: string) => void;
  markAllNotificationsRead: () => void;
}

const IssueContext = createContext<IssueContextType | undefined>(undefined);

export function IssueProvider({ children }: { children: ReactNode }) {
  const [issues, setIssues] = useState<Issue[]>(() =>
    ISSUES.map((i) => ({ ...i, timeline: [...i.timeline] }))
  );
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS as Notification[]);

  const addIssue = (issue: Issue) => {
    setIssues((prev) => [issue, ...prev]);
  };

  const updateIssueStatus = (id: string, status: IssueStatus, note: string, actor: string) => {
    setIssues((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              status,
              updatedAt: new Date().toISOString(),
              timeline: [
                ...i.timeline,
                {
                  status,
                  label: `Marked ${STATUS_META[status].label}`,
                  note: note || `Status updated to ${STATUS_META[status].label}.`,
                  actor,
                  date: new Date().toISOString(),
                },
              ],
            }
          : i
      )
    );

    // Also push a notification to the citizen
    const issueToUpdate = issues.find((i) => i.id === id);
    if (issueToUpdate) {
      const newNotif: Notification = {
        id: `notif-${Date.now()}`,
        type: status === "resolved" ? "success" : "info",
        title: `Update on ${issueToUpdate.title}`,
        message: note || `The agency has updated the status to ${STATUS_META[status].label}.`,
        timestamp: new Date().toISOString(),
        read: false,
        priority: "normal",
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <IssueContext.Provider
      value={{
        issues,
        notifications,
        addIssue,
        updateIssueStatus,
        markAllNotificationsRead,
      }}
    >
      {children}
    </IssueContext.Provider>
  );
}

export function useIssues() {
  const context = useContext(IssueContext);
  if (context === undefined) {
    throw new Error("useIssues must be used within an IssueProvider");
  }
  return context;
}
