"use client";

import dynamic from "next/dynamic";
import { type ComponentType } from "react";

// Chart component types
type AnyComponent = ComponentType<Record<string, unknown>>;

// Chart component types
export const DynamicBarChart = dynamic(
  () => import("recharts").then((mod) => mod.BarChart as unknown as AnyComponent),
  { ssr: false }
);

export const DynamicLineChart = dynamic(
  () => import("recharts").then((mod) => mod.LineChart as unknown as AnyComponent),
  { ssr: false }
);

export const DynamicAreaChart = dynamic(
  () => import("recharts").then((mod) => mod.AreaChart as unknown as AnyComponent),
  { ssr: false }
);

export const DynamicScatterChart = dynamic(
  () => import("recharts").then((mod) => mod.ScatterChart as unknown as AnyComponent),
  { ssr: false }
);

// Chart sub-components - lazy loaded
export const DynamicBar = dynamic(
  () => import("recharts").then((mod) => mod.Bar as unknown as AnyComponent),
  { ssr: false }
);

export const DynamicLine = dynamic(
  () => import("recharts").then((mod) => mod.Line as unknown as AnyComponent),
  { ssr: false }
);

export const DynamicArea = dynamic(
  () => import("recharts").then((mod) => mod.Area as unknown as AnyComponent),
  { ssr: false }
);

export const DynamicScatter = dynamic(
  () => import("recharts").then((mod) => mod.Scatter as unknown as AnyComponent),
  { ssr: false }
);

// Common chart components
export const DynamicXAxis = dynamic(
  () => import("recharts").then((mod) => mod.XAxis as unknown as AnyComponent),
  { ssr: false }
);

export const DynamicYAxis = dynamic(
  () => import("recharts").then((mod) => mod.YAxis as unknown as AnyComponent),
  { ssr: false }
);

export const DynamicCartesianGrid = dynamic(
  () => import("recharts").then((mod) => mod.CartesianGrid as unknown as AnyComponent),
  { ssr: false }
);

export const DynamicTooltip = dynamic(
  () => import("recharts").then((mod) => mod.Tooltip as unknown as AnyComponent),
  { ssr: false }
);

export const DynamicLegend = dynamic(
  () => import("recharts").then((mod) => mod.Legend as unknown as AnyComponent),
  { ssr: false }
);

export const DynamicResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer as unknown as AnyComponent),
  { ssr: false }
);

export const DynamicReferenceLine = dynamic(
  () => import("recharts").then((mod) => mod.ReferenceLine as unknown as AnyComponent),
  { ssr: false }
);

export const DynamicCell = dynamic(
  () => import("recharts").then((mod) => mod.Cell as unknown as AnyComponent),
  { ssr: false }
);

// Loading skeleton for charts
export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div
      className="animate-pulse bg-[var(--card)] rounded-lg border border-[var(--card-border)]"
      style={{ height }}
    >
      <div className="h-full flex items-center justify-center text-[var(--muted)]">
        <svg
          className="w-12 h-12 opacity-30"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </div>
    </div>
  );
}

// Higher-order component for lazy loading charts with skeleton
export function withChartSkeleton<P extends object>(
  ChartComponent: ComponentType<P>,
  height: number = 300
) {
  return function LazyChart(props: P) {
    return (
      <ChartComponent {...props}>
        <ChartSkeleton height={height} />
      </ChartComponent>
    );
  };
}
