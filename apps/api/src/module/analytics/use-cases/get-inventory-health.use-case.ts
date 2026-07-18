import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from '../repository/analytics.repository';
import type { AnalyticsListInput } from '../types/analytics-query.type';
import { AnalyticsDateRangeUtil } from '../utils/analytics-date-range.util';
import { AnalyticsMapperUtil } from '../utils/analytics-mapper.util';

@Injectable()
export class GetInventoryHealthUseCase {
  constructor(
    private readonly repository: AnalyticsRepository,
    private readonly dateRange: AnalyticsDateRangeUtil,
    private readonly mapper: AnalyticsMapperUtil,
  ) {}

  async execute(storeId: string | undefined, query: AnalyticsListInput) {
    this.dateRange.assertStoreId(storeId);
    const range = this.dateRange.resolve(query);
    const [inventory, soldItems] = await Promise.all([
      this.repository.findInventory(storeId),
      this.repository.findCompletedOrderItems(storeId, range),
    ]);
    const soldByVariant = new Map<string, number>();
    for (const item of soldItems) {
      soldByVariant.set(
        item.variantId,
        (soldByVariant.get(item.variantId) || 0) + item.quantity,
      );
    }

    const elapsedDays = Math.max(
      1,
      (range.to.getTime() - range.from.getTime()) / 86_400_000,
    );
    const variants = inventory.map((item) => {
      const available = Math.max(0, item.onHand - item.reserved - item.damaged);
      const sold = soldByVariant.get(item.variantId) || 0;
      const averageDailySales = sold / elapsedDays;
      const daysOfCover =
        averageDailySales === 0 ? null : available / averageDailySales;
      const status =
        available === 0
          ? 'out_of_stock'
          : daysOfCover !== null && daysOfCover <= 7
            ? 'critical'
            : daysOfCover !== null && daysOfCover <= 14
              ? 'low'
              : sold === 0
                ? 'slow_moving'
                : 'healthy';

      return {
        ...item,
        available,
        sold,
        averageDailySales: this.mapper.round(averageDailySales),
        daysOfCover:
          daysOfCover === null ? null : this.mapper.round(daysOfCover, 1),
        stockValue: available * item.cost,
        retailValue: available * item.price,
        status,
      };
    });

    const priority = {
      out_of_stock: 0,
      critical: 1,
      low: 2,
      slow_moving: 3,
      healthy: 4,
    } as const;
    const counts = variants.reduce<Record<string, number>>((result, item) => {
      result[item.status] = (result[item.status] || 0) + 1;
      return result;
    }, {});

    return {
      period: { from: range.from, to: range.to, timezone: range.timezone },
      summary: {
        variants: variants.length,
        availableUnits: variants.reduce(
          (total, item) => total + item.available,
          0,
        ),
        stockValue: variants.reduce(
          (total, item) => total + item.stockValue,
          0,
        ),
        retailValue: variants.reduce(
          (total, item) => total + item.retailValue,
          0,
        ),
        statusCounts: counts,
      },
      variants: variants
        .sort((a, b) => priority[a.status] - priority[b.status])
        .slice(0, query.limit ?? 10),
    };
  }
}
