import { order_status, payment_method } from '@prisma/client';
import {
  AnalyticsCompare,
  AnalyticsPreset,
} from '../types/analytics-query.type';
import { GetAnalyticsOverviewUseCase } from '../use-cases/get-analytics-overview.use-case';
import { AnalyticsComparisonUtil } from '../utils/analytics-comparison.util';
import { AnalyticsDateRangeUtil } from '../utils/analytics-date-range.util';

describe('GetAnalyticsOverviewUseCase', () => {
  it('uses completed orders, excludes anonymous customers and subtracts refunds', async () => {
    const repository = {
      findOrders: jest
        .fn()
        .mockResolvedValueOnce([
          order('order-1', 'customer-1', 100_000, 2),
          order('order-2', null, 50_000, 1),
        ])
        .mockResolvedValueOnce([order('old-order', 'customer-2', 100_000, 1)]),
      findRefundedReturns: jest
        .fn()
        .mockResolvedValueOnce([{ total: 20_000, items: 1 }])
        .mockResolvedValueOnce([]),
    };
    const useCase = new GetAnalyticsOverviewUseCase(
      repository as never,
      new AnalyticsDateRangeUtil(),
      new AnalyticsComparisonUtil(),
    );

    const result = await useCase.execute('store-1', {
      preset: AnalyticsPreset.CUSTOM,
      from: '2026-07-01',
      to: '2026-07-07',
      timezone: 'Asia/Ho_Chi_Minh',
      compare: AnalyticsCompare.PREVIOUS_PERIOD,
    });

    expect(result.metrics.netRevenue.value).toBe(130_000);
    expect(result.metrics.completedOrders.value).toBe(2);
    expect(result.metrics.unitsSold.value).toBe(3);
    expect(result.metrics.uniqueCustomers.value).toBe(1);
    expect(result.metrics.netRevenue.previousValue).toBe(100_000);
  });
});

function order(
  id: string,
  customerId: string | null,
  totalAmount: number,
  unitsSold: number,
) {
  return {
    id,
    customerId,
    totalAmount,
    subtotalAmount: totalAmount,
    discountAmount: 0,
    taxAmount: 0,
    paymentMethod: payment_method.CASH,
    status: order_status.COMPLETED,
    createdAt: new Date('2026-07-03T10:00:00.000Z'),
    unitsSold,
  };
}
