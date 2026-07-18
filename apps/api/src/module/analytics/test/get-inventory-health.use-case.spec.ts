import {
  AnalyticsCompare,
  AnalyticsPreset,
} from '../types/analytics-query.type';
import { GetInventoryHealthUseCase } from '../use-cases/get-inventory-health.use-case';
import { AnalyticsDateRangeUtil } from '../utils/analytics-date-range.util';
import { AnalyticsMapperUtil } from '../utils/analytics-mapper.util';

describe('GetInventoryHealthUseCase', () => {
  it('uses actual available stock and sales velocity to determine risk', async () => {
    const repository = {
      findInventory: jest.fn().mockResolvedValue([
        {
          productId: 'product-1',
          productName: 'Coffee',
          imageUrl: null,
          variantId: 'variant-1',
          variantName: 'Default',
          price: 20_000,
          cost: 10_000,
          onHand: 10,
          reserved: 2,
          damaged: 1,
        },
      ]),
      findCompletedOrderItems: jest
        .fn()
        .mockResolvedValue([{ variantId: 'variant-1', quantity: 30 }]),
    };
    const useCase = new GetInventoryHealthUseCase(
      repository as never,
      new AnalyticsDateRangeUtil(),
      new AnalyticsMapperUtil(),
    );

    const result = await useCase.execute('store-1', {
      preset: AnalyticsPreset.CUSTOM,
      from: '2026-07-01',
      to: '2026-07-30',
      compare: AnalyticsCompare.NONE,
      limit: 10,
    });

    expect(result.variants[0]).toEqual(
      expect.objectContaining({
        available: 7,
        sold: 30,
        status: 'critical',
        stockValue: 70_000,
      }),
    );
  });
});
