import {
  BarChart3,
  PackageCheck,
  ReceiptText,
  ShoppingCart,
  Sparkles,
  Store,
  TrendingUp,
} from "lucide-react";

const stats = [
  { label: "Doanh thu hôm nay", value: "128.4M", trend: "+18%" },
  { label: "Đơn hoàn tất", value: "1,246", trend: "+9%" },
  { label: "Tồn kho cảnh báo", value: "32", trend: "-12%" },
];

const branches = [
  { name: "CN Quận 1", revenue: "42.8M", status: "Tăng trưởng" },
  { name: "CN Cầu Giấy", revenue: "38.2M", status: "Ổn định" },
  { name: "CN Hải Châu", revenue: "27.6M", status: "Cần nhập kho" },
];

const modules = [
  { icon: ShoppingCart, label: "Bán hàng" },
  { icon: PackageCheck, label: "Kho" },
  { icon: ReceiptText, label: "Hoá đơn" },
  { icon: BarChart3, label: "Báo cáo" },
];

export default function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-3xl">
      <div className="absolute -right-3 top-10 hidden rounded-2xl border border-white/30 bg-white/85 px-4 py-3 shadow-xl shadow-blue-950/15 backdrop-blur md:block">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Sparkles className="h-4 w-4 text-amber-500" />
          AI gợi ý nhập thêm 12 SKU
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-white/20 bg-white shadow-2xl shadow-blue-950/25">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Live operations
          </span>
        </div>

        <div className="grid gap-0 lg:grid-cols-[180px_1fr]">
          <aside className="hidden border-r border-slate-200 bg-slate-950 p-4 text-white lg:block">
            <div className="mb-6 flex items-center gap-2 text-sm font-semibold">
              <Store className="h-4 w-4 text-cyan-300" />
              Retail Hub
            </div>
            <div className="space-y-2">
              {modules.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 rounded-xl bg-white/8 px-3 py-2 text-sm text-slate-200"
                >
                  <item.icon className="h-4 w-4 text-cyan-200" />
                  {item.label}
                </div>
              ))}
            </div>
          </aside>

          <div className="bg-white p-4 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Tổng quan chuỗi
                </p>
                <h3 className="text-2xl font-bold text-slate-950">
                  12 cửa hàng đang hoạt động
                </h3>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                <TrendingUp className="h-4 w-4" />
                +14.8% tuần này
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="text-xs font-medium text-slate-500">
                    {item.label}
                  </p>
                  <div className="mt-2 flex items-baseline justify-between gap-2">
                    <span className="text-xl font-bold text-slate-950">
                      {item.value}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600">
                      {item.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200">
              <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">
                Hiệu suất theo chi nhánh
              </div>
              <div className="divide-y divide-slate-100">
                {branches.map((branch) => (
                  <div
                    key={branch.name}
                    className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {branch.name}
                      </p>
                      <p className="text-sm text-slate-500">{branch.status}</p>
                    </div>
                    <span className="font-bold text-slate-950">
                      {branch.revenue}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
