"use client";

import {
  BrainCircuit,
  CheckCircle2,
  CircleDollarSign,
  PackageSearch,
  ReceiptText,
  ShieldAlert,
} from "lucide-react";
import { useState } from "react";

import { LandingSection, SectionHeader } from "./LandingSection";

const items = [
  {
    icon: BrainCircuit,
    title: "AI trợ lý vận hành",
    desc: "Tóm tắt tình hình bán hàng, phát hiện bất thường và gợi ý việc nên làm tiếp theo cho từng chi nhánh.",
    insight: "Chi nhánh Quận 1 tăng 18% doanh thu nhờ nhóm sản phẩm đồ uống.",
  },
  {
    icon: PackageSearch,
    title: "Cảnh báo tồn kho",
    desc: "Theo dõi tồn thấp, hàng bán chậm và đề xuất nhập hàng dựa trên tốc độ bán thực tế.",
    insight: "12 SKU sắp hết trong 48 giờ, ưu tiên nhập từ nhà cung cấp A.",
  },
  {
    icon: ReceiptText,
    title: "Hóa đơn từ máy tính tiền",
    desc: "Hỗ trợ quy trình xuất hóa đơn, lưu chứng từ và đối soát dữ liệu bán hàng tập trung.",
    insight: "98.6% hóa đơn hôm nay đã đồng bộ, 4 giao dịch cần kiểm tra lại.",
  },
  {
    icon: CircleDollarSign,
    title: "Theo dõi biên lợi nhuận",
    desc: "Nhìn rõ doanh thu, giá vốn, chiết khấu và lợi nhuận theo sản phẩm hoặc cửa hàng.",
    insight: "Nhóm hàng FMCG có biên lợi nhuận giảm 3.2% so với tuần trước.",
  },
  {
    icon: ShieldAlert,
    title: "Kiểm soát rủi ro",
    desc: "Phát hiện hoàn trả bất thường, chênh lệch kho và thao tác nhạy cảm trong ca bán.",
    insight: "2 ca bán có tỉ lệ hủy đơn cao hơn ngưỡng trung bình.",
  },
];

export default function AssistantFeatureSection() {
  const [idx, setIdx] = useState(0);
  const active = items[idx];

  return (
    <LandingSection id="solutions" tone="dark" className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(34,197,94,0.16),transparent_30%)]" />
      <SectionHeader
        dark
        eyebrow="AI assistant"
        title="Không chỉ ghi nhận dữ liệu, EraPOS giúp bạn hiểu chuyện gì đang xảy ra"
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
                    ? "border-cyan-300/60 bg-white text-slate-950 shadow-2xl shadow-cyan-950/20"
                    : "border-white/10 bg-white/6 text-white hover:bg-white/10"
                } focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${
                      isActive ? "bg-blue-50 text-pos-blue-500" : "bg-white/10 text-cyan-200"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">{item.title}</h3>
                    <p
                      className={`mt-2 text-sm leading-6 ${
                        isActive ? "text-slate-600" : "text-slate-300"
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

        <div className="rounded-[2rem] border border-white/10 bg-white p-5 text-slate-950 shadow-2xl shadow-black/20">
          <div className="rounded-3xl bg-slate-950 p-5 text-white">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-cyan-200">
                  EraPOS AI briefing
                </p>
                <h3 className="mt-1 text-2xl font-bold">{active.title}</h3>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-300 text-slate-950">
                <active.icon className="h-6 w-6" />
              </div>
            </div>
            <p className="mt-5 rounded-2xl bg-white/8 p-4 leading-7 text-slate-200">
              {active.insight}
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {["Ưu tiên hôm nay", "Rủi ro cần xem", "Cơ hội tăng trưởng"].map(
              (label, index) => (
                <div key={label} className="rounded-2xl bg-slate-50 p-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <p className="mt-3 text-sm font-semibold text-slate-900">
                    {label}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-950">
                    {index === 0 ? "08" : index === 1 ? "03" : "12"}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </LandingSection>
  );
}
