"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import { LandingContainer } from './LandingSection';

const trustItems = ['Bán hàng tại quầy', 'Quản lý đa chi nhánh', 'Báo cáo thời gian thực'];

const slides = [
  {
    id: 0,
    badge: 'Nền tảng quản lý bán lẻ',
    title: 'Bán hàng tại quầy siêu tốc, thanh toán đa phương thức',
    desc: 'NexPOS tối ưu hóa quy trình thanh toán chỉ trong 3 giây. Hỗ trợ quét mã vạch chuyên nghiệp, in hóa đơn tự động và đồng bộ doanh thu tức thì.',
    image: '/phan-mem-quan-ly-ban-hang.png',
  },
  {
    id: 1,
    badge: 'Quản lý kho chuyên nghiệp',
    title: 'Kiểm kho chính xác, tự động cảnh báo tồn thấp',
    desc: 'Quản lý xuất nhập kho, chuyển kho nội bộ và theo dõi tồn kho theo thời gian thực giữa các chi nhánh. Không bao giờ lo đứt gãy nguồn hàng.',
    image: '/phan-mem-quan-ly-kho-chuyen-nghiep.png',
  },
  {
    id: 2,
    badge: 'Quản lý nhân sự',
    title: 'Phân quyền chi tiết, kiểm soát ca bán chặt chẽ',
    desc: 'Quản lý hiệu suất và ca làm việc của thu ngân, tự động đối soát doanh thu cuối ca, hạn chế thất thoát và phân quyền truy cập thông tin chi tiết.',
    image: '/phan-mem-quan-ly-nhan-vien.png',
  },
  {
    id: 3,
    badge: 'Chăm sóc khách hàng đa kênh',
    title: 'Thấu hiểu khách hàng, thúc đẩy doanh số quay lại',
    desc: 'Lưu lịch sử mua hàng, tích điểm thành viên tự động và cá nhân hóa chương trình khuyến mãi. Giữ chân khách hàng trung thành hiệu quả.',
    image: '/phan-mem-quan-ly-cham-soc-khach-hang-da-kenh.png',
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
    }
  }, []);

  const startAutoplay = useCallback(() => {
    stopAutoplay();
    autoplayRef.current = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
  }, [stopAutoplay]);

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [startAutoplay, stopAutoplay]);

  const prevSlide = () => {
    stopAutoplay();
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    startAutoplay();
  };

  const nextSlide = () => {
    stopAutoplay();
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    startAutoplay();
  };

  return (
    <section
      id="home"
      className="relative isolate overflow-hidden bg-[#f7fbff] pb-16 pt-16 sm:pb-24 sm:pt-24 lg:pb-28 lg:pt-32"
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
    >
      <div className="absolute inset-x-0 top-0 -z-10 h-full bg-[radial-gradient(circle_at_20%_10%,rgba(14,165,233,0.20),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(34,197,94,0.14),transparent_30%),linear-gradient(180deg,#eff7ff_0%,#ffffff_78%)]" />
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-linear-to-r from-transparent via-blue-300 to-transparent" />

      <LandingContainer className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(560px,1.05fr)]">
        <div className="flex flex-col min-w-0">
          {/* Slider Content Wrapper */}
          <div className="relative min-h-[280px] sm:min-h-[300px] lg:min-h-[320px]">
            {slides.map((slide, index) => {
              const isActive = index === current;
              return (
                <div
                  key={slide.id}
                  className={`transition-all duration-700 ease-in-out ${
                    isActive
                      ? 'opacity-100 scale-100 relative z-10'
                      : 'opacity-0 scale-[0.98] absolute inset-0 pointer-events-none z-0'
                  }`}
                >
                  <div
                    className={`inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-2 text-sm font-semibold text-pos-blue-500 shadow-sm transition-all duration-500 ease-out ${
                      isActive ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
                    }`}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    {slide.badge}
                  </div>

                  <h1
                    className={`mt-6 text-4xl font-bold leading-tight text-slate-950 sm:text-5xl lg:text-6xl lg:leading-[1.15] transition-all duration-700 ease-out delay-100 ${
                      isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                  >
                    {slide.title}
                  </h1>

                  <p
                    className={`mt-6 max-w-2xl text-lg leading-8 text-slate-600 transition-all duration-700 ease-out delay-200 ${
                      isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                  >
                    {slide.desc}
                  </p>
                </div>
              );
            })}
          </div>

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

          {/* Custom Slider Indicator */}
          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={prevSlide}
              className="text-slate-400 hover:text-slate-800 transition-colors focus:outline-none"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6 stroke-[1.5]" />
            </button>

            <div className="relative h-0.5 w-24 bg-slate-300/60 rounded-full overflow-hidden">
              <div
                className="absolute top-0 h-full bg-pos-blue-500 transition-all duration-500 ease-in-out rounded-full"
                style={{
                  width: `${100 / slides.length}%`,
                  left: `${(current * 100) / slides.length}%`,
                }}
              />
            </div>

            <button
              onClick={nextSlide}
              className="text-slate-400 hover:text-slate-800 transition-colors focus:outline-none"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6 stroke-[1.5]" />
            </button>
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

        {/* Right side - slide images */}
        <div className="relative mx-auto w-full max-w-210.5 aspect-16/10">
          {slides.map((slide, index) => (
            <Image
              key={slide.id}
              src={slide.image}
              alt={slide.title}
              fill
              priority={index === 0}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className={`absolute inset-0 w-full h-full object-contain transition-all duration-1000 ease-in-out ${
                index === current
                  ? 'opacity-100 scale-100 rotate-0 z-10'
                  : 'opacity-0 scale-95 -rotate-1 pointer-events-none z-0'
              }`}
            />
          ))}
        </div>
      </LandingContainer>
    </section>
  );
}
