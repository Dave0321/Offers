import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import {
  STATUS_FLOW,
  STATUS_META,
  type IssueStatus,
} from "@/lib/reportje-data";

export default function StatusTracker({ status }: { status: IssueStatus }) {
  const rejected = status === "rejected";
  const currentIndex = rejected
    ? STATUS_FLOW.length // show all steps muted for closed
    : STATUS_FLOW.indexOf(status);

  return (
    <div className="flex items-center w-full">
      {STATUS_FLOW.map((step, index) => {
        const done = !rejected && index < currentIndex;
        const active = !rejected && index === currentIndex;
        const isLast = index === STATUS_FLOW.length - 1;

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex size-7 items-center justify-center rounded-full border-2 text-xs transition-colors",
                  done && "border-success bg-success text-white",
                  active && "border-primary bg-primary text-primary-foreground",
                  !done && !active && "border-border bg-muted text-muted-foreground"
                )}
              >
                {done ? <Check className="size-4" /> : index + 1}
              </div>
              <span
                className={cn(
                  "text-[10px] uppercase text-center leading-tight max-w-16",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {STATUS_META[step].label}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-1 -mt-5 rounded-full",
                  done ? "bg-success" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
