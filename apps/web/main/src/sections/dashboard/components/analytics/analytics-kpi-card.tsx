import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

export function AnalyticsKpiCard({
  label,
  value,
  changePercent,
  icon: Icon,
  tone,
  inverse = false,
}: {
  label: string;
  value: string;
  changePercent: number | null;
  icon: LucideIcon;
  tone: "teal" | "blue" | "amber" | "coral" | "violet" | "gray";
  inverse?: boolean;
}) {
  const tones = {
    teal: "bg-[#e6f3f1] text-[#0f766e]",
    blue: "bg-[#e9f0fb] text-[#3567a8]",
    amber: "bg-[#fff3d6] text-[#9a6512]",
    coral: "bg-[#fceae5] text-[#b54e36]",
    violet: "bg-[#f0ecf8] text-[#76539b]",
    gray: "bg-[#edf0f2] text-[#526068]",
  } as const;
  const favorableChange =
    changePercent === null ? 0 : inverse ? -changePercent : changePercent;
  const isPositive = favorableChange > 0;
  const isNegative = favorableChange < 0;
  const DeltaIcon =
    changePercent !== null && changePercent > 0
      ? ArrowUpRight
      : changePercent !== null && changePercent < 0
        ? ArrowDownRight
        : Minus;

  return (
    <article className="min-h-[126px] rounded-[8px] border border-[#dfe3e6] bg-white p-4 transition-colors hover:border-[#b7c2c7]">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`grid h-9 w-9 place-items-center rounded-[7px] ${tones[tone]}`}
        >
          <Icon size={18} aria-hidden="true" />
        </span>
        <span
          className={`inline-flex h-6 items-center gap-1 rounded-[6px] px-2 text-[11px] font-bold ${
            isPositive
              ? "bg-[#e7f5ed] text-[#237a48]"
              : isNegative
                ? "bg-[#fce9e6] text-[#b54232]"
                : "bg-[#f1f3f4] text-[#6c777d]"
          }`}
          aria-label={
            changePercent === null
              ? "Chưa có dữ liệu kỳ trước"
              : `${changePercent > 0 ? "Tăng" : changePercent < 0 ? "Giảm" : "Không đổi"} ${Math.abs(changePercent)} phần trăm`
          }
        >
          <DeltaIcon size={13} aria-hidden="true" />
          {changePercent === null ? "Mới" : `${Math.abs(changePercent)}%`}
        </span>
      </div>
      <p
        className="mt-3 truncate text-xl font-extrabold text-[#172126]"
        title={value}
      >
        {value}
      </p>
      <p className="mt-1 text-xs font-medium text-[#69767d]">{label}</p>
    </article>
  );
}
