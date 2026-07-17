"use client";

import { Check, X } from "lucide-react";
import { useState } from "react";

import { LandingSection, SectionHeader } from "./LandingSection";

type PlanKey = "starter" | "growth" | "chain";

const plans: Record<
  PlanKey,
  {
    title: string;
    subtitle: string;
    priceMonthly: number;
    cta: string;
    featured?: boolean;
    note: string;
  }
> = {
  starter: {
    title: "Starter",
    subtitle: "Cho cửa hàng nhỏ bắt đầu quản lý bán hàng bài bản.",
    priceMonthly: 70,
    cta: "Dùng thử",
    note: "1 điểm bán",
  },
  growth: {
    title: "Growth",
    subtitle: "Cho cửa hàng đang tăng trưởng và cần kiểm soát kho tốt hơn.",
    priceMonthly: 180,
    cta: "Dùng thử",
    featured: true,
    note: "Tối ưu cho 2-5 điểm bán",
  },
  chain: {
    title: "Chain",
    subtitle: "Cho chuỗi bán lẻ cần phân quyền, báo cáo và triển khai riêng.",
    priceMonthly: 0,
    cta: "Nhận tư vấn",
    note: "Theo nhu cầu",
  },
};

const featureRows = [
  {
    label: "Bán hàng, sản phẩm, khách hàng",
    values: { starter: true, growth: true, chain: true },
  },
  {
    label: "Quản lý kho và cảnh báo tồn thấp",
    values: { starter: true, growth: true, chain: true },
  },
  {
    label: "Báo cáo theo chi nhánh",
    values: { starter: false, growth: true, chain: true },
  },
  {
    label: "Phân quyền nhân sự nâng cao",
    values: { starter: false, growth: true, chain: true },
  },
  {
    label: "AI assistant và cảnh báo vận hành",
    values: { starter: false, growth: true, chain: true },
  },
];

export default function PricingSection() {
  const [yearly, setYearly] = useState(false);

  const formatPrice = (price: number) => {
    if (price === 0) return "Liên hệ";
    const value = yearly ? price * 10 : price;
    return `${value.toLocaleString("vi-VN")}K`;
  };

  return (
    <LandingSection id="pricing">
      <SectionHeader
        eyebrow="Bảng giá"
        title="Bắt đầu gọn, mở rộng khi vận hành lớn hơn"
        description="Bạn có thể dùng thử trước khi chọn gói. Khi số lượng chi nhánh, nhân sự và quy trình tăng lên, NexPOS vẫn giữ trải nghiệm quản lý rõ ràng."
      />

      <div className="mt-8 flex justify-center">
        <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setYearly(false)}
            className={`rounded-full px-4 py-2 transition ${
              !yearly ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"
            }`}
          >
            Theo tháng
          </button>
          <button
            type="button"
            onClick={() => setYearly(true)}
            className={`rounded-full px-4 py-2 transition ${
              yearly ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"
            }`}
          >
            Theo năm - tiết kiệm 2 tháng
          </button>
        </div>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {Object.entries(plans).map(([key, plan]) => {
          const isFeatured = !!plan.featured;
          return (
            <article
              key={key}
              className={`relative flex h-full flex-col rounded-3xl border bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                isFeatured
                  ? "border-blue-300 shadow-blue-100 ring-4 ring-blue-50"
                  : "border-slate-200"
              }`}
            >
              {isFeatured && (
                <span className="mb-4 w-fit rounded-full bg-pos-blue-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                  Phổ biến
                </span>
              )}
              <h3 className="text-2xl font-bold text-slate-950">{plan.title}</h3>
              <p className="mt-3 min-h-14 leading-7 text-slate-600">
                {plan.subtitle}
              </p>
              <div className="mt-6 flex items-end gap-2">
                <span className="text-4xl font-bold text-slate-950">
                  {formatPrice(plan.priceMonthly)}
                </span>
                {plan.priceMonthly > 0 && (
                  <span className="pb-1 text-sm font-semibold text-slate-500">
                    / {yearly ? "năm" : "tháng"}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm font-medium text-slate-500">{plan.note}</p>

              <a
                href={plan.priceMonthly === 0 ? "#contact" : "/auth/register"}
                className={`mt-8 inline-flex justify-center rounded-full px-5 py-3 text-sm font-bold transition ${
                  isFeatured
                    ? "bg-pos-blue-500 text-white hover:bg-blue-700"
                    : "border border-slate-300 text-slate-800 hover:border-slate-400 hover:bg-slate-50"
                }`}
              >
                {plan.cta}
              </a>
            </article>
          );
        })}
      </div>

      <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-6 py-4 font-bold">Tính năng</th>
                <th className="px-6 py-4 text-center font-bold">Starter</th>
                <th className="px-6 py-4 text-center font-bold">Growth</th>
                <th className="px-6 py-4 text-center font-bold">Chain</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {featureRows.map((row) => (
                <tr key={row.label} className="odd:bg-white even:bg-slate-50/50">
                  <td className="px-6 py-4 font-medium text-slate-700">
                    {row.label}
                  </td>
                  <td className="px-6 py-4">
                    <Cell value={row.values.starter} />
                  </td>
                  <td className="px-6 py-4">
                    <Cell value={row.values.growth} />
                  </td>
                  <td className="px-6 py-4">
                    <Cell value={row.values.chain} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </LandingSection>
  );
}

function Cell({ value }: { value: boolean }) {
  return (
    <div className="flex items-center justify-center">
      <span
        className={`grid h-7 w-7 place-items-center rounded-full ${
          value ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
        }`}
      >
        {value ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
      </span>
    </div>
  );
}
