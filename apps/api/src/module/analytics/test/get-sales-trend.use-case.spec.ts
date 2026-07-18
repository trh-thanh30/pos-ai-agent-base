import { order_status, payment_method } from '@prisma/client';
import {
  AnalyticsCompare,
  AnalyticsGroupBy,
  AnalyticsPreset,
} from '../types/analytics-query.type';
import { GetSalesTrendUseCase } from '../use-cases/get-sales-trend.use-case';
import { AnalyticsDateRangeUtil } from '../utils/analytics-date-range.util';
import { AnalyticsMapperUtil } from '../utils/analytics-mapper.util';

describe('GetSalesTrendUseCase', () => {
  it('returns continuous buckets including days without sales', async () => {
    const repository = {
      findOrders: jest.fn().mockResolvedValue([
        {
          id: 'order-1',
          customerId: null,
          totalAmount: 100,
          subtotalAmount: 100,
          discountAmount: 0,
          taxAmount: 0,
          paymentMethod: payment_method.CASH,
          status: order_status.COMPLETED,
          createdAt: new Date('2026-07-02T03:00:00.000Z'),
          unitsSold: 2,
        },
      ]),
    };
    const useCase = new GetSalesTrendUseCase(
      repository as never,
      new AnalyticsDateRangeUtil(),
      new AnalyticsMapperUtil(),
    );

    const result = await useCase.execute('store-1', {
      preset: AnalyticsPreset.CUSTOM,
      from: '2026-07-01',
      to: '2026-07-03',
      timezone: 'Asia/Ho_Chi_Minh',
      groupBy: AnalyticsGroupBy.DAY,
      compare: AnalyticsCompare.NONE,
    });

    expect(result.series).toHaveLength(3);
    expect(result.series[0]).toEqual(
      expect.objectContaining({ key: '2026-07-01', revenue: 0 }),
    );
    expect(result.series[1]).toEqual(
      expect.objectContaining({ key: '2026-07-02', revenue: 100, orders: 1 }),
    );
  });
});
