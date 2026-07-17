"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import {
  type MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Logo from "../common/Logo";
import { LandingContainer } from "./LandingSection";

const pagesItems = [
  { title: "Giới thiệu", href: "#home" },
  { title: "Tính năng", href: "#features" },
  { title: "Vận hành", href: "#operations" },
  { title: "Giải pháp", href: "#solutions" },
  { title: "Bảng giá", href: "#pricing" },
  { title: "Liên hệ", href: "#contact" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("#home");
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const scrollLockRef = useRef<string | null>(null);
  const scrollLockTimeoutRef = useRef<number | null>(null);
  const [indicator, setIndicator] = useState({
    left: 0,
    width: 0,
    ready: false,
  });

  const updateIndicator = useCallback((hash: string) => {
    const nav = navRef.current;
    const activeLink = linkRefs.current[hash];

    if (!nav || !activeLink) {
      return;
    }

    const navRect = nav.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();

    setIndicator({
      left: linkRect.left - navRect.left,
      width: linkRect.width,
      ready: true,
    });
  }, []);

  useEffect(() => {
    let frameId = 0;
    const sectionIds = pagesItems.map((item) => item.href.slice(1));

    const updateActiveSection = () => {
      setIsScrolled(window.scrollY > 8);

      if (scrollLockRef.current) {
        const lockedTarget = document.getElementById(
          scrollLockRef.current.slice(1)
        );

        if (lockedTarget) {
          const targetDistance = Math.abs(
            lockedTarget.getBoundingClientRect().top - 88
          );

          if (targetDistance > 14) {
            return;
          }
        }

        scrollLockRef.current = null;
      }

      const headerOffset = 88;
      const readingLine =
        headerOffset + (window.innerHeight - headerOffset) * 0.38;
      const sections = sectionIds
        .map((id) => document.getElementById(id))
        .filter((section): section is HTMLElement => Boolean(section));

      const currentSection = sections.find((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= readingLine && rect.bottom >= readingLine;
      });

      const sectionToActivate =
        currentSection ??
        sections
          .map((section) => ({
            section,
            distance: Math.abs(
              section.getBoundingClientRect().top - headerOffset
            ),
          }))
          .sort((a, b) => a.distance - b.distance)[0]?.section;

      if (!sectionToActivate) {
        return;
      }

      const nextHash = `#${sectionToActivate.id}`;
      setActiveHash((current) => (current === nextHash ? current : nextHash));
    };

    const queueUpdate = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateActiveSection);
    };

    const syncFromHash = () => {
      setActiveHash(window.location.hash || "#home");
      queueUpdate();
    };

    queueUpdate();
    window.addEventListener("hashchange", syncFromHash);
    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate);

    return () => {
      window.cancelAnimationFrame(frameId);
      if (scrollLockTimeoutRef.current) {
        window.clearTimeout(scrollLockTimeoutRef.current);
      }
      window.removeEventListener("hashchange", syncFromHash);
      window.removeEventListener("scroll", queueUpdate);
      window.removeEventListener("resize", queueUpdate);
    };
  }, []);

  useEffect(() => {
    updateIndicator(activeHash);
  }, [activeHash, updateIndicator]);

  useEffect(() => {
    const handleResize = () => updateIndicator(activeHash);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [activeHash, updateIndicator]);

  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    const target = document.getElementById(href.slice(1));

    if (!target) {
      return;
    }

    event.preventDefault();
    setIsOpen(false);
    scrollLockRef.current = href;
    setActiveHash(href);

    const headerOffset = 88;
    const targetTop =
      target.getBoundingClientRect().top + window.scrollY - headerOffset;

    window.history.pushState(null, "", href);
    if (scrollLockTimeoutRef.current) {
      window.clearTimeout(scrollLockTimeoutRef.current);
    }
    scrollLockTimeoutRef.current = window.setTimeout(() => {
      scrollLockRef.current = null;
    }, 900);
    window.scrollTo({
      top: Math.max(targetTop, 0),
      behavior: "smooth",
    });
  };

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "border-b border-slate-200/80 bg-white/92 shadow-sm backdrop-blur-xl"
          : "bg-white/82 backdrop-blur-xl"
      }`}
    >
      <LandingContainer className="flex items-center justify-between gap-4 py-3">
        <div className="flex min-w-0 shrink-0 items-center lg:w-[190px] xl:w-[240px]">
          <Logo />
        </div>

        <div className="hidden min-w-0 flex-1 justify-center lg:flex">
          <nav
            ref={navRef}
            className="relative flex min-w-0 items-center gap-1 rounded-full p-0 text-base font-semibold text-slate-600 xl:gap-3"
          >
            <span
              className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-pos-blue-500 transition-[transform,width,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
              style={{
                width: indicator.width,
                transform: `translate3d(${indicator.left}px, 0, 0)`,
                opacity: indicator.ready ? 1 : 0,
              }}
              aria-hidden="true"
            />
            {pagesItems.map((item) => (
              <a
                key={item.title}
                ref={(node) => {
                  linkRefs.current[item.href] = node;
                }}
                href={item.href}
                onClick={(event) => handleNavClick(event, item.href)}
                className={`relative z-10 whitespace-nowrap rounded-full px-3 py-2.5 transition-colors duration-300 xl:px-5 ${
                  activeHash === item.href
                    ? "text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                {item.title}
              </a>
            ))}
          </nav>
        </div>

        <div className="hidden shrink-0 items-center justify-end gap-2 lg:flex lg:w-[190px] xl:w-[240px] xl:gap-3">
          <Link
            href="/auth/login"
            className="rounded-full px-3 py-2 text-base font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 xl:px-4"
          >
            Đăng nhập
          </Link>
          <Link
            href="/auth/register"
            className="rounded-full bg-pos-blue-500 px-4 py-2.5 text-base font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-blue-700 xl:px-5"
          >
            Dùng thử
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 lg:hidden"
          aria-label={isOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </LandingContainer>

      <div
        className={`fixed inset-0 top-[68px] z-40 bg-slate-950/35 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`fixed right-0 top-[68px] z-50 h-[calc(100dvh-68px)] w-[min(88vw,390px)] border-l border-slate-200 bg-white shadow-2xl shadow-slate-950/20 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex h-full flex-col px-5 py-5">
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <p className="text-sm font-bold text-slate-950">Menu</p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Điều hướng landing page
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
              aria-label="Đóng menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-2 text-base font-semibold">
            {pagesItems.map((item) => (
              <a
                key={item.title}
                href={item.href}
                onClick={(event) => handleNavClick(event, item.href)}
                className={`rounded-2xl px-4 py-3.5 transition-all duration-300 ${
                  activeHash === item.href
                    ? "translate-x-1 bg-blue-50 text-pos-blue-500"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {item.title}
              </a>
            ))}
          </nav>

          <div className="mt-auto grid gap-3 border-t border-slate-100 pt-5">
            <Link
              href="/auth/login"
              onClick={() => setIsOpen(false)}
              className="rounded-full border border-slate-200 px-4 py-3 text-center text-base font-semibold text-slate-700"
            >
              Đăng nhập
            </Link>
            <Link
              href="/auth/register"
              onClick={() => setIsOpen(false)}
              className="rounded-full bg-pos-blue-500 px-4 py-3 text-center text-base font-semibold text-white shadow-lg shadow-blue-500/20"
            >
              Dùng thử
            </Link>
          </div>
        </div>
      </aside>
    </header>
  );
}
