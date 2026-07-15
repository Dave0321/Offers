import type { Metadata } from "next";
import AgencyDashboardView from "@/components/reportje/agency-dashboard";

export const metadata: Metadata = {
  title: "Agency Command Center",
};

export default function AgencyPage() {
  return (
    <div className="px-4 lg:px-6 py-6 md:py-8">
      <AgencyDashboardView />
    </div>
  );
}
