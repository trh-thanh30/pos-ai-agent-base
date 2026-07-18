import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { LegacyStatisticsController } from './legacy-statistics.controller';
import { AnalyticsRepository } from './repository/analytics.repository';
import { GetAnalyticsOverviewUseCase } from './use-cases/get-analytics-overview.use-case';
import { GetCategoryPerformanceUseCase } from './use-cases/get-category-performance.use-case';
import { GetCustomerInsightsUseCase } from './use-cases/get-customer-insights.use-case';
import { GetInventoryHealthUseCase } from './use-cases/get-inventory-health.use-case';
import { GetLegacyStatisticsUseCase } from './use-cases/get-legacy-statistics.use-case';
import { GetOrderStatusBreakdownUseCase } from './use-cases/get-order-status-breakdown.use-case';
import { GetPaymentBreakdownUseCase } from './use-cases/get-payment-breakdown.use-case';
import { GetProductPerformanceUseCase } from './use-cases/get-product-performance.use-case';
import { GetRecentActivityUseCase } from './use-cases/get-recent-activity.use-case';
import { GetSalesHeatmapUseCase } from './use-cases/get-sales-heatmap.use-case';
import { GetSalesTrendUseCase } from './use-cases/get-sales-trend.use-case';
import { AnalyticsComparisonUtil } from './utils/analytics-comparison.util';
import { AnalyticsDateRangeUtil } from './utils/analytics-date-range.util';
import { AnalyticsMapperUtil } from './utils/analytics-mapper.util';

const useCases = [
  GetAnalyticsOverviewUseCase,
  GetSalesTrendUseCase,
  GetCategoryPerformanceUseCase,
  GetProductPerformanceUseCase,
  GetPaymentBreakdownUseCase,
  GetInventoryHealthUseCase,
  GetCustomerInsightsUseCase,
  GetSalesHeatmapUseCase,
  GetOrderStatusBreakdownUseCase,
  GetRecentActivityUseCase,
  GetLegacyStatisticsUseCase,
];

@Module({
  controllers: [AnalyticsController, LegacyStatisticsController],
  providers: [
    AnalyticsRepository,
    AnalyticsDateRangeUtil,
    AnalyticsComparisonUtil,
    AnalyticsMapperUtil,
    ...useCases,
  ],
})
export class AnalyticsModule {}
