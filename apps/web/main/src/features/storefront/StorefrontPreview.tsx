"use client";

/* eslint-disable @next/next/no-img-element */
import { Menu, Search, ShoppingCart, UserRound } from "lucide-react";
import type { CSSProperties } from "react";
import type { StorefrontConfig } from "./config";

interface StorefrontPreviewProps {
  config: StorefrontConfig;
  storeName: string;
  storeDescription?: string | null;
}

const PRODUCTS = [
  [
    "Sản phẩm tuyển chọn",
    "289.000đ",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80",
  ],
  [
    "Phiên bản mới",
    "459.000đ",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80",
  ],
  [
    "Lựa chọn bán chạy",
    "179.000đ",
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=80",
  ],
  [
    "Bộ sưu tập mùa mới",
    "329.000đ",
    "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500&auto=format&fit=crop&q=80",
  ],
] as const;

const FALLBACK_BANNER =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&auto=format&fit=crop&q=80";

export default function StorefrontPreview({
  config,
  storeName,
  storeDescription,
}: StorefrontPreviewProps) {
  const previewBanners = config.brand.banner_urls?.length
    ? config.brand.banner_urls
    : config.brand.banner_url
      ? [config.brand.banner_url]
      : [FALLBACK_BANNER];
  const banner = previewBanners[0];
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
  const ratioClass =
    config.catalog.image_ratio === "portrait"
      ? "aspect-[4/5]"
      : config.catalog.image_ratio === "landscape"
        ? "aspect-[4/3]"
        : "aspect-square";
  const style = {
    "--preview-primary": config.brand.primary_color,
    "--preview-accent": config.brand.accent_color,
    "--preview-bg": config.brand.background_color,
    "--preview-text": config.brand.text_color,
    "--preview-radius": radius,
    "--preview-heading": headingFont,
  } as CSSProperties;

  return (
    <div
      style={style}
      className="min-h-full overflow-hidden bg-[var(--preview-bg)] text-[var(--preview-text)]"
    >
      {config.announcement.enabled && (
        <div className="bg-[var(--preview-accent)] px-4 py-1.5 text-center text-[8px] font-bold text-white">
          {config.announcement.text}
        </div>
      )}
      <header className="flex h-14 items-center justify-between border-b border-black/10 px-5">
        <div className="flex items-center gap-2">
          {config.brand.logo_url && (
            <img
              src={config.brand.logo_url}
              alt=""
              className="max-h-7 max-w-20 object-contain"
            />
          )}
          <strong
            className="text-xs"
            style={{ fontFamily: "var(--preview-heading)" }}
          >
            {storeName || "Cửa hàng của bạn"}
          </strong>
        </div>
        <nav className="hidden gap-4 text-[8px] font-semibold text-black/55 sm:flex">
          <span>Trang chủ</span>
          <span>Sản phẩm</span>
          <span>Ưu đãi</span>
        </nav>
        <div className="flex gap-3">
          <UserRound className="size-3.5" />
          <ShoppingCart className="size-3.5" />
        </div>
      </header>
      <div className="flex h-10 items-center gap-3 bg-black/5 px-5 text-[8px] text-black/55">
        {config.home.show_categories && (
          <>
            <Menu className="size-3" />
            <b>Danh mục</b>
          </>
        )}
        {config.catalog.show_search && (
          <div
            className="mx-auto flex h-6 w-1/2 items-center gap-2 bg-white px-2"
            style={{ borderRadius: "var(--preview-radius)" }}
          >
            <Search className="size-3" /> Tìm sản phẩm
          </div>
        )}
      </div>

      {config.home.show_hero_slider && (
        <section className="relative flex min-h-60 items-center overflow-hidden px-6 py-8">
          <img
            src={banner}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/75 to-transparent" />
          <div className="relative max-w-[55%]">
            <p className="text-[7px] uppercase tracking-[0.18em] text-black/50">
              Bộ sưu tập mới
            </p>
            <h1
              className="mt-2 text-2xl font-bold leading-none tracking-[-0.04em]"
              style={{ fontFamily: "var(--preview-heading)" }}
            >
              {config.home.hero_title}
            </h1>
            <p className="mt-2 line-clamp-2 text-[8px] leading-4 text-black/55">
              {config.home.hero_subtitle || storeDescription}
            </p>
            <button
              className="mt-3 bg-[var(--preview-primary)] px-4 py-2 text-[8px] font-bold text-white"
              style={{ borderRadius: "var(--preview-radius)" }}
            >
              {config.home.hero_cta_label}
            </button>
          </div>
          {previewBanners.length > 1 && (
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
              {previewBanners.map((_, index) => (
                <span
                  key={index}
                  className={`h-1 ${index === 0 ? "w-6 bg-[var(--preview-primary)]" : "w-3 bg-white/60"}`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      <section className="grid grid-cols-3 border-b border-black/10 px-5 py-3 text-center text-[7px] text-black/50">
        <span>2 năm bảo hành</span>
        <span>Giao hàng nhanh</span>
        <span>Đổi trả 30 ngày</span>
      </section>

      {config.home.show_featured_products && (
        <section className="px-5 py-7">
          <h2
            className="mb-4 text-lg font-bold tracking-[-0.04em]"
            style={{ fontFamily: "var(--preview-heading)" }}
          >
            {config.home.featured_heading}
          </h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {PRODUCTS.map(([name, price, image]) => (
              <article
                key={name}
                className="border border-black/10 bg-white p-2"
                style={{ borderRadius: "var(--preview-radius)" }}
              >
                <div
                  className={`relative ${ratioClass} overflow-hidden bg-[#f3f3f3]`}
                >
                  <img src={image} alt="" className="size-full object-cover" />
                  <span className="absolute left-2 top-2 bg-[var(--preview-primary)] px-2 py-1 text-[6px] font-bold text-white">
                    MỚI
                  </span>
                </div>
                <div className="mt-2 flex justify-between gap-2 text-[8px]">
                  <b
                    className="truncate"
                    style={{ fontFamily: "var(--preview-heading)" }}
                  >
                    {name}
                  </b>
                  <span className="shrink-0 text-[var(--preview-primary)]">
                    {price}
                  </span>
                </div>
                {config.catalog.show_product_description && (
                  <p className="mt-1 text-[7px] text-black/40">
                    Sản phẩm chọn lọc
                  </p>
                )}
                {config.catalog.quick_add && (
                  <span className="mt-2 block text-right text-[6px] font-bold text-[var(--preview-primary)]">
                    + Thêm nhanh
                  </span>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      <footer className="border-t border-black/10 bg-white text-[7px] text-black/50">
        {config.footer.show_newsletter && (
          <div className="flex items-center gap-3 border-b border-black/10 px-5 py-3">
            <b className="text-black">{config.footer.newsletter_title}</b>
            <div className="h-6 flex-1 border border-black/10 px-2 leading-6 text-black/35">
              {config.footer.newsletter_placeholder}
            </div>
            <span className="bg-[var(--preview-primary)] px-3 py-2 font-bold text-white">
              {config.footer.newsletter_button_label}
            </span>
          </div>
        )}
        <div className="grid grid-cols-4 gap-4 px-5 py-6">
          <div>
            <b className="text-black">
              {config.footer.company_title || storeName}
            </b>
            <p className="mt-2 line-clamp-4 leading-3">
              {storeDescription || "Thông tin cửa hàng và địa chỉ liên hệ."}
            </p>
          </div>
          {[
            [config.footer.about_title, config.footer.about_links],
            [config.footer.support_title, config.footer.support_links],
            [config.footer.policy_title, config.footer.policy_links],
          ].map(([title, links]) => (
            <div key={title}>
              <b className="text-black">{title}</b>
              <p className="mt-2 line-clamp-4 leading-3">
                {links
                  .split("\n")
                  .filter(Boolean)
                  .map((line) => `• ${line.split("|")[0]}`)
                  .join("\n")}
              </p>
            </div>
          ))}
        </div>
        <div className="border-t border-black/10 bg-black/[0.03] px-5 py-3 text-center">
          {config.footer.copyright_text ||
            `Copyright © ${new Date().getFullYear()} ${storeName}.`}
          {config.footer.show_powered_by && " Powered by NexPOS"}
        </div>
      </footer>
    </div>
  );
}
