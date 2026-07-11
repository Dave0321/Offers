import { Suspense } from "react";
import type { Metadata } from "next";
import DashboardPageLayout from "@/components/dashboard/layout";
import ReportForm from "@/components/reportje/report-form";
import { FilePlus2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Report an Issue",
};

export default function ReportPage() {
  return (
    <DashboardPageLayout
      header={{
        title: "Report an Issue",
        description: "Routed to the right agency",
        icon: FilePlus2,
      }}
    >
      <Suspense fallback={<div className="text-muted-foreground">Loading form…</div>}>
        <ReportForm />
      </Suspense>
    </DashboardPageLayout>
  );
}
