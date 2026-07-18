import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import {
  AnalyticsActivityType,
  AnalyticsProductMetric,
} from '../types/analytics-query.type';
import { AnalyticsRangeQueryDto } from './analytics-range-query.dto';

export class AnalyticsListQueryDto extends AnalyticsRangeQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;

  @IsOptional()
  @IsEnum(AnalyticsProductMetric)
  metric: AnalyticsProductMetric = AnalyticsProductMetric.REVENUE;
}

export class AnalyticsActivityQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 10;

  @IsOptional()
  @IsEnum(AnalyticsActivityType)
  type: AnalyticsActivityType = AnalyticsActivityType.ALL;
}
