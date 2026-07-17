import {
  ArrowRight,
  Boxes,
  BrainCircuit,
  Building2,
  ChartNoAxesCombined,
  MonitorSmartphone,
  Store,
} from 'lucide-react';

import { LandingSection, SectionHeader } from './LandingSection';

const personas = [
  {
    icon: Store,
    title: 'Cửa hàng nhỏ',
    desc: 'Bắt đầu nhanh với bán hàng, tồn kho, khách hàng và báo cáo cơ bản trên một giao diện dễ học. Giúp tối ưu hóa quy trình bán hàng hàng ngày, quản lý doanh thu hiệu quả và tránh thất thoát mà không đòi hỏi kỹ năng công nghệ cao.',
    points: [
      {
        title: 'Thiết lập trong ngày',
        desc: 'Import dữ liệu nhanh chóng, bắt đầu bán ngay lập tức.',
      },
      {
        title: 'Dùng trên mọi thiết bị',
        desc: 'Hoạt động mượt mà trên điện thoại, máy tính bảng và laptop.',
      },
      {
        title: 'Chi phí dễ kiểm soát',
        desc: 'Không phí ẩn, trả tiền theo nhu cầu thực tế của cửa hàng.',
      },
    ],
  },
  {
    icon: Building2,
    title: 'Chuỗi bán lẻ',
    desc: 'Chuẩn hoá vận hành nhiều chi nhánh, kiểm soát dữ liệu tập trung và ra quyết định theo thời gian thực. Giúp quản lý chuỗi dễ dàng theo dõi hiệu suất bán hàng của từng cửa hàng, tối ưu hóa chuỗi cung ứng kho vận và đồng bộ hóa chiến dịch khuyến mãi trên toàn hệ thống.',
    points: [
      {
        title: 'Quản lý đa điểm bán',
        desc: 'Theo dõi kho hàng và luân chuyển sản phẩm giữa các chi nhánh.',
      },
      {
        title: 'Phân quyền nhân sự',
        desc: 'Bảo mật thông tin bằng cách giới hạn quyền của từng nhân viên.',
      },
      {
        title: 'Báo cáo hợp nhất',
        desc: 'Dữ liệu kinh doanh toàn chuỗi được tổng hợp trên một hệ thống.',
      },
    ],
  },
];

const workflow = [
  {
    icon: MonitorSmartphone,
    title: 'Bán hàng',
    desc: 'Tạo đơn, quét mã, in hoá đơn nhanh tại quầy.',
  },
  {
    icon: Boxes,
    title: 'Đồng bộ kho',
    desc: 'Tự trừ tồn, cảnh báo thiếu hàng, chuyển kho nội bộ.',
  },
  {
    icon: ChartNoAxesCombined,
    title: 'Theo dõi hiệu suất',
    desc: 'Xem doanh thu, lợi nhuận, ca bán theo chi nhánh.',
  },
  {
    icon: BrainCircuit,
    title: 'AI gợi ý',
    desc: 'Nhận cảnh báo bất thường và đề xuất hành động tiếp theo.',
  },
];

export default function OperationsShowcase() {
  return (
    <LandingSection id="operations" tone="soft">
      <SectionHeader
        eyebrow="Vận hành linh hoạt"
        title="Một nền tảng cho cửa hàng đầu tiên đến chuỗi nhiều chi nhánh"
        description="NexPOS không ép bạn vào một quy trình cứng. Hệ thống đủ gọn để chủ cửa hàng dùng hằng ngày, và đủ sâu để đội vận hành chuỗi kiểm soát tăng trưởng."
      />

      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        {personas.map((item) => (
          <article
            key={item.title}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/80"
          >
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-50 text-pos-blue-500">
                <item.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-950">{item.title}</h3>
                <p className="mt-2 leading-7 text-slate-600">{item.desc}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {item.points.map((point) => (
                <div
                  key={point.title}
                  className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition duration-300 hover:bg-white hover:shadow-sm"
                >
                  <p className="text-sm font-bold text-slate-900">{point.title}</p>
                  <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{point.desc}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-4">
          {workflow.map((item, index) => (
            <div key={item.title} className="relative rounded-2xl bg-slate-50 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-pos-blue-500 shadow-sm">
                  <item.icon className="h-5 w-5" />
                </div>
                {index < workflow.length - 1 && (
                  <ArrowRight className="hidden h-5 w-5 text-slate-300 md:block" />
                )}
              </div>
              <h3 className="font-bold text-slate-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </LandingSection>
  );
}
