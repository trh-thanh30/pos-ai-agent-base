import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { AnalyticsGroupBy } from '../types/analytics-query.type';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);

@Injectable()
export class AnalyticsMapperUtil {
  bucketKey(date: Date, groupBy: AnalyticsGroupBy, timezoneName: string) {
    const value = dayjs(date).tz(timezoneName);
    switch (groupBy) {
      case AnalyticsGroupBy.HOUR:
        return value.startOf('hour').format('YYYY-MM-DD HH:00');
      case AnalyticsGroupBy.WEEK:
        return value.startOf('isoWeek').format('YYYY-MM-DD');
      case AnalyticsGroupBy.MONTH:
        return value.startOf('month').format('YYYY-MM');
      case AnalyticsGroupBy.DAY:
      default:
        return value.format('YYYY-MM-DD');
    }
  }

  round(value: number, precision = 2) {
    return Number(value.toFixed(precision));
  }

  bucketKeys(
    from: Date,
    to: Date,
    groupBy: AnalyticsGroupBy,
    timezoneName: string,
  ) {
    let cursor = dayjs(from).tz(timezoneName);
    const end = dayjs(to).tz(timezoneName);
    const keys: string[] = [];

    if (groupBy === AnalyticsGroupBy.HOUR) cursor = cursor.startOf('hour');
    if (groupBy === AnalyticsGroupBy.DAY) cursor = cursor.startOf('day');
    if (groupBy === AnalyticsGroupBy.WEEK) cursor = cursor.startOf('isoWeek');
    if (groupBy === AnalyticsGroupBy.MONTH) cursor = cursor.startOf('month');

    while (cursor.isBefore(end) || cursor.isSame(end)) {
      keys.push(this.bucketKey(cursor.toDate(), groupBy, timezoneName));
      cursor = cursor.add(1, groupBy);
    }

    return keys;
  }
}
