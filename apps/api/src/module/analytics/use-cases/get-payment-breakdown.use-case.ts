import { Injectable } from '@nestjs/common';
import { order_status } from '@prisma/client';
import { AnalyticsRepository } from '../repository/analytics.repository';
import type { AnalyticsRangeInput } from '../types/analytics-query.type';
import { AnalyticsDateRangeUtil } from '../utils/analytics-date-range.util';
import { AnalyticsMapperUtil } from '../utils/analytics-mapper.util';

@Injectable()
export class GetPaymentBreakdownUseCase {
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
    const totalRevenue = orders.reduce(
      (total, order) => total + order.totalAmount,
      0,
    );
    const methods = new Map<
      string,
      { method: string; revenue: number; orders: number }
    >();

    for (const order of orders) {
      const current = methods.get(order.paymentMethod) || {
        method: order.paymentMethod,
        revenue: 0,
        orders: 0,
      };
      current.revenue += order.totalAmount;
      current.orders += 1;
      methods.set(order.paymentMethod, current);
    }

    return {
      period: { from: range.from, to: range.to, timezone: range.timezone },
      totalRevenue,
      methods: [...methods.values()]
        .map((method) => ({
          ...method,
          percentage:
            totalRevenue === 0
              ? 0
              : this.mapper.round((method.revenue / totalRevenue) * 100),
        }))
        .sort((a, b) => b.revenue - a.revenue),
    };
  }
}
