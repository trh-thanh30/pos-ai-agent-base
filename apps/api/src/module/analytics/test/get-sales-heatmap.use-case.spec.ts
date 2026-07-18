import {
  AnalyticsCompare,
  AnalyticsPreset,
} from '../types/analytics-query.type';
import { GetSalesHeatmapUseCase } from '../use-cases/get-sales-heatmap.use-case';
import { AnalyticsDateRangeUtil } from '../utils/analytics-date-range.util';

describe('GetSalesHeatmapUseCase', () => {
  it('places orders in local weekday and hour cells', async () => {
    const repository = {
      findOrders: jest.fn().mockResolvedValue([
        {
          createdAt: new Date('2026-07-01T03:00:00.000Z'),
          totalAmount: 120,
        },
      ]),
    };
    const useCase = new GetSalesHeatmapUseCase(
      repository as never,
      new AnalyticsDateRangeUtil(),
    );

    const result = await useCase.execute('store-1', {
      preset: AnalyticsPreset.CUSTOM,
      from: '2026-07-01',
      to: '2026-07-02',
      timezone: 'Asia/Ho_Chi_Minh',
      compare: AnalyticsCompare.NONE,
    });

    expect(result.cells).toHaveLength(168);
    expect(result.cells).toContainEqual({
      weekday: 3,
      hour: 10,
      revenue: 120,
      orders: 1,
    });
  });
});
