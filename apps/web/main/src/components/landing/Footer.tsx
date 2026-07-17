import Link from "next/link";

import Logo from "../common/Logo";
import { LandingContainer } from "./LandingSection";

const columns = [
  {
    title: "Sản phẩm",
    links: [
      { label: "Bán hàng tại quầy", href: "#features" },
      { label: "Quản lý kho", href: "#features" },
      { label: "Báo cáo chuỗi", href: "#operations" },
      { label: "AI assistant", href: "#solutions" },
    ],
  },
  {
    title: "Mô hình",
    links: [
      { label: "Cửa hàng nhỏ", href: "#operations" },
      { label: "Chuỗi bán lẻ", href: "#operations" },
      { label: "Siêu thị mini", href: "#features" },
      { label: "Shop thời trang", href: "#features" },
    ],
  },
  {
    title: "Hỗ trợ",
    links: [
      { label: "Bảng giá", href: "#pricing" },
      { label: "Câu hỏi thường gặp", href: "#support" },
      { label: "Nhận tư vấn", href: "#contact" },
      { label: "Đăng nhập", href: "/auth/login" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <LandingContainer className="py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Logo isTextWhite />
            <p className="mt-5 max-w-md leading-7 text-slate-400">
              EraPOS giúp cửa hàng nhỏ và chuỗi bán lẻ quản lý bán hàng, kho, khách hàng, hóa đơn và dữ liệu vận hành trong một nền tảng thống nhất.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/auth/register"
                className="rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-100"
              >
                Dùng thử
              </Link>
              <Link
                href="#contact"
                className="rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Nhận tư vấn
              </Link>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <h4 className="font-bold text-white">{column.title}</h4>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-400 transition hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </LandingContainer>

      <div className="border-t border-white/10">
        <LandingContainer className="flex flex-col gap-3 py-5 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} EraPOS. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="#" className="hover:text-white">
              Điều khoản
            </Link>
            <Link href="#" className="hover:text-white">
              Bảo mật
            </Link>
          </div>
        </LandingContainer>
      </div>
    </footer>
  );
}
