import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from '../repository/analytics.repository';
import type { AnalyticsRangeInput } from '../types/analytics-query.type';
import { AnalyticsDateRangeUtil } from '../utils/analytics-date-range.util';
import { AnalyticsMapperUtil } from '../utils/analytics-mapper.util';

@Injectable()
export class GetOrderStatusBreakdownUseCase {
  constructor(
    private readonly repository: AnalyticsRepository,
    private readonly dateRange: AnalyticsDateRangeUtil,
    private readonly mapper: AnalyticsMapperUtil,
  ) {}

  async execute(storeId: string | undefined, query: AnalyticsRangeInput) {
    this.dateRange.assertStoreId(storeId);
    const range = this.dateRange.resolve(query);
    const orders = await this.repository.findOrders(storeId, range);
    const statuses = new Map<
      string,
      { status: string; orders: number; amount: number }
    >();
    for (const order of orders) {
      const current = statuses.get(order.status) || {
        status: order.status,
        orders: 0,
        amount: 0,
      };
      current.orders += 1;
      current.amount += order.totalAmount;
      statuses.set(order.status, current);
    }

    return {
      period: { from: range.from, to: range.to, timezone: range.timezone },
      totalOrders: orders.length,
      statuses: [...statuses.values()]
        .map((status) => ({
          ...status,
          percentage:
            orders.length === 0
              ? 0
              : this.mapper.round((status.orders / orders.length) * 100),
        }))
        .sort((a, b) => b.orders - a.orders),
    };
  }
}
