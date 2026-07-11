import type { Metadata } from "next";
import AgencyDashboardView from "@/components/reportje/agency-dashboard";
import { getAgencyIssues } from "@/lib/reportje-data";

export const metadata: Metadata = {
  title: "Agency Command Center",
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AgencyPage({ searchParams }: Props) {
  const issues = getAgencyIssues();
  await searchParams; // Wait for params to resolve if needed, though unused here directly now

  return (
    <div className="px-4 lg:px-6 py-6 md:py-8">
      <AgencyDashboardView issues={issues} />
    </div>
  );
}
