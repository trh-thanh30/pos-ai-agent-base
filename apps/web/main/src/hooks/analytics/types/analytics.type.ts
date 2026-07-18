// eslint-disable-next-line filenames/match-regex
export type AnalyticsPreset = "today" | "7d" | "30d" | "this_month";

export interface AnalyticsMetric {
  value: number;
  previousValue: number | null;
  changeValue: number | null;
  changePercent: number | null;
}

export interface AnalyticsPeriod {
  from: string;
  to: string;
  timezone: string;
}

export interface AnalyticsOverview {
  period: AnalyticsPeriod & {
    groupBy: "hour" | "day" | "week" | "month";
    compare: "none" | "previous_period" | "previous_year";
  };
  metrics: {
    netRevenue: AnalyticsMetric;
    completedOrders: AnalyticsMetric;
    unitsSold: AnalyticsMetric;
    averageOrderValue: AnalyticsMetric;
    uniqueCustomers: AnalyticsMetric;
    discounts: AnalyticsMetric;
    tax: AnalyticsMetric;
    refundedAmount: AnalyticsMetric;
  };
}

export interface AnalyticsSalesTrend {
  period: AnalyticsPeriod;
  groupBy: "hour" | "day" | "week" | "month";
  series: Array<{
    key: string;
    revenue: number;
    orders: number;
    unitsSold: number;
  }>;
  totals: { revenue: number; orders: number; unitsSold: number };
}

export interface AnalyticsCategoryPerformance {
  period: AnalyticsPeriod;
  totalRevenue: number;
  categories: Array<{
    id: string;
    name: string;
    revenue: number;
    quantity: number;
  }>;
}

export interface AnalyticsProductPerformance {
  period: AnalyticsPeriod;
  metric: "revenue" | "quantity";
  grossProfitAccuracy: "estimated_from_current_variant_cost";
  products: Array<{
    id: string;
    name: string;
    imageUrl: string | null;
    price: number;
    baseUnit: string;
    revenue: number;
    quantity: number;
    estimatedGrossProfit: number;
  }>;
}

export interface AnalyticsPaymentBreakdown {
  period: AnalyticsPeriod;
  totalRevenue: number;
  methods: Array<{
    method: string;
    revenue: number;
    orders: number;
    percentage: number;
  }>;
}

export interface AnalyticsInventoryHealth {
  period: AnalyticsPeriod;
  summary: {
    variants: number;
    availableUnits: number;
    stockValue: number;
    retailValue: number;
    statusCounts: Record<string, number>;
  };
  variants: Array<{
    productId: string;
    productName: string;
    imageUrl: string | null;
    variantId: string;
    variantName: string;
    price: number;
    cost: number;
    onHand: number;
    reserved: number;
    damaged: number;
    available: number;
    sold: number;
    averageDailySales: number;
    daysOfCover: number | null;
    stockValue: number;
    retailValue: number;
    status: "out_of_stock" | "critical" | "low" | "slow_moving" | "healthy";
  }>;
}

export interface AnalyticsCustomerInsights {
  period: AnalyticsPeriod;
  groupBy: "hour" | "day" | "week" | "month";
  summary: {
    activeCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    anonymousOrders: number;
    revenuePerCustomer: number;
  };
  series: Array<{
    key: string;
    newCustomers: number;
    returningCustomers: number;
  }>;
}

export interface AnalyticsHeatmap {
  period: AnalyticsPeriod;
  cells: Array<{
    weekday: number;
    hour: number;
    revenue: number;
    orders: number;
  }>;
}

export interface AnalyticsOrderStatuses {
  period: AnalyticsPeriod;
  totalOrders: number;
  statuses: Array<{
    status: string;
    orders: number;
    amount: number;
    percentage: number;
  }>;
}

export interface AnalyticsDashboardData {
  overview: AnalyticsOverview;
  salesTrend: AnalyticsSalesTrend;
  categoryPerformance: AnalyticsCategoryPerformance;
  productPerformance: AnalyticsProductPerformance;
  paymentBreakdown: AnalyticsPaymentBreakdown;
  inventoryHealth: AnalyticsInventoryHealth;
  customerInsights: AnalyticsCustomerInsights;
  heatmap: AnalyticsHeatmap;
  orderStatuses: AnalyticsOrderStatuses;
}
