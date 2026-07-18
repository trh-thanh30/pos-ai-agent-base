import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from '../repository/analytics.repository';
import {
  type AnalyticsListInput,
  AnalyticsProductMetric,
} from '../types/analytics-query.type';
import { AnalyticsDateRangeUtil } from '../utils/analytics-date-range.util';

@Injectable()
export class GetProductPerformanceUseCase {
  constructor(
    private readonly repository: AnalyticsRepository,
    private readonly dateRange: AnalyticsDateRangeUtil,
  ) {}

  async execute(storeId: string | undefined, query: AnalyticsListInput) {
    this.dateRange.assertStoreId(storeId);
    const range = this.dateRange.resolve(query);
    const items = await this.repository.findCompletedOrderItems(storeId, range);
    const products = new Map<
      string,
      {
        id: string;
        name: string;
        imageUrl: string | null;
        price: number;
        baseUnit: string;
        revenue: number;
        quantity: number;
        estimatedGrossProfit: number;
      }
    >();

    for (const item of items) {
      const product = products.get(item.productId) || {
        id: item.productId,
        name: item.productName,
        imageUrl: item.imageUrl,
        price: item.currentPrice,
        baseUnit: item.baseUnit,
        revenue: 0,
        quantity: 0,
        estimatedGrossProfit: 0,
      };
      product.revenue += item.total;
      product.quantity += item.quantity;
      product.estimatedGrossProfit +=
        item.total - item.currentCost * item.quantity;
      products.set(item.productId, product);
    }

    const sortKey =
      query.metric === AnalyticsProductMetric.QUANTITY ? 'quantity' : 'revenue';
    return {
      period: { from: range.from, to: range.to, timezone: range.timezone },
      metric: query.metric ?? AnalyticsProductMetric.REVENUE,
      grossProfitAccuracy: 'estimated_from_current_variant_cost',
      products: [...products.values()]
        .sort((a, b) => b[sortKey] - a[sortKey])
        .slice(0, query.limit ?? 10),
    };
  }
}
