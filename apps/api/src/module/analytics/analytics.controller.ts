import { Controller, Get, Query } from '@nestjs/common';
import { ApiSuccess } from 'app/common/decorators';
import { User } from 'app/common/decorators/user.decorator';
import type { IUser } from 'app/common/types/user.type';
import {
  AnalyticsActivityQueryDto,
  AnalyticsListQueryDto,
} from './dto/analytics-list-query.dto';
import { AnalyticsRangeQueryDto } from './dto/analytics-range-query.dto';
import { GetAnalyticsOverviewUseCase } from './use-cases/get-analytics-overview.use-case';
import { GetCategoryPerformanceUseCase } from './use-cases/get-category-performance.use-case';
import { GetCustomerInsightsUseCase } from './use-cases/get-customer-insights.use-case';
import { GetInventoryHealthUseCase } from './use-cases/get-inventory-health.use-case';
import { GetOrderStatusBreakdownUseCase } from './use-cases/get-order-status-breakdown.use-case';
import { GetPaymentBreakdownUseCase } from './use-cases/get-payment-breakdown.use-case';
import { GetProductPerformanceUseCase } from './use-cases/get-product-performance.use-case';
import { GetRecentActivityUseCase } from './use-cases/get-recent-activity.use-case';
import { GetSalesHeatmapUseCase } from './use-cases/get-sales-heatmap.use-case';
import { GetSalesTrendUseCase } from './use-cases/get-sales-trend.use-case';

@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly getOverview: GetAnalyticsOverviewUseCase,
    private readonly getSalesTrend: GetSalesTrendUseCase,
    private readonly getCategoryPerformance: GetCategoryPerformanceUseCase,
    private readonly getProductPerformance: GetProductPerformanceUseCase,
    private readonly getPaymentBreakdown: GetPaymentBreakdownUseCase,
    private readonly getInventoryHealth: GetInventoryHealthUseCase,
    private readonly getCustomerInsights: GetCustomerInsightsUseCase,
    private readonly getSalesHeatmap: GetSalesHeatmapUseCase,
    private readonly getOrderStatuses: GetOrderStatusBreakdownUseCase,
    private readonly getRecentActivity: GetRecentActivityUseCase,
  ) {}

  @Get('overview')
  @ApiSuccess('Analytics overview retrieved successfully')
  overview(@User() user: IUser, @Query() query: AnalyticsRangeQueryDto) {
    return this.getOverview.execute(user.storeId, query);
  }

  @Get('sales-trend')
  @ApiSuccess('Sales trend retrieved successfully')
  salesTrend(@User() user: IUser, @Query() query: AnalyticsRangeQueryDto) {
    return this.getSalesTrend.execute(user.storeId, query);
  }

  @Get('category-performance')
  @ApiSuccess('Category performance retrieved successfully')
  categoryPerformance(
    @User() user: IUser,
    @Query() query: AnalyticsListQueryDto,
  ) {
    return this.getCategoryPerformance.execute(user.storeId, query);
  }

  @Get('product-performance')
  @ApiSuccess('Product performance retrieved successfully')
  productPerformance(
    @User() user: IUser,
    @Query() query: AnalyticsListQueryDto,
  ) {
    return this.getProductPerformance.execute(user.storeId, query);
  }

  @Get('payment-methods')
  @ApiSuccess('Payment breakdown retrieved successfully')
  paymentMethods(@User() user: IUser, @Query() query: AnalyticsRangeQueryDto) {
    return this.getPaymentBreakdown.execute(user.storeId, query);
  }

  @Get('inventory-health')
  @ApiSuccess('Inventory health retrieved successfully')
  inventoryHealth(@User() user: IUser, @Query() query: AnalyticsListQueryDto) {
    return this.getInventoryHealth.execute(user.storeId, query);
  }

  @Get('customer-insights')
  @ApiSuccess('Customer insights retrieved successfully')
  customerInsights(
    @User() user: IUser,
    @Query() query: AnalyticsRangeQueryDto,
  ) {
    return this.getCustomerInsights.execute(user.storeId, query);
  }

  @Get('sales-heatmap')
  @ApiSuccess('Sales heatmap retrieved successfully')
  salesHeatmap(@User() user: IUser, @Query() query: AnalyticsRangeQueryDto) {
    return this.getSalesHeatmap.execute(user.storeId, query);
  }

  @Get('order-statuses')
  @ApiSuccess('Order status breakdown retrieved successfully')
  orderStatuses(@User() user: IUser, @Query() query: AnalyticsRangeQueryDto) {
    return this.getOrderStatuses.execute(user.storeId, query);
  }

  @Get('recent-activity')
  @ApiSuccess('Recent activity retrieved successfully')
  recentActivity(
    @User() user: IUser,
    @Query() query: AnalyticsActivityQueryDto,
  ) {
    return this.getRecentActivity.execute(user.storeId, query);
  }
}
