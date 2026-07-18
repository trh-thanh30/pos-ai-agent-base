import {
  AnalyticsCompare,
  AnalyticsPreset,
} from '../types/analytics-query.type';
import { GetCategoryPerformanceUseCase } from '../use-cases/get-category-performance.use-case';
import { AnalyticsDateRangeUtil } from '../utils/analytics-date-range.util';
import { AnalyticsMapperUtil } from '../utils/analytics-mapper.util';

describe('GetCategoryPerformanceUseCase', () => {
  it('allocates item totals across multiple categories without double counting', async () => {
    const repository = {
      findCompletedOrderItems: jest.fn().mockResolvedValue([
        {
          total: 100,
          quantity: 4,
          categories: [
            { id: 'cat-1', name: 'Food' },
            { id: 'cat-2', name: 'Gift' },
          ],
        },
        { total: 50, quantity: 1, categories: [] },
      ]),
    };
    const useCase = new GetCategoryPerformanceUseCase(
      repository as never,
      new AnalyticsDateRangeUtil(),
      new AnalyticsMapperUtil(),
    );

    const result = await useCase.execute('store-1', {
      preset: AnalyticsPreset.CUSTOM,
      from: '2026-07-01',
      to: '2026-07-07',
      compare: AnalyticsCompare.NONE,
      limit: 10,
    });

    expect(result.totalRevenue).toBe(150);
    expect(result.categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'cat-1', revenue: 50, quantity: 2 }),
        expect.objectContaining({ id: 'cat-2', revenue: 50, quantity: 2 }),
        expect.objectContaining({ id: 'uncategorized', revenue: 50 }),
      ]),
    );
  });
});
