import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from '../repository/analytics.repository';
import {
  type AnalyticsActivityInput,
  AnalyticsActivityType,
} from '../types/analytics-query.type';
import { AnalyticsDateRangeUtil } from '../utils/analytics-date-range.util';

@Injectable()
export class GetRecentActivityUseCase {
  constructor(
    private readonly repository: AnalyticsRepository,
    private readonly dateRange: AnalyticsDateRangeUtil,
  ) {}

  async execute(storeId: string | undefined, query: AnalyticsActivityInput) {
    this.dateRange.assertStoreId(storeId);
    const activity = await this.repository.findRecentActivity(
      storeId,
      query.limit ?? 10,
    );
    return activity
      .filter((item) => {
        if (!query.type || query.type === AnalyticsActivityType.ALL)
          return true;
        if (query.type === AnalyticsActivityType.ORDER) {
          return item.type === 'order';
        }
        return item.type === 'stock';
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, query.limit ?? 10);
  }
}
