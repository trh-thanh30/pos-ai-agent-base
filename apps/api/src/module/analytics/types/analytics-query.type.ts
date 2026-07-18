export enum AnalyticsPreset {
  TODAY = 'today',
  LAST_7_DAYS = '7d',
  LAST_30_DAYS = '30d',
  THIS_WEEK = 'this_week',
  THIS_MONTH = 'this_month',
  CUSTOM = 'custom',
}

export enum AnalyticsGroupBy {
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export enum AnalyticsCompare {
  NONE = 'none',
  PREVIOUS_PERIOD = 'previous_period',
  PREVIOUS_YEAR = 'previous_year',
}

export enum AnalyticsProductMetric {
  REVENUE = 'revenue',
  QUANTITY = 'quantity',
}

export enum AnalyticsActivityType {
  ALL = 'all',
  ORDER = 'order',
  STOCK = 'stock',
}

export interface AnalyticsRangeInput {
  preset?: AnalyticsPreset;
  from?: string;
  to?: string;
  timezone?: string;
  groupBy?: AnalyticsGroupBy;
  compare?: AnalyticsCompare;
}

export interface AnalyticsListInput extends AnalyticsRangeInput {
  limit?: number;
  metric?: AnalyticsProductMetric;
}

export interface AnalyticsActivityInput {
  limit?: number;
  type?: AnalyticsActivityType;
}

export interface AnalyticsDateRange {
  from: Date;
  to: Date;
  timezone: string;
  groupBy: AnalyticsGroupBy;
  compare: AnalyticsCompare;
  previous?: {
    from: Date;
    to: Date;
  };
}
