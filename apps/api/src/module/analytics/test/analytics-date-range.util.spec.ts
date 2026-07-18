import { ValidationError } from 'app/common/response';
import { AnalyticsDateRangeUtil } from '../utils/analytics-date-range.util';
import {
  AnalyticsCompare,
  AnalyticsGroupBy,
  AnalyticsPreset,
} from '../types/analytics-query.type';

describe('AnalyticsDateRangeUtil', () => {
  const util = new AnalyticsDateRangeUtil();

  it('resolves custom date-only boundaries in the requested timezone', () => {
    const result = util.resolve({
      preset: AnalyticsPreset.CUSTOM,
      from: '2026-07-01',
      to: '2026-07-07',
      timezone: 'Asia/Ho_Chi_Minh',
      compare: AnalyticsCompare.PREVIOUS_PERIOD,
    });

    expect(result.from.toISOString()).toBe('2026-06-30T17:00:00.000Z');
    expect(result.to.toISOString()).toBe('2026-07-07T16:59:59.999Z');
    expect(result.groupBy).toBe(AnalyticsGroupBy.DAY);
    expect(result.previous?.to.getTime()).toBe(result.from.getTime() - 1);
  });

  it('rejects a custom range without both boundaries', () => {
    expect(() =>
      util.resolve({
        preset: AnalyticsPreset.CUSTOM,
        from: '2026-07-01',
      }),
    ).toThrow(ValidationError);
  });

  it('rejects missing store context', () => {
    expect(() => util.assertStoreId(undefined)).toThrow(ValidationError);
  });
});
