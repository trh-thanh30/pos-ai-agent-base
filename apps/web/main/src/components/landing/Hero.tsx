import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";

import DashboardPreview from "./DashboardPreview";
import { LandingContainer } from "./LandingSection";

const trustItems = [
  "Bán hàng tại quầy",
  "Quản lý đa chi nhánh",
  "Báo cáo thời gian thực",
];

export default function Hero() {
  return (
    <section
      id="home"
      className="relative isolate overflow-hidden bg-[#f7fbff] pb-16 pt-10 sm:pb-20 lg:pb-24"
    >
      <div className="absolute inset-x-0 top-0 -z-10 h-[620px] bg-[radial-gradient(circle_at_20%_10%,rgba(14,165,233,0.20),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(34,197,94,0.14),transparent_30%),linear-gradient(180deg,#eff7ff_0%,#ffffff_78%)]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent" />

      <LandingContainer className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(560px,1.05fr)]">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-2 text-sm font-semibold text-pos-blue-500 shadow-sm">
            <ShieldCheck className="h-4 w-4" />
            Nền tảng quản trị bán lẻ cho cửa hàng và chuỗi
          </div>

          <h1 className="mt-6 text-4xl font-bold leading-[1.05] text-slate-950 sm:text-5xl lg:text-6xl">
            Quản lý bán lẻ gọn như cửa hàng nhỏ, mạnh như một chuỗi nhiều chi nhánh.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            EraPOS gom bán hàng, kho, khách hàng, hóa đơn, báo cáo và trợ lý AI vào một hệ thống rõ ràng để đội ngũ vận hành nhanh hơn mỗi ngày.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-pos-blue-500 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
            >
              Dùng thử miễn phí
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
            >
              Nhận tư vấn triển khai
            </a>
          </div>

          <div className="mt-8 grid gap-3 text-sm font-semibold text-slate-700 sm:grid-cols-3">
            {trustItems.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <DashboardPreview />
      </LandingContainer>
    </section>
  );
}
