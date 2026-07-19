'use client';

import { SegmentedControl } from '@mantine/core';
import {
  AnalyticsPaymentDonut,
  AnalyticsRevenueChart,
} from '@repo/design-system/components/shared/chart-screen';
import { formatCompactNumber, formatCurrency } from '@repo/utils';
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  CreditCard,
  PackageCheck,
  ReceiptText,
  RefreshCw,
  RotateCcw,
  ShoppingBasket,
  TrendingUp,
  UserRoundCheck,
  UsersRound,
} from 'lucide-react';
import { useState } from 'react';
import useAnalytics, { type AnalyticsPreset } from '../../../hooks/analytics/use-analytics';
import { AnalyticsDashboardSkeleton } from '../components/analytics/analytics-dashboard-skeleton';
import { AnalyticsHeatmap } from '../components/analytics/analytics-heatmap';
import { AnalyticsKpiCard } from '../components/analytics/analytics-kpi-card';
import { AnalyticsPanel } from '../components/analytics/analytics-panel';

const presetOptions: Array<{ value: AnalyticsPreset; label: string }> = [
  { value: 'today', label: 'Hôm nay' },
  { value: '7d', label: '7 ngày' },
  { value: '30d', label: '30 ngày' },
  { value: 'this_month', label: 'Tháng này' },
];

const paymentMeta: Record<string, { label: string; color: string }> = {
  CASH: { label: 'Tiền mặt', color: '#1c7ed6' },
  BANK_TRANSFER: { label: 'Chuyển khoản', color: '#3f6fa8' },
  CREDIT_CARD: { label: 'Thẻ tín dụng', color: '#d18b28' },
  DEBIT_CARD: { label: 'Thẻ ghi nợ', color: '#c65d45' },
  DIGITAL_WALLET: { label: 'Ví điện tử', color: '#79589b' },
};

const orderStatusMeta: Record<string, { label: string; color: string }> = {
  COMPLETED: { label: 'Hoàn thành', color: '#1c7ed6' },
  PENDING: { label: 'Chờ xử lý', color: '#d18b28' },
  PROCESSING: { label: 'Đang xử lý', color: '#3f6fa8' },
  CANCELLED: { label: 'Đã hủy', color: '#c65d45' },
  RETURNED: { label: 'Đã trả', color: '#79589b' },
  OVERAGE: { label: 'Quá trình', color: '#6f7b81' },
};

const inventoryMeta = {
  out_of_stock: { label: 'Hết hàng', className: 'bg-[#fce9e6] text-[#b54232]' },
  critical: { label: 'Nguy cấp', className: 'bg-[#fce9e6] text-[#b54232]' },
  low: { label: 'Sắp hết', className: 'bg-[#fff3d6] text-[#97610f]' },
  slow_moving: { label: 'Bán chậm', className: 'bg-[#edf0f2] text-[#59666d]' },
  healthy: { label: 'Ổn định', className: 'bg-[#e7f5ed] text-[#237a48]' },
} as const;

export function DashboardView() {
  const [preset, setPreset] = useState<AnalyticsPreset>('30d');
  const { data, loading, refreshing, error, lastUpdated, refresh } = useAnalytics(preset);

  if (loading && !data) return <AnalyticsDashboardSkeleton />;

  if (error && !data) {
    return (
      <div className="grid min-h-[460px] place-items-center rounded-[8px] border border-[#e1e5e7] bg-white p-6 text-center">
        <div className="max-w-sm">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-[8px] bg-[#fce9e6] text-[#b54232]">
            <AlertTriangle size={22} aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-lg font-bold text-[#172126]">Chưa thể tải dữ liệu vận hành</h1>
          <p className="mt-2 text-sm text-[#69767d]">{error}</p>
          <button
            type="button"
            onClick={() => refresh()}
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-[7px] bg-[#172126] px-4 text-sm font-semibold text-white hover:bg-[#29363c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1c7ed6]"
          >
            <RotateCcw size={16} aria-hidden="true" />
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { overview } = data;
  const productMaxRevenue = Math.max(
    ...data.productPerformance.products.map((product) => product.revenue),
    1
  );
  const categoryMaxRevenue = Math.max(
    ...data.categoryPerformance.categories.map((category) => category.revenue),
    1
  );
  const paymentData = data.paymentBreakdown.methods.map((method, index) => {
    const meta = paymentMeta[method.method] || {
      label: method.method,
      color: ['#1c7ed6', '#3f6fa8', '#d18b28', '#c65d45', '#79589b'][index % 5],
    };
    return { name: meta.label, value: method.revenue, color: meta.color };
  });

  return (
    <div className="space-y-4 pb-6 text-[#172126]">
      <section className="flex flex-col gap-4 border-b border-[#dfe3e6] pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#1c7ed6]">
            <span className="h-2 w-2 rounded-full bg-[#1c7ed6]" />
            Nhịp vận hành
          </div>
          <h1 className="mt-1 text-2xl font-extrabold text-[#172126]">Tổng quan cửa hàng</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#69767d]">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} aria-hidden="true" />
              {formatPeriod(overview.period.from, overview.period.to)}
            </span>
            {lastUpdated && (
              <span className="inline-flex items-center gap-1.5">
                <Clock3 size={14} aria-hidden="true" />
                Cập nhật{' '}
                {lastUpdated.toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </p>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <div className="rounded-[8px] border border-[#d7dde0] bg-white p-1">
            <SegmentedControl
              value={preset}
              onChange={(v) => setPreset(v as typeof preset)}
              data={presetOptions.map((o) => ({ value: o.value, label: o.label }))}
              size="sm"
              radius="md"
              color="blue"
              styles={{
                root: { background: 'transparent', border: 'none' },
                label: { fontSize: '0.875rem', fontWeight: 500 },
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => refresh()}
            disabled={refreshing}
            title="Làm mới dữ liệu"
            aria-label="Làm mới dữ liệu"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] border border-[#d7dde0] bg-white text-[#526068] hover:border-[#9ba8ae] hover:text-[#172126] disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw size={17} className={refreshing ? 'animate-spin' : ''} aria-hidden="true" />
          </button>
        </div>
      </section>

      {error && (
        <div
          className="flex items-center gap-2 rounded-[7px] border border-[#efc8c0] bg-[#fff7f5] px-3 py-2 text-xs font-medium text-[#a84936]"
          role="status"
        >
          <AlertTriangle size={15} aria-hidden="true" />
          {error} Dữ liệu gần nhất vẫn đang được hiển thị.
        </div>
      )}

      <section
        className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6"
        aria-label="Chỉ số chính"
      >
        <AnalyticsKpiCard
          label="Doanh thu thuần"
          value={formatCurrency(overview.metrics.netRevenue.value)}
          changePercent={overview.metrics.netRevenue.changePercent}
          icon={CircleDollarSign}
          tone="teal"
        />
        <AnalyticsKpiCard
          label="Đơn hoàn thành"
          value={formatCompactNumber(overview.metrics.completedOrders.value)}
          changePercent={overview.metrics.completedOrders.changePercent}
          icon={ReceiptText}
          tone="blue"
        />
        <AnalyticsKpiCard
          label="Giá trị đơn TB"
          value={formatCurrency(overview.metrics.averageOrderValue.value)}
          changePercent={overview.metrics.averageOrderValue.changePercent}
          icon={ShoppingBasket}
          tone="amber"
        />
        <AnalyticsKpiCard
          label="Khách mua hàng"
          value={formatCompactNumber(overview.metrics.uniqueCustomers.value)}
          changePercent={overview.metrics.uniqueCustomers.changePercent}
          icon={UsersRound}
          tone="violet"
        />
        <AnalyticsKpiCard
          label="Sản phẩm đã bán"
          value={formatCompactNumber(overview.metrics.unitsSold.value)}
          changePercent={overview.metrics.unitsSold.changePercent}
          icon={Boxes}
          tone="gray"
        />
        <AnalyticsKpiCard
          label="Giá trị hoàn tiền"
          value={formatCurrency(overview.metrics.refundedAmount.value)}
          changePercent={overview.metrics.refundedAmount.changePercent}
          icon={RotateCcw}
          tone="coral"
          inverse
        />
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">
        <AnalyticsPanel
          title="Doanh thu theo thời gian"
          description={`${data.salesTrend.totals.orders} đơn · ${data.salesTrend.totals.unitsSold} sản phẩm`}
          icon={TrendingUp}
        >
          {data.salesTrend.series.length ? (
            <AnalyticsRevenueChart data={data.salesTrend.series} />
          ) : (
            <EmptyState label="Chưa có doanh thu trong kỳ" />
          )}
        </AnalyticsPanel>

        <AnalyticsPanel
          title="Sản phẩm dẫn đầu"
          description="Xếp hạng theo doanh thu"
          icon={BarChart3}
        >
          <div className="space-y-4">
            {data.productPerformance.products.length ? (
              data.productPerformance.products.map((product, index) => (
                <div
                  key={product.id}
                  className="grid grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-3"
                >
                  <span className="font-mono text-xs font-bold text-[#8a959a]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-xs font-bold text-[#263238]" title={product.name}>
                        {product.name}
                      </p>
                      <span className="shrink-0 text-[11px] text-[#69767d]">
                        {product.quantity} {product.baseUnit}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-[3px] bg-[#edf0f2]">
                      <div
                        className="h-full rounded-[3px] bg-blue-400"
                        style={{
                          width: `${Math.max(4, (product.revenue / productMaxRevenue) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="min-w-[78px] text-right text-xs font-bold text-[#172126]">
                    {formatCompactNumber(product.revenue)}
                  </span>
                </div>
              ))
            ) : (
              <EmptyState label="Chưa có sản phẩm bán ra" />
            )}
          </div>
        </AnalyticsPanel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <AnalyticsPanel
          title="Hiệu suất ngành hàng"
          description="Doanh thu được phân bổ theo giá trị từng dòng hàng"
          icon={BarChart3}
        >
          <div className="space-y-4">
            {data.categoryPerformance.categories.length ? (
              data.categoryPerformance.categories.map((category) => (
                <div
                  key={category.id}
                  className="grid grid-cols-[minmax(90px,0.45fr)_minmax(120px,1fr)_90px] items-center gap-3"
                >
                  <p
                    className="truncate text-xs font-semibold text-[#435057]"
                    title={category.name}
                  >
                    {category.name}
                  </p>
                  <div className="h-7 overflow-hidden rounded-[5px] bg-[#edf0f2]">
                    <div
                      className="flex h-full items-center bg-pos-blue-100 px-2"
                      style={{
                        width: `${Math.max(5, (category.revenue / categoryMaxRevenue) * 100)}%`,
                      }}
                    >
                      <span className="text-[10px] font-bold text-pos-blue-500 text-nowrap">
                        {formatCompactNumber(category.quantity)} SP
                      </span>
                    </div>
                  </div>
                  <span className="text-right text-xs font-bold text-[#172126]">
                    {formatCompactNumber(category.revenue)}
                  </span>
                </div>
              ))
            ) : (
              <EmptyState label="Chưa có dữ liệu ngành hàng" />
            )}
          </div>
        </AnalyticsPanel>

        <AnalyticsPanel
          title="Phương thức thanh toán"
          description={`${data.paymentBreakdown.methods.length} phương thức phát sinh`}
          icon={CreditCard}
        >
          {paymentData.length ? (
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
              <AnalyticsPaymentDonut
                data={paymentData}
                total={data.paymentBreakdown.totalRevenue}
              />
              <div className="w-full min-w-0 space-y-3 sm:max-w-[210px]">
                {data.paymentBreakdown.methods.map((method, index) => {
                  const meta = paymentMeta[method.method] || {
                    label: method.method,
                    color: paymentData[index]?.color,
                  };
                  return (
                    <div
                      key={method.method}
                      className="flex items-center justify-between gap-3 text-xs"
                    >
                      <span className="flex min-w-0 items-center gap-2 text-[#5d6a71]">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                          style={{ backgroundColor: meta.color }}
                        />
                        <span className="truncate">{meta.label}</span>
                      </span>
                      <span className="shrink-0 font-bold text-[#263238]">
                        {method.percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <EmptyState label="Chưa có giao dịch thanh toán" />
          )}
        </AnalyticsPanel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <AnalyticsPanel
          title="Khung giờ bán hàng"
          description="Cường độ doanh thu theo thứ và giờ trong ngày"
          icon={Clock3}
        >
          <AnalyticsHeatmap data={data.heatmap.cells} />
        </AnalyticsPanel>

        <AnalyticsPanel
          title="Sức khỏe tồn kho"
          description={`${formatCompactNumber(data.inventoryHealth.summary.availableUnits)} sản phẩm khả dụng · Giá vốn ${formatCompactNumber(data.inventoryHealth.summary.stockValue)}`}
          icon={PackageCheck}
        >
          <div className="divide-y divide-[#edf0f2]">
            {data.inventoryHealth.variants.length ? (
              data.inventoryHealth.variants.map((variant) => {
                const meta = inventoryMeta[variant.status];
                return (
                  <div
                    key={variant.variantId}
                    className="grid grid-cols-[minmax(0,1fr)_70px_78px] items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p
                        className="truncate text-xs font-bold text-[#263238]"
                        title={`${variant.productName} · ${variant.variantName}`}
                      >
                        {variant.productName}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-[#77838a]">
                        {variant.variantName} · Bán {variant.sold}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-bold text-[#172126]">
                        {variant.available}
                      </p>
                      <p className="text-[10px] text-[#879198]">khả dụng</p>
                    </div>
                    <span
                      className={`rounded-[5px] px-2 py-1 text-center text-[10px] font-bold ${meta.className}`}
                    >
                      {meta.label}
                    </span>
                  </div>
                );
              })
            ) : (
              <EmptyState label="Chưa có dữ liệu tồn kho" />
            )}
          </div>
        </AnalyticsPanel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AnalyticsPanel
          title="Chất lượng khách hàng"
          description="Khách phát sinh đơn hoàn thành trong kỳ"
          icon={UserRoundCheck}
        >
          <div className="grid grid-cols-2 divide-x divide-y divide-[#e5e9eb] sm:grid-cols-4 sm:divide-y-0">
            <CustomerMetric
              label="Đang hoạt động"
              value={data.customerInsights.summary.activeCustomers}
            />
            <CustomerMetric label="Khách mới" value={data.customerInsights.summary.newCustomers} />
            <CustomerMetric
              label="Quay lại"
              value={data.customerInsights.summary.returningCustomers}
            />
            <CustomerMetric
              label="Doanh thu/khách"
              value={data.customerInsights.summary.revenuePerCustomer}
              currency
            />
          </div>
        </AnalyticsPanel>

        <AnalyticsPanel
          title="Trạng thái đơn hàng"
          description={`${data.orderStatuses.totalOrders} đơn phát sinh trong kỳ`}
          icon={ReceiptText}
        >
          <div className="space-y-3">
            {data.orderStatuses.statuses.length ? (
              data.orderStatuses.statuses.map((status) => {
                const meta = orderStatusMeta[status.status] || {
                  label: status.status,
                  color: '#6f7b81',
                };
                return (
                  <div
                    key={status.status}
                    className="grid grid-cols-[90px_minmax(100px,1fr)_58px] items-center gap-3"
                  >
                    <span className="truncate text-xs font-semibold text-[#526068]">
                      {meta.label}
                    </span>
                    <div className="h-2 overflow-hidden rounded-[4px] bg-[#edf0f2]">
                      <div
                        className="h-full rounded-[4px]"
                        style={{
                          width: `${Math.max(2, status.percentage)}%`,
                          backgroundColor: meta.color,
                        }}
                      />
                    </div>
                    <span className="text-right font-mono text-xs font-bold text-[#263238]">
                      {status.orders} · {status.percentage}%
                    </span>
                  </div>
                );
              })
            ) : (
              <EmptyState label="Chưa có đơn hàng trong kỳ" />
            )}
          </div>
        </AnalyticsPanel>
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="grid min-h-40 place-items-center text-center text-xs font-medium text-[#7d898f]">
      {label}
    </div>
  );
}

function CustomerMetric({
  label,
  value,
  currency = false,
}: {
  label: string;
  value: number;
  currency?: boolean;
}) {
  return (
    <div className="min-w-0 px-4 py-3 first:pl-0 last:pr-0">
      <p
        className="truncate text-lg font-extrabold text-[#172126]"
        title={currency ? formatCurrency(value) : String(value)}
      >
        {currency ? formatCompactNumber(value) : formatCompactNumber(value)}
      </p>
      <p className="mt-1 text-[11px] font-medium text-[#748087]">{label}</p>
    </div>
  );
}

function formatPeriod(from: string, to: string) {
  const formatter = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  return `${formatter.format(new Date(from))} – ${formatter.format(new Date(to))}`;
}
