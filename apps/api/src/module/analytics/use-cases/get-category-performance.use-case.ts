import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from '../repository/analytics.repository';
import type { AnalyticsListInput } from '../types/analytics-query.type';
import { AnalyticsDateRangeUtil } from '../utils/analytics-date-range.util';
import { AnalyticsMapperUtil } from '../utils/analytics-mapper.util';

@Injectable()
export class GetCategoryPerformanceUseCase {
  constructor(
    private readonly repository: AnalyticsRepository,
    private readonly dateRange: AnalyticsDateRangeUtil,
    private readonly mapper: AnalyticsMapperUtil,
  ) {}

  async execute(storeId: string | undefined, query: AnalyticsListInput) {
    this.dateRange.assertStoreId(storeId);
    const range = this.dateRange.resolve(query);
    const items = await this.repository.findCompletedOrderItems(storeId, range);
    const categories = new Map<
      string,
      { id: string; name: string; revenue: number; quantity: number }
    >();

    for (const item of items) {
      const itemCategories = item.categories.length
        ? item.categories
        : [{ id: 'uncategorized', name: 'Khác' }];
      const divisor = itemCategories.length;
      for (const category of itemCategories) {
        const current = categories.get(category.id) || {
          ...category,
          revenue: 0,
          quantity: 0,
        };
        current.revenue += item.total / divisor;
        current.quantity += item.quantity / divisor;
        categories.set(category.id, current);
      }
    }

    const data = [...categories.values()]
      .map((category) => ({
        ...category,
        revenue: this.mapper.round(category.revenue),
        quantity: this.mapper.round(category.quantity),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, query.limit ?? 10);

    return {
      period: { from: range.from, to: range.to, timezone: range.timezone },
      allocation: 'split_equally_for_multi_category_products',
      totalRevenue: items.reduce((sum, item) => sum + item.total, 0),
      categories: data,
    };
  }
}
