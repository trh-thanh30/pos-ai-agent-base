"use client";

/* eslint-disable @next/next/no-img-element */
import {
  Menu,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import React from "react";
import { StorefrontConfig } from "./config";

interface StorefrontPreviewProps {
  config: StorefrontConfig;
  storeName: string;
  storeDescription?: string | null;
}

const SAMPLE_PRODUCTS = [
  {
    name: "Sản phẩm tuyển chọn",
    price: "289.000đ",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80",
  },
  {
    name: "Phiên bản mới",
    price: "459.000đ",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80",
  },
  {
    name: "Lựa chọn bán chạy",
    price: "179.000đ",
    image:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=80",
  },
  {
    name: "Bộ sưu tập mùa mới",
    price: "329.000đ",
    image:
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500&auto=format&fit=crop&q=80",
  },
];

const FALLBACK_BANNER =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&auto=format&fit=crop&q=80";

export default function StorefrontPreview({
  config,
  storeName,
  storeDescription,
}: StorefrontPreviewProps) {
  const radius =
    config.brand.radius === "sharp"
      ? "0px"
      : config.brand.radius === "rounded"
        ? "16px"
        : "7px";
  const headingFont =
    config.brand.font_pair === "editorial"
      ? '"Palatino Linotype", "Book Antiqua", Palatino, serif'
      : config.brand.font_pair === "friendly"
        ? '"Trebuchet MS", "Avenir Next", sans-serif'
        : '"Avenir Next", "Gill Sans", sans-serif';
  const style = {
    "--preview-primary": config.brand.primary_color,
    "--preview-accent": config.brand.accent_color,
    "--preview-bg": config.brand.background_color,
    "--preview-text": config.brand.text_color,
    "--preview-radius": radius,
    "--preview-heading": headingFont,
  } as React.CSSProperties;

  return (
    <div
      style={style}
      className="min-h-full overflow-hidden bg-[var(--preview-bg)] text-[var(--preview-text)]"
    >
      {config.announcement.enabled && (
        <div className="bg-[var(--preview-accent)] px-4 py-2 text-center text-[10px] font-bold text-white">
          {config.announcement.text}
        </div>
      )}
      <header className="flex h-14 items-center justify-between border-b border-black/10 bg-white px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          {config.brand.logo_url ? (
            <img
              src={config.brand.logo_url}
              alt=""
              className="size-8 object-contain"
              style={{ borderRadius: radius }}
            />
          ) : (
            <div
              className="grid size-8 place-items-center bg-[var(--preview-primary)] text-xs font-bold text-white"
              style={{ borderRadius: radius }}
            >
              {storeName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <span
            className="truncate text-sm font-bold"
            style={{ fontFamily: headingFont }}
          >
            {storeName || "Cửa hàng của bạn"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Search className="size-4 text-black/45" />
          <ShoppingBag className="ml-2 size-4" />
          <Menu className="ml-2 size-4 lg:hidden" />
        </div>
      </header>

      {config.template_id === "editorial" ? (
        <EditorialPreview
          config={config}
          banner={config.brand.banner_url || FALLBACK_BANNER}
        />
      ) : config.template_id === "specialist" ? (
        <SpecialistPreview config={config} />
      ) : (
        <MarketPreview config={config} storeDescription={storeDescription} />
      )}

      <footer className="mt-8 border-t border-black/10 bg-white px-5 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold">{storeName}</p>
            <p className="mt-1 text-[9px] text-black/45">
              {config.footer.policy_text}
            </p>
          </div>
          {config.footer.show_powered_by && (
            <span className="text-[9px] font-semibold text-[var(--preview-primary)]">
              Powered by NexPOS
            </span>
          )}
        </div>
      </footer>
    </div>
  );
}

function MarketPreview({
  config,
  storeDescription,
}: {
  config: StorefrontConfig;
  storeDescription?: string | null;
}) {
  return (
    <>
      <section className="bg-[var(--preview-primary)] px-5 py-7 text-white">
        <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-white/65">
          Chọn nhanh, nhận hàng tiện
        </p>
        <h1
          className="mt-1.5 max-w-sm text-2xl font-bold leading-tight"
          style={{ fontFamily: "var(--preview-heading)" }}
        >
          {config.home.hero_title}
        </h1>
        <p className="mt-2 line-clamp-2 max-w-md text-[10px] leading-4 text-white/70">
          {config.home.hero_subtitle || storeDescription}
        </p>
        {config.catalog.show_search && (
          <div
            className="mt-4 flex h-9 items-center gap-2 bg-white px-3 text-[10px] text-black/40"
            style={{ borderRadius: "var(--preview-radius)" }}
          >
            <Search className="size-3.5" /> Bạn đang cần tìm gì?
          </div>
        )}
      </section>
      <ProductArea config={config} columns="grid-cols-2 lg:grid-cols-4" dense />
    </>
  );
}

function EditorialPreview({
  config,
  banner,
}: {
  config: StorefrontConfig;
  banner: string;
}) {
  return (
    <>
      {config.home.show_hero && (
        <section className="relative flex min-h-64 items-end overflow-hidden bg-neutral-900 px-6 py-7 text-white">
          <img
            src={banner}
            alt=""
            className="absolute inset-0 size-full object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-black/35" />
          <div className="relative max-w-sm">
            <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/65">
              New collection
            </p>
            <h1
              className="mt-2 text-3xl leading-none"
              style={{ fontFamily: "var(--preview-heading)" }}
            >
              {config.home.hero_title}
            </h1>
            <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-white/70">
              {config.home.hero_subtitle}
            </p>
            <button className="mt-4 bg-white px-4 py-2 text-[9px] font-bold text-neutral-950">
              {config.home.hero_cta_label}
            </button>
          </div>
        </section>
      )}
      <ProductArea config={config} columns="grid-cols-2 lg:grid-cols-3" />
    </>
  );
}

function SpecialistPreview({ config }: { config: StorefrontConfig }) {
  return (
    <>
      <section className="grid gap-5 bg-white px-5 py-7 lg:grid-cols-[1fr_180px] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[var(--preview-primary)]/8 px-2 py-1 text-[8px] font-bold text-[var(--preview-primary)]">
            <ShieldCheck className="size-3" /> Thông tin minh bạch
          </div>
          <h1
            className="mt-2 max-w-md text-2xl font-bold leading-tight"
            style={{ fontFamily: "var(--preview-heading)" }}
          >
            {config.home.hero_title}
          </h1>
          <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-black/50">
            {config.home.hero_subtitle}
          </p>
        </div>
        <div className="grid grid-cols-2 border border-black/10 bg-[var(--preview-bg)]">
          {[ShieldCheck, PackageCheck, Search, ShoppingBag].map(
            (Icon, index) => (
              <div
                key={index}
                className="grid aspect-square place-items-center border-b border-r border-black/10"
              >
                <Icon className="size-4 text-[var(--preview-primary)]" />
              </div>
            ),
          )}
        </div>
      </section>
      <ProductArea
        config={config}
        columns="grid-cols-2 lg:grid-cols-3"
        specialist
      />
    </>
  );
}

function ProductArea({
  config,
  columns,
  dense = false,
  specialist = false,
}: {
  config: StorefrontConfig;
  columns: string;
  dense?: boolean;
  specialist?: boolean;
}) {
  const ratioClass =
    config.catalog.image_ratio === "portrait"
      ? "aspect-[4/5]"
      : config.catalog.image_ratio === "landscape"
        ? "aspect-[4/3]"
        : "aspect-square";
  return (
    <section className="px-5 py-7">
      <div className="flex items-end justify-between border-b border-black/10 pb-3">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-[var(--preview-primary)]">
            Khám phá
          </p>
          <h2
            className="mt-1 text-lg font-bold"
            style={{ fontFamily: "var(--preview-heading)" }}
          >
            {config.home.featured_heading}
          </h2>
        </div>
        <span className="text-[9px] text-black/40">24 sản phẩm</span>
      </div>
      {config.catalog.show_category_filter && (
        <div className="my-3 flex gap-1.5 overflow-hidden">
          {["Tất cả", "Bán chạy", "Mới về"].map((label, index) => (
            <span
              key={label}
              className={`shrink-0 border px-2.5 py-1 text-[8px] font-bold ${
                index === 0
                  ? "border-[var(--preview-primary)] bg-[var(--preview-primary)] text-white"
                  : "border-black/10 bg-white text-black/45"
              }`}
              style={{ borderRadius: "var(--preview-radius)" }}
            >
              {label}
            </span>
          ))}
        </div>
      )}
      <div className={`grid gap-3 ${columns}`}>
        {SAMPLE_PRODUCTS.map((product) => (
          <article
            key={product.name}
            className={
              specialist || dense
                ? "overflow-hidden border border-black/10 bg-white"
                : "overflow-hidden bg-transparent"
            }
            style={{ borderRadius: "var(--preview-radius)" }}
          >
            <div className={`${ratioClass} overflow-hidden bg-black/5`}>
              <img
                src={product.image}
                alt=""
                className="size-full object-cover"
              />
            </div>
            <div className={specialist || dense ? "p-2.5" : "pt-2.5"}>
              {specialist && (
                <span className="text-[7px] font-bold uppercase text-[var(--preview-primary)]">
                  Còn hàng
                </span>
              )}
              <p className="mt-0.5 truncate text-[10px] font-bold">
                {product.name}
              </p>
              {config.catalog.show_product_description && (
                <p className="mt-1 line-clamp-1 text-[8px] text-black/40">
                  Mô tả ngắn giúp khách hiểu sản phẩm.
                </p>
              )}
              <div className="mt-2 flex items-center justify-between gap-1">
                <strong className="text-[10px] text-[var(--preview-primary)]">
                  {product.price}
                </strong>
                {config.catalog.quick_add && (
                  <span
                    className="grid size-6 place-items-center bg-[var(--preview-primary)] text-white"
                    style={{ borderRadius: "var(--preview-radius)" }}
                  >
                    <Plus className="size-3" />
                  </span>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
