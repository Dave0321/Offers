import Image from "next/image";
import { MapPin, Building2, ArrowBigUp, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryIcon, StatusBadge, PriorityBadge } from "@/components/reportje/ui";
import { formatRelative, type Issue } from "@/lib/reportje-data";

export default function IssueCard({ issue }: { issue: Issue }) {
  return (
    <Card className="w-full">
      <CardContent className="bg-card p-0 overflow-hidden">
        <div className="flex gap-3 p-3">
          {issue.image ? (
            <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-muted">
              <Image
                src={issue.image || "/placeholder.svg"}
                alt={issue.title}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex size-20 shrink-0 items-center justify-center rounded-md bg-accent text-primary">
              <CategoryIcon category={issue.category} className="size-8" />
            </div>
          )}

          <div className="flex flex-1 flex-col gap-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                {issue.id}
              </span>
              <StatusBadge status={issue.status} />
            </div>
            <h3 className="font-display text-lg leading-tight text-pretty line-clamp-2">
              {issue.title}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" /> {issue.location}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
            <Building2 className="size-3.5 shrink-0" />
            <span className="truncate">{issue.agency}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <PriorityBadge priority={issue.priority} />
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <ArrowBigUp className="size-3.5" /> {issue.upvotes}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3.5" /> {formatRelative(issue.updatedAt)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
