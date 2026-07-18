import {
  AnalyticsCompare,
  AnalyticsPreset,
} from '../types/analytics-query.type';
import { GetCustomerInsightsUseCase } from '../use-cases/get-customer-insights.use-case';
import { AnalyticsDateRangeUtil } from '../utils/analytics-date-range.util';
import { AnalyticsMapperUtil } from '../utils/analytics-mapper.util';

describe('GetCustomerInsightsUseCase', () => {
  it('separates new, returning and anonymous customers', async () => {
    const repository = {
      findOrders: jest
        .fn()
        .mockResolvedValue([
          order('new-customer', '2026-07-02T03:00:00.000Z', 100),
          order('returning-customer', '2026-07-02T04:00:00.000Z', 50),
          order(null, '2026-07-02T05:00:00.000Z', 25),
        ]),
      findCustomerOrderStats: jest
        .fn()
        .mockResolvedValue([
          customerStat('new-customer', '2026-07-02T03:00:00.000Z'),
          customerStat('returning-customer', '2026-06-01T03:00:00.000Z'),
        ]),
    };
    const useCase = new GetCustomerInsightsUseCase(
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

    expect(result.summary).toEqual(
      expect.objectContaining({
        activeCustomers: 2,
        newCustomers: 1,
        returningCustomers: 1,
        anonymousOrders: 1,
        revenuePerCustomer: 75,
      }),
    );
  });
});

function order(
  customerId: string | null,
  createdAt: string,
  totalAmount: number,
) {
  return { customerId, createdAt: new Date(createdAt), totalAmount };
}

function customerStat(customerId: string, firstOrderAt: string) {
  return {
    customer_id: customerId,
    _min: { createdAt: new Date(firstOrderAt) },
  };
}
