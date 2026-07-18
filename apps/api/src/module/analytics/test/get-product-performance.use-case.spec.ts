import {
  AnalyticsCompare,
  AnalyticsPreset,
} from '../types/analytics-query.type';
import { GetProductPerformanceUseCase } from '../use-cases/get-product-performance.use-case';
import { AnalyticsDateRangeUtil } from '../utils/analytics-date-range.util';

describe('GetProductPerformanceUseCase', () => {
  it('aggregates variants by product and labels profit as an estimate', async () => {
    const repository = {
      findCompletedOrderItems: jest.fn().mockResolvedValue([
        {
          productId: 'product-1',
          productName: 'Coffee',
          imageUrl: null,
          currentPrice: 30,
          currentCost: 10,
          baseUnit: 'cup',
          quantity: 2,
          total: 60,
        },
        {
          productId: 'product-1',
          productName: 'Coffee',
          imageUrl: null,
          currentPrice: 30,
          currentCost: 10,
          baseUnit: 'cup',
          quantity: 1,
          total: 30,
        },
      ]),
    };
    const useCase = new GetProductPerformanceUseCase(
      repository as never,
      new AnalyticsDateRangeUtil(),
    );

    const result = await useCase.execute('store-1', {
      preset: AnalyticsPreset.CUSTOM,
      from: '2026-07-01',
      to: '2026-07-03',
      compare: AnalyticsCompare.NONE,
      limit: 10,
    });

    expect(result.grossProfitAccuracy).toBe(
      'estimated_from_current_variant_cost',
    );
    expect(result.products[0]).toEqual(
      expect.objectContaining({
        revenue: 90,
        quantity: 3,
        estimatedGrossProfit: 60,
      }),
    );
  });
});
