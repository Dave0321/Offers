import React from "react";
import NumberFlow from "@number-flow/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bullet } from "@/components/ui/bullet";
import { cn } from "@/lib/utils";

interface DashboardStatProps {
  label: string;
  value: string;
  description?: string;
  tag?: string;
  icon: React.ElementType;
  intent?: "positive" | "negative" | "neutral";
  direction?: "up" | "down";
}

export default function DashboardStat({
  label,
  value,
  description,
  icon,
  tag,
  intent,
  direction,
}: DashboardStatProps) {
  const Icon = icon;

  const parseValue = (val: string) => {
    const match = val.match(/^([^\d.-]*)([+-]?\d*\.?\d+)([^\d]*)$/);
    if (match) {
      const [, prefix, numStr, suffix] = match;
      return {
        prefix: prefix || "",
        numericValue: parseFloat(numStr),
        suffix: suffix || "",
        isNumeric: !isNaN(parseFloat(numStr)),
      };
    }
    return { prefix: "", numericValue: 0, suffix: val, isNumeric: false };
  };

  const getIntentClassName = () => {
    if (intent === "positive") return "text-success";
    if (intent === "negative") return "text-destructive";
    return "text-muted-foreground";
  };

  const { prefix, numericValue, suffix, isNumeric } = parseValue(value);

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex items-center justify-between pb-1">
        <CardTitle className="flex items-center gap-2">
          <Bullet />
          <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
        </CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>

      <CardContent className="bg-accent flex-1 pt-3 md:pt-5 overflow-clip relative">
        <div className="flex items-end gap-2">
          <span className="text-4xl md:text-5xl font-display leading-none">
            {isNumeric ? (
              <NumberFlow
                value={numericValue}
                prefix={prefix}
                suffix={suffix}
              />
            ) : (
              value
            )}
          </span>
          {tag && (
            <Badge variant="default" className="uppercase ml-1 mb-0.5">
              {tag}
            </Badge>
          )}
        </div>

        {description && (
          <p className="text-sm text-muted-foreground mt-2 tracking-wide uppercase">
            {description}
          </p>
        )}

        {/* Marquee Animation */}
        {direction && (
          <div className="absolute top-0 right-0 w-14 h-full pointer-events-none overflow-hidden group">
            <div
              className={cn(
                "flex flex-col transition-all duration-500",
                "group-hover:scale-105 group-hover:brightness-110",
                getIntentClassName(),
                direction === "up" ? "animate-marquee-up" : "animate-marquee-down"
              )}
            >
              <div className={cn("flex", direction === "up" ? "flex-col-reverse" : "flex-col")}>
                {Array.from({ length: 6 }, (_, i) => (
                  <Arrow key={i} direction={direction} index={i} />
                ))}
              </div>
              <div className={cn("flex", direction === "up" ? "flex-col-reverse" : "flex-col")}>
                {Array.from({ length: 6 }, (_, i) => (
                  <Arrow key={i} direction={direction} index={i} />
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ArrowProps {
  direction: "up" | "down";
  index: number;
}

const Arrow = ({ direction, index }: ArrowProps) => {
  const staggerDelay = index * 0.15;
  const phaseDelay = (index % 3) * 0.8;

  return (
    <span
      style={{
        animationDelay: `${staggerDelay + phaseDelay}s`,
        animationDuration: "3s",
        animationTimingFunction: "cubic-bezier(0.4, 0.0, 0.2, 1)",
      }}
      className={cn(
        "text-center text-5xl size-14 font-display leading-none block",
        "transition-all duration-700 ease-out",
        "animate-marquee-pulse",
        "will-change-transform"
      )}
    >
      {direction === "up" ? "↑" : "↓"}
    </span>
  );
};
