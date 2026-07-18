"use client";

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import api from "../../libs/axios";
import type {
  AnalyticsCategoryPerformance,
  AnalyticsCustomerInsights,
  AnalyticsDashboardData,
  AnalyticsHeatmap,
  AnalyticsInventoryHealth,
  AnalyticsOrderStatuses,
  AnalyticsOverview,
  AnalyticsPaymentBreakdown,
  AnalyticsPreset,
  AnalyticsProductPerformance,
  AnalyticsSalesTrend,
} from "./types/analytics.type";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

const dashboardRequests = [
  ["overview", "/analytics/overview"],
  ["salesTrend", "/analytics/sales-trend"],
  ["categoryPerformance", "/analytics/category-performance"],
  ["productPerformance", "/analytics/product-performance"],
  ["paymentBreakdown", "/analytics/payment-methods"],
  ["inventoryHealth", "/analytics/inventory-health"],
  ["customerInsights", "/analytics/customer-insights"],
  ["heatmap", "/analytics/sales-heatmap"],
  ["orderStatuses", "/analytics/order-statuses"],
] as const;

export default function useAnalytics(preset: AnalyticsPreset) {
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboard = useCallback(
    async (signal?: AbortSignal, background = false) => {
      if (background) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const timezone =
          Intl.DateTimeFormat().resolvedOptions().timeZone ||
          "Asia/Ho_Chi_Minh";
        const responses = await Promise.all(
          dashboardRequests.map(([, url]) =>
            api.get<ApiEnvelope<unknown>>(url, {
              signal,
              params: {
                preset,
                timezone,
                compare: "previous_period",
                limit:
                  url.includes("performance") || url.includes("inventory")
                    ? 8
                    : undefined,
              },
            }),
          ),
        );
        const result = Object.fromEntries(
          dashboardRequests.map(([key], index) => [
            key,
            responses[index].data.data,
          ]),
        ) as unknown as AnalyticsDashboardData;
        setData(result);
        setLastUpdated(new Date());
      } catch (requestError) {
        if (axios.isCancel(requestError)) return;
        const message = axios.isAxiosError(requestError)
          ? requestError.response?.data?.error?.message
          : null;
        setError(
          message || "Không thể tải dữ liệu phân tích. Vui lòng thử lại.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [preset],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchDashboard(controller.signal);
    return () => controller.abort();
  }, [fetchDashboard]);

  const refresh = useCallback(
    () => fetchDashboard(undefined, true),
    [fetchDashboard],
  );

  return { data, loading, refreshing, error, lastUpdated, refresh };
}

export type {
  AnalyticsCategoryPerformance,
  AnalyticsCustomerInsights,
  AnalyticsHeatmap,
  AnalyticsInventoryHealth,
  AnalyticsOrderStatuses,
  AnalyticsOverview,
  AnalyticsPaymentBreakdown,
  AnalyticsPreset,
  AnalyticsProductPerformance,
  AnalyticsSalesTrend,
};
