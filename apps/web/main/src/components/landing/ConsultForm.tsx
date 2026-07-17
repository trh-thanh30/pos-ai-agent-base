import { CalendarCheck2, CheckCircle2, Headphones, ShieldCheck } from 'lucide-react';

import { LandingContainer } from './LandingSection';

const benefits = [
  'Tư vấn mô hình phù hợp cho cửa hàng nhỏ hoặc chuỗi bán lẻ',
  'Demo luồng bán hàng, kho, báo cáo và phân quyền',
  'Gợi ý lộ trình triển khai không làm gián đoạn vận hành',
  'Dùng thử trước khi quyết định gói phù hợp',
];

export default function ConsultForm() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-[#06172f] py-16 text-white sm:py-24"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_86%_10%,rgba(34,197,94,0.16),transparent_30%)]" />
      <LandingContainer className="relative grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">
            Nhận tư vấn triển khai
          </p>
          <h2 className="mt-4 text-3xl font-bold  sm:text-4xl lg:text-5xl">
            Cùng đội ngũ EraPOS thiết kế quy trình bán lẻ phù hợp với mô hình của bạn.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Không cần thay đổi toàn bộ cách vận hành ngay lập tức. Chúng tôi giúp bạn bắt đầu từ
            điểm đau lớn nhất, rồi mở rộng khi dữ liệu và đội ngũ đã sẵn sàng.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { icon: CalendarCheck2, label: 'Lịch demo nhanh' },
              { icon: Headphones, label: 'Hỗ trợ tiếng Việt' },
              { icon: ShieldCheck, label: 'Dữ liệu tập trung' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/8 p-4">
                <item.icon className="h-5 w-5 text-cyan-200" />
                <p className="mt-3 text-sm font-semibold">{item.label}</p>
              </div>
            ))}
          </div>

          <ul className="mt-8 space-y-3">
            {benefits.map((line) => (
              <li key={line} className="flex gap-3 text-slate-200">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white p-5 text-slate-950 shadow-2xl shadow-black/20 sm:p-7">
          <div className="mb-6">
            <h3 className="text-2xl font-bold">Đăng ký nhận tư vấn</h3>
            <p className="mt-2 text-slate-600">
              Điền thông tin, đội ngũ EraPOS sẽ liên hệ để demo theo mô hình vận hành của bạn.
            </p>
          </div>

          <form className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="name" label="Họ và tên" autoComplete="name" />
              <Field id="phone" label="Số điện thoại" type="tel" autoComplete="tel" />
            </div>
            <Field id="email" label="Email" type="email" autoComplete="email" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="business" label="Tên cửa hàng / doanh nghiệp" />
              <Field id="branches" label="Số chi nhánh hiện tại" />
            </div>
            <div>
              <label htmlFor="need" className="mb-2 block text-sm font-semibold text-slate-700">
                Nhu cầu chính
              </label>
              <textarea
                id="need"
                name="need"
                rows={4}
                placeholder="Ví dụ: cần quản lý kho nhiều chi nhánh, báo cáo doanh thu, tích hợp hóa đơn..."
                className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              className="mt-2 rounded-full bg-pos-blue-500 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-500/20 transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
            >
              Gửi yêu cầu tư vấn
            </button>
          </form>
        </div>
      </LandingContainer>
    </section>
  );
}

function Field({
  id,
  label,
  type = 'text',
  autoComplete,
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={label}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}
