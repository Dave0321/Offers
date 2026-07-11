"use client";

import * as React from "react";
import { XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bullet } from "@/components/ui/bullet";
import { REPORT_TRENDS } from "@/lib/reportje-data";

type Period = "week" | "month" | "year";

const chartConfig = {
  reported: { label: "Reported", color: "var(--chart-1)" },
  resolved: { label: "Resolved", color: "var(--chart-3)" },
} satisfies ChartConfig;

export default function TrendsChart() {
  const [period, setPeriod] = React.useState<Period>("week");

  const data = REPORT_TRENDS[period];

  const renderChart = (rows: { date: string; reported: number; resolved: number }[]) => (
    <div className="bg-accent rounded-lg p-3">
      <ChartContainer className="md:aspect-[3/1] w-full" config={chartConfig}>
        <AreaChart
          accessibilityLayer
          data={rows}
          margin={{ left: -12, right: 12, top: 12, bottom: 12 }}
        >
          <defs>
            <linearGradient id="fillReported" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-reported)" stopOpacity={0.7} />
              <stop offset="95%" stopColor="var(--color-reported)" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="fillResolved" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-resolved)" stopOpacity={0.7} />
              <stop offset="95%" stopColor="var(--color-resolved)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid
            horizontal={false}
            strokeDasharray="8 8"
            strokeWidth={2}
            stroke="var(--muted-foreground)"
            opacity={0.2}
          />
          <XAxis
            dataKey="date"
            tickLine={false}
            tickMargin={12}
            strokeWidth={1.5}
            className="uppercase text-sm fill-muted-foreground"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={0}
            tickCount={6}
            className="text-sm fill-muted-foreground"
            domain={[0, "dataMax"]}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" className="min-w-[180px] px-4 py-3" />}
          />
          <Area
            dataKey="reported"
            type="monotone"
            fill="url(#fillReported)"
            stroke="var(--color-reported)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Area
            dataKey="resolved"
            type="monotone"
            fill="url(#fillResolved)"
            stroke="var(--color-resolved)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );

  return (
    <Tabs
      value={period}
      onValueChange={(v) => setPeriod(v as Period)}
      className="max-md:gap-4"
    >
      <div className="flex items-center justify-between mb-4 max-md:contents">
        <TabsList className="max-md:w-full">
          <TabsTrigger value="week">WEEK</TabsTrigger>
          <TabsTrigger value="month">MONTH</TabsTrigger>
          <TabsTrigger value="year">YEAR</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-6 max-md:order-1">
          {Object.entries(chartConfig).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2 uppercase">
              <Bullet style={{ backgroundColor: value.color }} className="rotate-45" />
              <span className="text-sm font-medium text-muted-foreground">
                {value.label}
              </span>
            </div>
          ))}
        </div>
      </div>
      <TabsContent value="week" className="space-y-4">{renderChart(data)}</TabsContent>
      <TabsContent value="month" className="space-y-4">{renderChart(data)}</TabsContent>
      <TabsContent value="year" className="space-y-4">{renderChart(data)}</TabsContent>
    </Tabs>
  );
}
