import {
  TrafficCone,
  TreePine,
  Lightbulb,
  Droplets,
  Trash2,
  CircleAlert,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CATEGORY_META,
  STATUS_META,
  PRIORITY_META,
  type IssueCategory,
  type IssueStatus,
  type IssuePriority,
} from "@/lib/reportje-data";

export const CATEGORY_ICONS: Record<IssueCategory, LucideIcon> = {
  road: TrafficCone,
  tree: TreePine,
  streetlight: Lightbulb,
  drainage: Droplets,
  waste: Trash2,
  other: CircleAlert,
};

export function CategoryIcon({
  category,
  className,
}: {
  category: IssueCategory;
  className?: string;
}) {
  const Icon = CATEGORY_ICONS[category];
  return <Icon className={cn("size-5", className)} aria-hidden />;
}

export function StatusBadge({ status }: { status: IssueStatus }) {
  const meta = STATUS_META[status];
  return (
    <Badge variant={meta.variant as never} className="uppercase">
      {meta.label}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: IssuePriority }) {
  const meta = PRIORITY_META[priority];
  return (
    <Badge variant={meta.variant} className="uppercase">
      {meta.label}
    </Badge>
  );
}

export function CategoryLabel({ category }: { category: IssueCategory }) {
  return <>{CATEGORY_META[category].label}</>;
}
