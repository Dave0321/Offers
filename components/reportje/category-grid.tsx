import Link from "next/link";
import { CATEGORY_META, type IssueCategory } from "@/lib/reportje-data";
import { CATEGORY_ICONS } from "@/components/reportje/ui";

const ORDER: IssueCategory[] = [
  "road",
  "tree",
  "streetlight",
  "drainage",
  "waste",
  "other",
];

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {ORDER.map((cat) => {
        const Icon = CATEGORY_ICONS[cat];
        const meta = CATEGORY_META[cat];
        return (
          <Link
            key={cat}
            href={`/report?category=${cat}`}
            className="group flex flex-col gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary hover:bg-accent"
          >
            <div className="flex size-10 items-center justify-center rounded-md bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="size-5" />
            </div>
            <div>
              <div className="font-display text-base leading-tight">
                {meta.label}
              </div>
              <p className="text-xs text-muted-foreground leading-snug mt-0.5">
                {meta.blurb}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
