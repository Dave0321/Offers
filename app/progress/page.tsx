import type { Metadata } from "next";
import DashboardPageLayout from "@/components/dashboard/layout";
import ProgressView from "@/components/reportje/progress-view";
import { ListChecks } from "lucide-react";
import { getCitizenIssues } from "@/lib/reportje-data";

export const metadata: Metadata = {
  title: "Track Progress",
};

export default function ProgressPage() {
  const issues = getCitizenIssues();

  return (
    <DashboardPageLayout
      header={{
        title: "Track Progress",
        description: `${issues.length} reports`,
        icon: ListChecks,
      }}
    >
      <ProgressView issues={issues} />
    </DashboardPageLayout>
  );
}
