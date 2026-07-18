import { Injectable } from '@nestjs/common';
import type { AnalyticsMetric } from '../types/analytics-response.type';

@Injectable()
export class AnalyticsComparisonUtil {
  metric(value: number, previousValue?: number): AnalyticsMetric {
    if (previousValue === undefined) {
      return {
        value,
        previousValue: null,
        changeValue: null,
        changePercent: null,
      };
    }

    const changeValue = value - previousValue;
    return {
      value,
      previousValue,
      changeValue,
      changePercent:
        previousValue === 0
          ? value === 0
            ? 0
            : null
          : Number(((changeValue / previousValue) * 100).toFixed(2)),
    };
  }
}
