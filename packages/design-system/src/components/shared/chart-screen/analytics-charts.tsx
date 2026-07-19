"use client";

import { AreaChart, DonutChart } from "@mantine/charts";
import { formatCompactNumber, formatCurrency } from "@repo/utils";

export interface AnalyticsTrendPoint {
  key: string;
  revenue: number;
  orders: number;
}

export function AnalyticsRevenueChart({
  data,
}: {
  data: AnalyticsTrendPoint[];
}) {
  return (
    <AreaChart
      h={280}
      data={data}
      dataKey="key"
      series={[{ name: "revenue", label: "Doanh thu", color: "#3b82f6" }]}
      curveType="monotone"
      fillOpacity={0.12}
      strokeWidth={2.5}
      withGradient={false}
      withDots={data.length <= 12}
      connectNulls
      gridAxis="y"
      tickLine="y"
      valueFormatter={formatCompactNumber}
      tooltipAnimationDuration={120}
      tooltipProps={{
        content: ({ label, payload }) => {
          if (!payload?.length) return null;
          const point = payload[0]?.payload as AnalyticsTrendPoint;
          return (
            <div className="rounded-[8px] border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg">
              <p className="font-semibold text-gray-900">{label}</p>
              <p className="mt-1 text-gray-600">
                Doanh thu:{" "}
                <span className="font-semibold text-blue-600">
                  {formatCurrency(point.revenue)}
                </span>
              </p>
              <p className="text-gray-600">Đơn hoàn thành: {point.orders}</p>
            </div>
          );
        },
      }}
    />
  );
}

export interface AnalyticsDonutItem {
  name: string;
  value: number;
  color: string;
}

export function AnalyticsPaymentDonut({
  data,
  total,
}: {
  data: AnalyticsDonutItem[];
  total: number;
}) {
  return (
    <DonutChart
      data={data}
      size={188}
      thickness={24}
      paddingAngle={2}
      strokeWidth={0}
      chartLabel={formatCompactNumber(total)}
      tooltipDataSource="segment"
      valueFormatter={formatCurrency}
    />
  );
}
