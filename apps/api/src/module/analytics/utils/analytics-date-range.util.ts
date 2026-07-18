import { Injectable } from '@nestjs/common';
import { ValidationError } from 'app/common/response';
import dayjs, { type Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { ANALYTICS_ERROR_MESSAGES } from '../analytics.errors';
import {
  AnalyticsCompare,
  type AnalyticsDateRange,
  AnalyticsGroupBy,
  type AnalyticsRangeInput,
  AnalyticsPreset,
} from '../types/analytics-query.type';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);

@Injectable()
export class AnalyticsDateRangeUtil {
  resolve(input: AnalyticsRangeInput): AnalyticsDateRange {
    const timezoneName = input.timezone || 'Asia/Ho_Chi_Minh';
    this.assertTimezone(timezoneName);

    const preset = input.preset || AnalyticsPreset.LAST_30_DAYS;
    const now = dayjs().tz(timezoneName);
    const { from, to } = this.resolveCurrentRange(input, preset, now);
    this.assertRange(from, to);

    const compare = input.compare || AnalyticsCompare.PREVIOUS_PERIOD;
    const result: AnalyticsDateRange = {
      from: from.toDate(),
      to: to.toDate(),
      timezone: timezoneName,
      groupBy: input.groupBy || this.inferGroupBy(from, to),
      compare,
    };

    if (compare !== AnalyticsCompare.NONE) {
      result.previous = this.resolvePreviousRange(from, to, compare);
    }

    return result;
  }

  assertStoreId(storeId?: string): asserts storeId is string {
    if (!storeId) {
      throw new ValidationError(ANALYTICS_ERROR_MESSAGES.STORE_REQUIRED);
    }
  }

  private resolveCurrentRange(
    input: AnalyticsRangeInput,
    preset: AnalyticsPreset,
    now: Dayjs,
  ) {
    const timezoneName = input.timezone || 'Asia/Ho_Chi_Minh';
    switch (preset) {
      case AnalyticsPreset.TODAY:
        return { from: now.startOf('day'), to: now };
      case AnalyticsPreset.LAST_7_DAYS:
        return { from: now.subtract(6, 'day').startOf('day'), to: now };
      case AnalyticsPreset.THIS_WEEK:
        return { from: now.startOf('isoWeek'), to: now };
      case AnalyticsPreset.THIS_MONTH:
        return { from: now.startOf('month'), to: now };
      case AnalyticsPreset.CUSTOM:
        if (!input.from || !input.to) {
          throw new ValidationError(
            ANALYTICS_ERROR_MESSAGES.CUSTOM_RANGE_REQUIRED,
          );
        }
        return {
          from: this.parseBoundary(input.from, timezoneName, 'start'),
          to: this.parseBoundary(input.to, timezoneName, 'end'),
        };
      case AnalyticsPreset.LAST_30_DAYS:
      default:
        return { from: now.subtract(29, 'day').startOf('day'), to: now };
    }
  }

  private parseBoundary(
    value: string,
    timezoneName: string,
    boundary: 'start' | 'end',
  ) {
    const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
    const parsed = isDateOnly
      ? dayjs.tz(value, timezoneName)
      : dayjs(value).tz(timezoneName);
    return isDateOnly
      ? boundary === 'start'
        ? parsed.startOf('day')
        : parsed.endOf('day')
      : parsed;
  }

  private assertTimezone(timezoneName: string) {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: timezoneName }).format();
    } catch {
      throw new ValidationError(ANALYTICS_ERROR_MESSAGES.INVALID_TIMEZONE);
    }
  }

  private assertRange(from: Dayjs, to: Dayjs) {
    if (!from.isValid() || !to.isValid() || from.isAfter(to)) {
      throw new ValidationError(ANALYTICS_ERROR_MESSAGES.INVALID_DATE_RANGE);
    }
    if (to.diff(from, 'day', true) > 366) {
      throw new ValidationError(ANALYTICS_ERROR_MESSAGES.RANGE_TOO_LARGE);
    }
  }

  private inferGroupBy(from: Dayjs, to: Dayjs) {
    const days = to.diff(from, 'day', true);
    if (days <= 2) return AnalyticsGroupBy.HOUR;
    if (days <= 90) return AnalyticsGroupBy.DAY;
    if (days <= 180) return AnalyticsGroupBy.WEEK;
    return AnalyticsGroupBy.MONTH;
  }

  private resolvePreviousRange(
    from: Dayjs,
    to: Dayjs,
    compare: AnalyticsCompare,
  ) {
    if (compare === AnalyticsCompare.PREVIOUS_YEAR) {
      return {
        from: from.subtract(1, 'year').toDate(),
        to: to.subtract(1, 'year').toDate(),
      };
    }

    const durationMs = to.valueOf() - from.valueOf() + 1;
    const previousTo = from.subtract(1, 'millisecond');
    return {
      from: previousTo.subtract(durationMs - 1, 'millisecond').toDate(),
      to: previousTo.toDate(),
    };
  }
}
