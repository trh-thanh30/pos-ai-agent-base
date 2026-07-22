"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface HeroImageSliderProps {
  images: string[];
  storeName: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  onCta: () => void;
}

export function HeroImageSlider({
  images,
  storeName,
  title,
  subtitle,
  ctaLabel,
  onCta,
}: HeroImageSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const pointerStart = useRef<number | null>(null);
  const slides = images.filter(Boolean).slice(0, 5);

  useEffect(() => {
    setActiveIndex((current) =>
      Math.min(current, Math.max(0, slides.length - 1)),
    );
  }, [slides.length]);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  if (slides.length === 0) return null;

  const goTo = (index: number) => {
    setActiveIndex((index + slides.length) % slides.length);
  };

  return (
    <section
      className="group relative isolate min-h-[470px] overflow-hidden bg-black sm:min-h-[580px] lg:min-h-[680px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerDown={(event) => {
        pointerStart.current = event.clientX;
      }}
      onPointerUp={(event) => {
        if (pointerStart.current === null) return;
        const distance = event.clientX - pointerStart.current;
        if (Math.abs(distance) > 50)
          goTo(activeIndex + (distance < 0 ? 1 : -1));
        pointerStart.current = null;
      }}
      aria-roledescription="carousel"
      aria-label={`Ảnh hero của ${storeName}`}
    >
      {slides.map((image, index) => (
        <img
          key={`${image}-${index}`}
          src={image}
          alt={index === activeIndex ? `${title} - ảnh ${index + 1}` : ""}
          aria-hidden={index !== activeIndex}
          draggable={false}
          className={`absolute inset-0 size-full object-cover object-center transition duration-1000 ease-out ${
            index === activeIndex
              ? "scale-100 opacity-100"
              : "scale-[1.025] opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/10" />

      <div className="relative mx-auto flex min-h-[470px] max-w-[1440px] items-center px-5 sm:min-h-[580px] sm:px-8 lg:min-h-[680px] lg:px-12">
        <div className="max-w-2xl py-20 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
            {storeName} · Bộ sưu tập mới
          </p>
          <h1
            className="mt-5 text-4xl font-bold leading-[1.05] tracking-[-0.045em] sm:text-6xl lg:text-[72px]"
            style={{ fontFamily: "var(--sf-heading)" }}
          >
            {title}
          </h1>
          <p className="mt-6 max-w-lg text-sm leading-7 text-white/75 sm:text-base">
            {subtitle}
          </p>
          <button
            type="button"
            onClick={onCta}
            className="mt-9 min-w-40 bg-[var(--sf-primary)] px-8 py-4 text-sm font-bold text-white transition hover:brightness-110"
            style={{ borderRadius: "var(--sf-radius)" }}
          >
            {ctaLabel}
          </button>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Hiển thị ảnh hero ${index + 1}`}
                aria-current={index === activeIndex}
                className={`h-1.5 transition-all ${
                  index === activeIndex
                    ? "w-10 bg-[var(--sf-primary)]"
                    : "w-5 bg-white/50 hover:bg-white"
                }`}
              />
            ))}
          </div>
          <div className="absolute right-5 top-1/2 hidden -translate-y-1/2 gap-2 sm:flex lg:right-12">
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              aria-label="Ảnh hero trước"
              className="grid size-11 place-items-center border border-white/45 bg-black/20 text-white backdrop-blur-sm transition hover:border-[var(--sf-primary)] hover:bg-[var(--sf-primary)]"
            >
              <ArrowLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              aria-label="Ảnh hero tiếp theo"
              className="grid size-11 place-items-center border border-white/45 bg-black/20 text-white backdrop-blur-sm transition hover:border-[var(--sf-primary)] hover:bg-[var(--sf-primary)]"
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
        </>
      )}
    </section>
  );
}
