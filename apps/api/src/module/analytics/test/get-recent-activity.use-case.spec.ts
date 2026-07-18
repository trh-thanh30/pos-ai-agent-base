import { AnalyticsActivityType } from '../types/analytics-query.type';
import { GetRecentActivityUseCase } from '../use-cases/get-recent-activity.use-case';
import { AnalyticsDateRangeUtil } from '../utils/analytics-date-range.util';

describe('GetRecentActivityUseCase', () => {
  it('filters before applying the requested limit', async () => {
    const repository = {
      findRecentActivity: jest
        .fn()
        .mockResolvedValue([
          activity('order-1', 'order', '2026-07-03T10:00:00.000Z'),
          activity('stock-1', 'stock', '2026-07-03T09:00:00.000Z'),
          activity('stock-2', 'stock', '2026-07-03T08:00:00.000Z'),
        ]),
    };
    const useCase = new GetRecentActivityUseCase(
      repository as never,
      new AnalyticsDateRangeUtil(),
    );

    const result = await useCase.execute('store-1', {
      type: AnalyticsActivityType.STOCK,
      limit: 1,
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('stock-1');
  });
});

function activity(id: string, type: 'order' | 'stock', createdAt: string) {
  return { id, type, createdAt: new Date(createdAt), data: {} };
}
