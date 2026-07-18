export function AnalyticsDashboardSkeleton() {
  return (
    <div
      className="animate-pulse space-y-4"
      aria-label="Đang tải dữ liệu phân tích"
    >
      <div className="h-16 rounded-[8px] bg-[#e5e9eb]" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-[126px] rounded-[8px] bg-[#e5e9eb]" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.75fr)]">
        <div className="h-[390px] rounded-[8px] bg-[#e5e9eb]" />
        <div className="h-[390px] rounded-[8px] bg-[#e5e9eb]" />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-[360px] rounded-[8px] bg-[#e5e9eb]" />
        <div className="h-[360px] rounded-[8px] bg-[#e5e9eb]" />
      </div>
    </div>
  );
}
