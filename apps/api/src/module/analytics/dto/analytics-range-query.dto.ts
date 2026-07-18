import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import {
  AnalyticsCompare,
  AnalyticsGroupBy,
  AnalyticsPreset,
} from '../types/analytics-query.type';

export class AnalyticsRangeQueryDto {
  @IsOptional()
  @IsEnum(AnalyticsPreset)
  preset: AnalyticsPreset = AnalyticsPreset.LAST_30_DAYS;

  @IsOptional()
  @IsDateString({}, { message: 'from must be a valid ISO date' })
  from?: string;

  @IsOptional()
  @IsDateString({}, { message: 'to must be a valid ISO date' })
  to?: string;

  @IsOptional()
  @IsString()
  timezone = 'Asia/Ho_Chi_Minh';

  @IsOptional()
  @IsEnum(AnalyticsGroupBy)
  groupBy?: AnalyticsGroupBy;

  @IsOptional()
  @IsEnum(AnalyticsCompare)
  compare: AnalyticsCompare = AnalyticsCompare.PREVIOUS_PERIOD;
}
