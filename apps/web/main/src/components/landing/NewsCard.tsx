import { ArrowUpRight, CalendarDays, FileText } from "lucide-react";

const posts = [
  {
    href: "#",
    date: "15 Tháng 8, 2025",
    category: "Quản lý kho",
    title: "Cách giảm thất thoát kho khi cửa hàng bắt đầu mở thêm chi nhánh",
    excerpt:
      "Các nguyên tắc kiểm kho, chuyển kho và cảnh báo tồn thấp giúp đội vận hành kiểm soát hàng hóa tốt hơn.",
  },
  {
    href: "#",
    date: "15 Tháng 8, 2025",
    category: "Bán hàng",
    title: "Thiết kế quy trình bán hàng tại quầy để thu ngân thao tác nhanh hơn",
    excerpt:
      "Từ quét mã, chọn khách hàng đến thanh toán và in hóa đơn, mỗi bước nhỏ đều ảnh hưởng tốc độ phục vụ.",
  },
  {
    href: "#",
    date: "14 Tháng 8, 2025",
    category: "Báo cáo",
    title: "Những chỉ số chủ cửa hàng nên xem mỗi sáng trước khi mở bán",
    excerpt:
      "Doanh thu, tồn kho, sản phẩm bán chạy và ca bán bất thường là các tín hiệu nên được xem thường xuyên.",
  },
];

export default function NewsCards() {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {posts.map((post) => (
        <a
          key={post.title}
          href={post.href}
          aria-label={post.title}
          className="group flex min-w-0 flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
        >
          <div className="mb-5 flex aspect-[16/9] items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#e0f2fe,#f0fdf4)] text-pos-blue-500">
            <FileText className="h-12 w-12" />
          </div>
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span className="rounded-full bg-blue-50 px-3 py-1 font-semibold text-pos-blue-500">
              {post.category}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              {post.date}
            </span>
          </div>
          <h3 className="text-xl font-bold leading-snug text-slate-950 transition group-hover:text-pos-blue-500">
            {post.title}
          </h3>
          <p className="mt-3 flex-1 leading-7 text-slate-600">{post.excerpt}</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-pos-blue-500">
            Đọc thêm
            <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </a>
      ))}
    </div>
  );
}
