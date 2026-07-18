import { Injectable } from '@nestjs/common';
import { order_status } from '@prisma/client';
import { AnalyticsRepository } from '../repository/analytics.repository';
import type { AnalyticsRangeInput } from '../types/analytics-query.type';
import { AnalyticsDateRangeUtil } from '../utils/analytics-date-range.util';
import { AnalyticsMapperUtil } from '../utils/analytics-mapper.util';

@Injectable()
export class GetCustomerInsightsUseCase {
  constructor(
    private readonly repository: AnalyticsRepository,
    private readonly dateRange: AnalyticsDateRangeUtil,
    private readonly mapper: AnalyticsMapperUtil,
  ) {}

  async execute(storeId: string | undefined, query: AnalyticsRangeInput) {
    this.dateRange.assertStoreId(storeId);
    const range = this.dateRange.resolve(query);
    const [orders, customerStats] = await Promise.all([
      this.repository.findOrders(storeId, range, [order_status.COMPLETED]),
      this.repository.findCustomerOrderStats(storeId, range.to),
    ]);
    const firstOrderByCustomer = new Map(
      customerStats.flatMap((item) =>
        item.customer_id && item._min.createdAt
          ? [[item.customer_id, item._min.createdAt] as const]
          : [],
      ),
    );
    const customerOrders = orders.flatMap((order) =>
      order.customerId ? [{ ...order, customerId: order.customerId }] : [],
    );
    const activeCustomerIds = new Set(
      customerOrders.map((order) => order.customerId),
    );
    const newCustomerIds = new Set(
      [...activeCustomerIds].filter((customerId) => {
        const firstOrder = firstOrderByCustomer.get(customerId);
        return firstOrder && firstOrder >= range.from;
      }),
    );
    const customerRevenue = customerOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );
    const buckets = new Map<
      string,
      {
        key: string;
        newCustomers: Set<string>;
        returningCustomers: Set<string>;
      }
    >(
      this.mapper
        .bucketKeys(range.from, range.to, range.groupBy, range.timezone)
        .map((key) => [
          key,
          { key, newCustomers: new Set(), returningCustomers: new Set() },
        ]),
    );

    for (const order of customerOrders) {
      const customerId = order.customerId;
      const key = this.mapper.bucketKey(
        order.createdAt,
        range.groupBy,
        range.timezone,
      );
      const bucket = buckets.get(key);
      if (!bucket) continue;
      if (newCustomerIds.has(customerId)) bucket.newCustomers.add(customerId);
      else bucket.returningCustomers.add(customerId);
    }

    return {
      period: { from: range.from, to: range.to, timezone: range.timezone },
      groupBy: range.groupBy,
      summary: {
        activeCustomers: activeCustomerIds.size,
        newCustomers: newCustomerIds.size,
        returningCustomers: activeCustomerIds.size - newCustomerIds.size,
        anonymousOrders: orders.length - customerOrders.length,
        revenuePerCustomer:
          activeCustomerIds.size === 0
            ? 0
            : this.mapper.round(customerRevenue / activeCustomerIds.size),
      },
      series: [...buckets.values()].map((bucket) => ({
        key: bucket.key,
        newCustomers: bucket.newCustomers.size,
        returningCustomers: bucket.returningCustomers.size,
      })),
    };
  }
}
