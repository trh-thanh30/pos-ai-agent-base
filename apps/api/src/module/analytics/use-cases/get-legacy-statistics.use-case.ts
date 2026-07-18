import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import {
  AnalyticsActivityType,
  AnalyticsCompare,
  AnalyticsGroupBy,
  AnalyticsPreset,
  AnalyticsProductMetric,
  type AnalyticsRangeInput,
} from '../types/analytics-query.type';
import { GetAnalyticsOverviewUseCase } from './get-analytics-overview.use-case';
import { GetCategoryPerformanceUseCase } from './get-category-performance.use-case';
import { GetInventoryHealthUseCase } from './get-inventory-health.use-case';
import { GetProductPerformanceUseCase } from './get-product-performance.use-case';
import { GetRecentActivityUseCase } from './get-recent-activity.use-case';
import { GetSalesTrendUseCase } from './get-sales-trend.use-case';

dayjs.extend(isoWeek);

type LegacyPeriod = 'day' | 'week' | 'month';

@Injectable()
export class GetLegacyStatisticsUseCase {
  constructor(
    private readonly overview: GetAnalyticsOverviewUseCase,
    private readonly salesTrend: GetSalesTrendUseCase,
    private readonly categoryPerformance: GetCategoryPerformanceUseCase,
    private readonly productPerformance: GetProductPerformanceUseCase,
    private readonly inventoryHealth: GetInventoryHealthUseCase,
    private readonly recentActivity: GetRecentActivityUseCase,
  ) {}

  async revenue(storeId: string | undefined, type: LegacyPeriod) {
    const result = await this.salesTrend.execute(
      storeId,
      this.legacyTrendQuery(type),
    );
    return {
      type,
      data: result.series.map((item) => ({
        key: item.key,
        value: item.revenue,
      })),
    };
  }

  async summary(storeId: string | undefined, type: LegacyPeriod) {
    const result = await this.overview.execute(storeId, {
      preset: this.legacyPreset(type),
      compare: AnalyticsCompare.NONE,
    });
    return {
      orderCount: result.metrics.completedOrders.value,
      totalRevenue: result.metrics.netRevenue.value,
      customerCount: result.metrics.uniqueCustomers.value,
      totalProduct: result.metrics.unitsSold.value,
    };
  }

  async revenueByCategory(storeId: string | undefined, type: LegacyPeriod) {
    const result = await this.categoryPerformance.execute(storeId, {
      preset: this.legacyPreset(type),
      compare: AnalyticsCompare.NONE,
      limit: 100,
    });
    return {
      total: result.totalRevenue,
      categories: result.categories.map((item) => ({
        name: item.name,
        value: item.revenue,
      })),
    };
  }

  async topProducts(storeId: string | undefined) {
    const result = await this.productPerformance.execute(storeId, {
      preset: AnalyticsPreset.LAST_30_DAYS,
      compare: AnalyticsCompare.NONE,
      metric: AnalyticsProductMetric.QUANTITY,
      limit: 15,
    });
    return result.products.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      baseProductName: item.name,
      baseUnit: item.baseUnit,
      imageUrl: item.imageUrl,
      quantitySold: item.quantity,
    }));
  }

  async lowStockProducts(storeId: string | undefined) {
    const result = await this.inventoryHealth.execute(storeId, {
      preset: AnalyticsPreset.LAST_30_DAYS,
      compare: AnalyticsCompare.NONE,
      limit: 100,
    });
    return result.variants
      .filter((item) => item.status !== 'healthy')
      .map((item) => ({
        product: {
          id: item.productId,
          name: item.productName,
          image_url: item.imageUrl,
          inventory: { quantity: String(item.available) },
          price: item.price,
        },
        totalSold30Days: item.sold,
        daysRemaining: item.daysOfCover ?? 999,
        avgDailySales: item.averageDailySales,
        status:
          item.status === 'out_of_stock' || item.status === 'critical'
            ? 'critical'
            : 'warning',
      }));
  }

  async notifications(
    storeId: string | undefined,
    type: AnalyticsActivityType,
    limit: number,
  ) {
    const result = await this.recentActivity.execute(storeId, { type, limit });
    return result.map((item) => ({
      type: item.type,
      createdAt: item.createdAt,
      data: {
        code: item.data.code,
        amount: item.data.amount,
        payment_method: item.data.paymentMethod,
        quantity: item.data.quantity,
        variantName: item.data.variantName,
        stockType: item.data.stockType,
      },
    }));
  }

  private legacyPreset(type: LegacyPeriod) {
    if (type === 'week') return AnalyticsPreset.THIS_WEEK;
    if (type === 'month') return AnalyticsPreset.THIS_MONTH;
    return AnalyticsPreset.TODAY;
  }

  private legacyTrendQuery(type: LegacyPeriod): AnalyticsRangeInput {
    const now = dayjs();
    const config =
      type === 'week'
        ? {
            from: now.startOf('isoWeek').subtract(6, 'week'),
            groupBy: AnalyticsGroupBy.WEEK,
          }
        : type === 'month'
          ? {
              from: now.startOf('month').subtract(11, 'month'),
              groupBy: AnalyticsGroupBy.MONTH,
            }
          : {
              from: now.startOf('day').subtract(6, 'day'),
              groupBy: AnalyticsGroupBy.DAY,
            };

    return {
      preset: AnalyticsPreset.CUSTOM,
      from: config.from.toISOString(),
      to: now.toISOString(),
      groupBy: config.groupBy,
      compare: AnalyticsCompare.NONE,
    };
  }
}
