import { Controller, Get, Query } from '@nestjs/common';
import { ApiSuccess } from 'app/common/decorators';
import { User } from 'app/common/decorators/user.decorator';
import type { IUser } from 'app/common/types/user.type';
import { AnalyticsActivityType } from './types/analytics-query.type';
import { GetLegacyStatisticsUseCase } from './use-cases/get-legacy-statistics.use-case';

type LegacyPeriod = 'day' | 'week' | 'month';

@Controller('statistics')
export class LegacyStatisticsController {
  constructor(private readonly legacy: GetLegacyStatisticsUseCase) {}

  @Get('revenue')
  @ApiSuccess('Revenue retrieved successfully')
  revenue(@User() user: IUser, @Query('type') type: LegacyPeriod = 'day') {
    return this.legacy.revenue(user.storeId, type);
  }

  @Get('summary-revenue')
  @ApiSuccess('Revenue summary retrieved successfully')
  summary(@User() user: IUser, @Query('type') type: LegacyPeriod = 'day') {
    return this.legacy.summary(user.storeId, type);
  }

  @Get('revenue-by-category')
  @ApiSuccess('Category revenue retrieved successfully')
  revenueByCategory(
    @User() user: IUser,
    @Query('type') type: LegacyPeriod = 'day',
  ) {
    return this.legacy.revenueByCategory(user.storeId, type);
  }

  @Get('top-products')
  @ApiSuccess('Top products retrieved successfully')
  topProducts(@User() user: IUser) {
    return this.legacy.topProducts(user.storeId);
  }

  @Get('low-stock-product')
  @ApiSuccess('Low-stock products retrieved successfully')
  lowStockProducts(@User() user: IUser) {
    return this.legacy.lowStockProducts(user.storeId);
  }

  @Get('notifications')
  @ApiSuccess('Recent activity retrieved successfully')
  notifications(
    @User() user: IUser,
    @Query('type') type: AnalyticsActivityType = AnalyticsActivityType.ALL,
    @Query('limit') limit = 5,
  ) {
    return this.legacy.notifications(user.storeId, type, Number(limit));
  }
}
