import { order_status } from '@prisma/client';
import {
  AnalyticsCompare,
  AnalyticsPreset,
} from '../types/analytics-query.type';
import { GetOrderStatusBreakdownUseCase } from '../use-cases/get-order-status-breakdown.use-case';
import { AnalyticsDateRangeUtil } from '../utils/analytics-date-range.util';
import { AnalyticsMapperUtil } from '../utils/analytics-mapper.util';

describe('GetOrderStatusBreakdownUseCase', () => {
  it('calculates order count, amount and percentage by status', async () => {
    const repository = {
      findOrders: jest.fn().mockResolvedValue([
        { status: order_status.COMPLETED, totalAmount: 100 },
        { status: order_status.COMPLETED, totalAmount: 50 },
        { status: order_status.CANCELLED, totalAmount: 25 },
      ]),
    };
    const useCase = new GetOrderStatusBreakdownUseCase(
      repository as never,
      new AnalyticsDateRangeUtil(),
      new AnalyticsMapperUtil(),
    );

    const result = await useCase.execute('store-1', {
      preset: AnalyticsPreset.CUSTOM,
      from: '2026-07-01',
      to: '2026-07-03',
      compare: AnalyticsCompare.NONE,
    });

    expect(result.statuses[0]).toEqual(
      expect.objectContaining({
        status: order_status.COMPLETED,
        orders: 2,
        amount: 150,
        percentage: 66.67,
      }),
    );
  });
});
