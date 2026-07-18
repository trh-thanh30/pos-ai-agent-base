import { Injectable } from '@nestjs/common';
import { order_status } from '@prisma/client';
import { AnalyticsRepository } from '../repository/analytics.repository';
import type { AnalyticsRangeInput } from '../types/analytics-query.type';
import type { AnalyticsOrderRecord } from '../types/analytics-response.type';
import { AnalyticsComparisonUtil } from '../utils/analytics-comparison.util';
import { AnalyticsDateRangeUtil } from '../utils/analytics-date-range.util';

@Injectable()
export class GetAnalyticsOverviewUseCase {
  constructor(
    private readonly repository: AnalyticsRepository,
    private readonly dateRange: AnalyticsDateRangeUtil,
    private readonly comparison: AnalyticsComparisonUtil,
  ) {}

  async execute(storeId: string | undefined, query: AnalyticsRangeInput) {
    this.dateRange.assertStoreId(storeId);
    const range = this.dateRange.resolve(query);
    const currentRange = { from: range.from, to: range.to };

    const [orders, returns, previousOrders, previousReturns] =
      await Promise.all([
        this.repository.findOrders(storeId, currentRange, [
          order_status.COMPLETED,
        ]),
        this.repository.findRefundedReturns(storeId, currentRange),
        range.previous
          ? this.repository.findOrders(storeId, range.previous, [
              order_status.COMPLETED,
            ])
          : Promise.resolve([]),
        range.previous
          ? this.repository.findRefundedReturns(storeId, range.previous)
          : Promise.resolve([]),
      ]);

    const current = this.summarize(orders, returns);
    const previous = range.previous
      ? this.summarize(previousOrders, previousReturns)
      : undefined;

    return {
      period: this.periodMeta(range),
      metrics: {
        netRevenue: this.comparison.metric(
          current.netRevenue,
          previous?.netRevenue,
        ),
        completedOrders: this.comparison.metric(
          current.completedOrders,
          previous?.completedOrders,
        ),
        unitsSold: this.comparison.metric(
          current.unitsSold,
          previous?.unitsSold,
        ),
        averageOrderValue: this.comparison.metric(
          current.averageOrderValue,
          previous?.averageOrderValue,
        ),
        uniqueCustomers: this.comparison.metric(
          current.uniqueCustomers,
          previous?.uniqueCustomers,
        ),
        discounts: this.comparison.metric(
          current.discounts,
          previous?.discounts,
        ),
        tax: this.comparison.metric(current.tax, previous?.tax),
        refundedAmount: this.comparison.metric(
          current.refundedAmount,
          previous?.refundedAmount,
        ),
      },
    };
  }

  private summarize(
    orders: AnalyticsOrderRecord[],
    returns: Array<{ total: number; items: number }>,
  ) {
    const grossRevenue = orders.reduce(
      (total, order) => total + order.totalAmount,
      0,
    );
    const refundedAmount = returns.reduce(
      (total, item) => total + item.total,
      0,
    );
    const completedOrders = orders.length;
    return {
      netRevenue: grossRevenue - refundedAmount,
      completedOrders,
      unitsSold: orders.reduce((total, order) => total + order.unitsSold, 0),
      averageOrderValue:
        completedOrders === 0 ? 0 : grossRevenue / completedOrders,
      uniqueCustomers: new Set(
        orders.flatMap((order) => (order.customerId ? [order.customerId] : [])),
      ).size,
      discounts: orders.reduce(
        (total, order) => total + order.discountAmount,
        0,
      ),
      tax: orders.reduce((total, order) => total + order.taxAmount, 0),
      refundedAmount,
    };
  }

  private periodMeta(range: ReturnType<AnalyticsDateRangeUtil['resolve']>) {
    return {
      from: range.from,
      to: range.to,
      timezone: range.timezone,
      groupBy: range.groupBy,
      compare: range.compare,
      previous: range.previous,
    };
  }
}
