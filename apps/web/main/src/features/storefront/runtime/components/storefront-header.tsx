"use client";

/* eslint-disable @next/next/no-img-element */
import { Menu, ShoppingBag } from "lucide-react";
import type { StorefrontStore, StorefrontTheme } from "../types";

interface StorefrontHeaderProps {
  store: StorefrontStore;
  theme: StorefrontTheme;
  cartCount: number;
  onOpenMenu: () => void;
  onOpenCart: () => void;
  onScrollToProducts: () => void;
}

export function StorefrontHeader({
  store,
  theme,
  cartCount,
  onOpenMenu,
  onOpenCart,
  onScrollToProducts,
}: StorefrontHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:h-[72px] lg:px-6">
        <button
          onClick={onOpenMenu}
          aria-label="Mở menu"
          className="mr-2 grid size-10 place-items-center lg:hidden"
        >
          <Menu className="size-5" />
        </button>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex min-w-0 items-center gap-3"
        >
          <img
            src={theme.logo}
            alt={`Logo ${store.name}`}
            className="size-9 shrink-0 object-contain"
            style={{ borderRadius: theme.radius }}
          />
          <span
            className="truncate text-lg font-bold"
            style={{ fontFamily: theme.headingFont }}
          >
            {store.name}
          </span>
        </button>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-black/60 lg:flex">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="transition hover:text-[var(--sf-primary)]"
          >
            Trang chủ
          </button>
          <button
            onClick={onScrollToProducts}
            className="transition hover:text-[var(--sf-primary)]"
          >
            Sản phẩm
          </button>
          {store.phone_number && (
            <a
              href={`tel:${store.phone_number}`}
              className="transition hover:text-[var(--sf-primary)]"
            >
              Liên hệ
            </a>
          )}
        </nav>
        <button
          onClick={onOpenCart}
          aria-label={`Mở giỏ hàng, ${cartCount} sản phẩm`}
          className="relative grid size-11 shrink-0 place-items-center border border-black/12 bg-white transition hover:border-[var(--sf-primary)]"
          style={{ borderRadius: theme.radius }}
        >
          <ShoppingBag className="size-5" />
          {cartCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-[var(--sf-primary)] text-[10px] font-bold text-white">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
