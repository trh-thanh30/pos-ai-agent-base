"use client";

import {
  BrainCircuit,
  CircleDollarSign,
  PackageSearch,
  ReceiptText,
  ShieldAlert,
  TrendingUp,
  ListTodo,
} from "lucide-react";
import { useState } from "react";

import { LandingSection, SectionHeader } from "./LandingSection";

const items = [
  {
    icon: BrainCircuit,
    title: "AI trợ lý vận hành",
    desc: "Tóm tắt tình hình bán hàng, phát hiện bất thường và gợi ý việc nên làm tiếp theo cho từng chi nhánh.",
    insight: "Chi nhánh Quận 1 tăng 18% doanh thu nhờ nhóm sản phẩm đồ uống.",
    actions: [
      {
        type: "success",
        label: "Cơ hội",
        text: "Tăng thêm tồn kho nhóm Trà sữa và Cà phê cho chi nhánh Quận 1 trước giờ cao điểm chiều.",
      },
      {
        type: "warning",
        label: "Kiểm tra",
        text: "Phát hiện chênh lệch doanh thu tiền mặt 150,000đ tại Quầy số 2 chi nhánh Bình Thạnh.",
      }
    ]
  },
  {
    icon: PackageSearch,
    title: "Cảnh báo tồn kho",
    desc: "Theo dõi tồn thấp, hàng bán chậm và đề xuất nhập hàng dựa trên tốc độ bán thực tế.",
    insight: "12 SKU sắp hết trong 48 giờ, ưu tiên nhập từ nhà cung cấp A.",
    actions: [
      {
        type: "danger",
        label: "Hết hàng",
        text: "Mặt hàng Sữa đặc Vinamilk còn dưới mức tối thiểu (3 lon). Đề xuất nhập thêm 24 lon.",
      },
      {
        type: "info",
        label: "Tối ưu",
        text: "Bia Heineken lon có tốc độ bán nhanh gấp 1.8 lần. Đề xuất chuyển 5 thùng từ kho Quận 3 sang.",
      }
    ]
  },
  {
    icon: ReceiptText,
    title: "Hóa đơn từ máy tính tiền",
    desc: "Hỗ trợ quy trình xuất hóa đơn, lưu chứng từ và đối soát dữ liệu bán hàng tập trung.",
    insight: "98.6% hóa đơn hôm nay đã đồng bộ, 4 giao dịch cần kiểm tra lại.",
    actions: [
      {
        type: "warning",
        label: "Chưa đồng bộ",
        text: "Hóa đơn số #HD-9082 bị lỗi mạng lúc 11:30 chưa gửi lên cơ quan Thuế. Click để thử lại.",
      },
      {
        type: "success",
        label: "Đồng bộ",
        text: "Hoàn tất đối soát doanh thu ca sáng với 142 hóa đơn điện tử tự động xuất thành công.",
      }
    ]
  },
  {
    icon: CircleDollarSign,
    title: "Theo dõi biên lợi nhuận",
    desc: "Nhìn rõ doanh thu, giá vốn, chiết khấu và lợi nhuận theo sản phẩm hoặc cửa hàng.",
    insight: "Nhóm hàng FMCG có biên lợi nhuận giảm 3.2% so với tuần trước.",
    actions: [
      {
        type: "danger",
        label: "Biên thấp",
        text: "Nhóm Nước ngọt có ga biên lợi nhuận giảm mạnh do nhà cung cấp tăng giá đầu vào 5%.",
      },
      {
        type: "success",
        label: "Khuyến nghị",
        text: "Chạy chương trình Combo thức ăn + nước uống để cải thiện biên lợi nhuận gộp lên 8%.",
      }
    ]
  },
  {
    icon: ShieldAlert,
    title: "Kiểm soát rủi ro",
    desc: "Phát hiện hoàn trả bất thường, chênh lệch kho và thao tác nhạy cảm trong ca bán.",
    insight: "2 ca bán có tỉ lệ hủy đơn cao hơn ngưỡng trung bình.",
    actions: [
      {
        type: "danger",
        label: "Rủi ro cao",
        text: "Thu ngân Nguyễn Văn A thực hiện hủy 4 đơn hàng sau khi in hóa đơn tạm tính cho khách.",
      },
      {
        type: "warning",
        label: "Đăng nhập",
        text: "Tài khoản quản lý chi nhánh Phú Nhuận đăng nhập vào hệ thống lúc 23:45 ngoài giờ hoạt động.",
      }
    ]
  },
];

export default function AssistantFeatureSection() {
  const [idx, setIdx] = useState(0);
  const active = items[idx];

  return (
    <LandingSection id="solutions" tone="white" className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(14,165,233,0.12),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(34,197,94,0.1),transparent_30%)]" />
      <SectionHeader
        eyebrow="AI assistant"
        title="Không chỉ ghi nhận dữ liệu, NexPOS giúp bạn hiểu chuyện gì đang xảy ra"
        description="Trợ lý AI biến dữ liệu vận hành thành cảnh báo, gợi ý và ưu tiên công việc để chủ cửa hàng và quản lý chuỗi bớt phải dò từng báo cáo."
      />

      <div className="mt-12 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-3">
          {items.map((item, index) => {
            const isActive = index === idx;
            return (
              <button
                key={item.title}
                type="button"
                onClick={() => setIdx(index)}
                className={`w-full rounded-3xl border p-5 text-left transition ${
                  isActive
                    ? "border-blue-200 bg-white text-slate-950 shadow-xl shadow-blue-100/50"
                    : "border-slate-200/80 bg-white/40 text-slate-700 hover:bg-white/80 hover:border-slate-300"
                } focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${
                      isActive ? "bg-blue-50 text-pos-blue-500" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-950">{item.title}</h3>
                    <p
                      className={`mt-2 text-sm leading-6 ${
                        isActive ? "text-slate-600" : "text-slate-500"
                      }`}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-[2rem] border border-slate-200/80 bg-white/60 p-5 text-slate-950 shadow-xl shadow-slate-200/60 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="rounded-3xl bg-gradient-to-br from-white via-slate-50/80 to-blue-50/30 p-6 text-slate-950 shadow-md border border-slate-200/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-1.5 mb-4 relative z-10">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400/90" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
              </div>
              <div className="flex items-center justify-between gap-4 relative z-10">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-pos-blue-600">
                    NexPOS AI briefing
                  </p>
                  <h3 className="mt-1.5 text-2xl font-extrabold text-slate-950">{active.title}</h3>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                  <active.icon className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-5 rounded-2xl bg-slate-50/80 p-4 leading-7 text-slate-700 border border-slate-100 relative z-10 text-sm font-medium">
                {active.insight}
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Ưu tiên hôm nay", val: "08", icon: ListTodo, color: "text-blue-500" },
                { label: "Rủi ro cần xem", val: "03", icon: ShieldAlert, color: "text-amber-500" },
                { label: "Cơ hội tăng trưởng", val: "12", icon: TrendingUp, color: "text-emerald-500" },
              ].map((card) => (
                <div key={card.label} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 shadow-sm">
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                  <p className="mt-3 text-xs font-semibold text-slate-500">
                    {card.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-950">
                    {card.val}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Khuyến nghị hành động từ NexPOS AI
              </h4>
            </div>

            <div className="space-y-3">
              {active.actions.map((act, i) => {
                const isDanger = act.type === "danger";
                const isWarning = act.type === "warning";
                const isSuccess = act.type === "success";

                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/30 p-3.5 transition hover:bg-white hover:shadow-sm"
                  >
                    <span
                      className={`inline-flex items-center shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold ${
                        isDanger
                          ? "bg-rose-50 text-rose-600 border border-rose-100"
                          : isWarning
                          ? "bg-amber-50 text-amber-600 border border-amber-100"
                          : isSuccess
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                          : "bg-blue-50 text-blue-600 border border-blue-100"
                      }`}
                    >
                      {act.label}
                    </span>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {act.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </LandingSection>
  );
}
