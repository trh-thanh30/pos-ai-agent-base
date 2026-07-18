import { Injectable } from '@nestjs/common';
import { order_status } from '@prisma/client';
import { AnalyticsRepository } from '../repository/analytics.repository';
import type { AnalyticsRangeInput } from '../types/analytics-query.type';
import { AnalyticsDateRangeUtil } from '../utils/analytics-date-range.util';
import { AnalyticsMapperUtil } from '../utils/analytics-mapper.util';

@Injectable()
export class GetSalesTrendUseCase {
  constructor(
    private readonly repository: AnalyticsRepository,
    private readonly dateRange: AnalyticsDateRangeUtil,
    private readonly mapper: AnalyticsMapperUtil,
  ) {}

  async execute(storeId: string | undefined, query: AnalyticsRangeInput) {
    this.dateRange.assertStoreId(storeId);
    const range = this.dateRange.resolve(query);
    const orders = await this.repository.findOrders(storeId, range, [
      order_status.COMPLETED,
    ]);
    const buckets = new Map<
      string,
      { key: string; revenue: number; orders: number; unitsSold: number }
    >(
      this.mapper
        .bucketKeys(range.from, range.to, range.groupBy, range.timezone)
        .map((key) => [key, { key, revenue: 0, orders: 0, unitsSold: 0 }]),
    );

    for (const order of orders) {
      const key = this.mapper.bucketKey(
        order.createdAt,
        range.groupBy,
        range.timezone,
      );
      const bucket = buckets.get(key);
      if (!bucket) continue;
      bucket.revenue += order.totalAmount;
      bucket.orders += 1;
      bucket.unitsSold += order.unitsSold;
    }

    return {
      period: { from: range.from, to: range.to, timezone: range.timezone },
      groupBy: range.groupBy,
      series: [...buckets.values()],
      totals: {
        revenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
        orders: orders.length,
        unitsSold: orders.reduce((sum, order) => sum + order.unitsSold, 0),
      },
    };
  }
}
