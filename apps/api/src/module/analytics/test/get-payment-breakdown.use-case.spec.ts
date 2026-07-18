import { payment_method } from '@prisma/client';
import {
  AnalyticsCompare,
  AnalyticsPreset,
} from '../types/analytics-query.type';
import { GetPaymentBreakdownUseCase } from '../use-cases/get-payment-breakdown.use-case';
import { AnalyticsDateRangeUtil } from '../utils/analytics-date-range.util';
import { AnalyticsMapperUtil } from '../utils/analytics-mapper.util';

describe('GetPaymentBreakdownUseCase', () => {
  it('returns revenue share and order count by payment method', async () => {
    const repository = {
      findOrders: jest.fn().mockResolvedValue([
        { paymentMethod: payment_method.CASH, totalAmount: 75 },
        { paymentMethod: payment_method.BANK_TRANSFER, totalAmount: 25 },
      ]),
    };
    const useCase = new GetPaymentBreakdownUseCase(
      repository as never,
      new AnalyticsDateRangeUtil(),
      new AnalyticsMapperUtil(),
    );

    const result = await useCase.execute('store-1', rangeQuery());

    expect(result.totalRevenue).toBe(100);
    expect(result.methods[0]).toEqual(
      expect.objectContaining({ method: payment_method.CASH, percentage: 75 }),
    );
  });
});

function rangeQuery() {
  return {
    preset: AnalyticsPreset.CUSTOM,
    from: '2026-07-01',
    to: '2026-07-03',
    compare: AnalyticsCompare.NONE,
  };
}
