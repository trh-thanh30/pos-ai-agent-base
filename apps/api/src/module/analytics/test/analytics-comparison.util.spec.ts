import { AnalyticsComparisonUtil } from '../utils/analytics-comparison.util';

describe('AnalyticsComparisonUtil', () => {
  const util = new AnalyticsComparisonUtil();

  it('calculates absolute and percentage changes', () => {
    expect(util.metric(150, 100)).toEqual({
      value: 150,
      previousValue: 100,
      changeValue: 50,
      changePercent: 50,
    });
  });

  it('does not invent a percentage when the previous value is zero', () => {
    expect(util.metric(10, 0).changePercent).toBeNull();
    expect(util.metric(0, 0).changePercent).toBe(0);
  });
});
