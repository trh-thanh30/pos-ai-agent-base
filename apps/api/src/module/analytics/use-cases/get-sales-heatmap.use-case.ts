import { Injectable } from '@nestjs/common';
import { order_status } from '@prisma/client';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { AnalyticsRepository } from '../repository/analytics.repository';
import type { AnalyticsRangeInput } from '../types/analytics-query.type';
import { AnalyticsDateRangeUtil } from '../utils/analytics-date-range.util';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class GetSalesHeatmapUseCase {
  constructor(
    private readonly repository: AnalyticsRepository,
    private readonly dateRange: AnalyticsDateRangeUtil,
  ) {}

  async execute(storeId: string | undefined, query: AnalyticsRangeInput) {
    this.dateRange.assertStoreId(storeId);
    const range = this.dateRange.resolve(query);
    const orders = await this.repository.findOrders(storeId, range, [
      order_status.COMPLETED,
    ]);
    const cells = Array.from({ length: 7 * 24 }, (_, index) => ({
      weekday: Math.floor(index / 24) + 1,
      hour: index % 24,
      revenue: 0,
      orders: 0,
    }));

    for (const order of orders) {
      const localDate = dayjs(order.createdAt).tz(range.timezone);
      const weekday = localDate.day() === 0 ? 7 : localDate.day();
      const cell = cells[(weekday - 1) * 24 + localDate.hour()];
      cell.revenue += order.totalAmount;
      cell.orders += 1;
    }

    return {
      period: { from: range.from, to: range.to, timezone: range.timezone },
      cells,
    };
  }
}
