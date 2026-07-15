import { redirect } from "next/navigation";

/** Offers is the authority application; citizen reporting lives in ReportJe. */
export default function OffersHome() {
  redirect("/agency");
}
