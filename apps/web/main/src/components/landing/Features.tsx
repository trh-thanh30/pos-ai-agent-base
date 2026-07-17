import {
  BadgeCheck,
  BarChart3,
  Boxes,
  CreditCard,
  ReceiptText,
  ScanBarcode,
  UsersRound,
} from "lucide-react";

import { LandingSection, SectionHeader } from "./LandingSection";

const metrics = [
  { value: "12+", label: "nghiệp vụ bán lẻ cốt lõi" },
  { value: "3 phút", label: "để tạo đơn và xuất hóa đơn" },
  { value: "24/7", label: "theo dõi vận hành từ xa" },
];

const features = [
  {
    icon: ScanBarcode,
    title: "Bán hàng tại quầy nhanh",
    desc: "Quét mã, áp khuyến mãi, chọn phương thức thanh toán và in hoá đơn trong một luồng thao tác ngắn.",
  },
  {
    icon: Boxes,
    title: "Kho nhiều điểm bán",
    desc: "Theo dõi tồn kho theo chi nhánh, cảnh báo thiếu hàng, nhập xuất và chuyển kho nội bộ rõ ràng.",
  },
  {
    icon: UsersRound,
    title: "Khách hàng và thành viên",
    desc: "Lưu lịch sử mua hàng, phân nhóm khách, điểm thưởng và chăm sóc lại đúng thời điểm.",
  },
  {
    icon: ReceiptText,
    title: "Hóa đơn và chứng từ",
    desc: "Hỗ trợ quy trình hoá đơn điện tử, phiếu bán, phiếu nhập và lịch sử giao dịch có thể truy vết.",
  },
  {
    icon: BarChart3,
    title: "Báo cáo theo thời gian thực",
    desc: "Xem doanh thu, lợi nhuận, sản phẩm bán chạy và hiệu suất chi nhánh ngay khi dữ liệu phát sinh.",
  },
  {
    icon: CreditCard,
    title: "Thanh toán linh hoạt",
    desc: "Hỗ trợ tiền mặt, chuyển khoản, ví điện tử và cấu hình thanh toán theo từng cửa hàng.",
  },
];

export default function Features() {
  return (
    <LandingSection id="features">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <SectionHeader
            align="left"
            eyebrow="Tính năng cốt lõi"
            title="Từ quầy bán đến báo cáo chuỗi, mọi thứ nằm trong một luồng vận hành"
            description="EraPOS được thiết kế cho người dùng thao tác mỗi ngày: chủ cửa hàng, thu ngân, quản lý kho và đội vận hành chuỗi."
          />

          <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {metrics.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="text-3xl font-bold text-slate-950">
                  {item.value}
                </div>
                <p className="mt-1 text-sm font-medium text-slate-600">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((item) => (
            <article
              key={item.title}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/60"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-pos-blue-500 transition group-hover:bg-pos-blue-500 group-hover:text-white">
                  <item.icon className="h-6 w-6" />
                </div>
                <BadgeCheck className="h-5 w-5 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-950">{item.title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </LandingSection>
  );
}
