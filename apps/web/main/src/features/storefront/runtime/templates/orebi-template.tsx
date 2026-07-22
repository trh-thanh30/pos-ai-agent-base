"use client";

/* eslint-disable @next/next/no-img-element */
import { BadgeCheck, RefreshCw, Truck } from "lucide-react";
import type { StorefrontTemplateProps } from "../types";
import { HeroImageSlider } from "../components/hero-image-slider";
import {
  ProductCarousel,
  ProductCarouselItem,
} from "../components/product-carousel";
import { OrebiProductCard } from "../components/product-cards";
import { FALLBACK_PRODUCT_IMAGE } from "../utils";

interface OrebiTemplateProps extends StorefrontTemplateProps {
  onOpenAllProducts: () => void;
}

function SectionHeading({ children }: { children: string }) {
  return (
    <h2
      className="mb-8 text-2xl font-bold tracking-[-0.03em] text-[var(--sf-text)] sm:text-3xl lg:text-[39px]"
      style={{ fontFamily: "var(--sf-heading)" }}
    >
      {children}
    </h2>
  );
}

export function OrebiTemplate({
  config,
  store,
  products,
  theme,
  onAddProduct,
  onSelectProduct,
  onScrollToProducts,
  onOpenAllProducts,
}: OrebiTemplateProps) {
  const newArrivals = products.slice(0, 10);
  const bestSellers = products.length > 4 ? products.slice(4, 14) : products;
  const specialOffers = products.length > 8 ? products.slice(8, 18) : products;
  const spotlight = products[0];
  const heroImages = Array.from(
    new Set(
      config.brand.banner_urls?.length
        ? config.brand.banner_urls
        : [theme.banner],
    ),
  );

  return (
    <main className="bg-[var(--sf-bg)] text-[var(--sf-text)]">
      {config.home.show_hero_slider && (
        <HeroImageSlider
          images={heroImages}
          storeName={store.name}
          title={config.home.hero_title}
          subtitle={config.home.hero_subtitle}
          ctaLabel={config.home.hero_cta_label}
          onCta={
            config.home.show_featured_products
              ? onScrollToProducts
              : onOpenAllProducts
          }
        />
      )}

      <section className="border-b border-[#e9e9e9] bg-white">
        <div className="mx-auto grid max-w-[1440px] gap-4 px-5 py-6 text-xs text-[#6d6d6d] sm:grid-cols-3 sm:px-8 lg:px-12 lg:text-sm">
          <div className="flex items-center gap-4 sm:justify-start">
            <span className="text-2xl font-bold text-[var(--sf-primary)]">
              2
            </span>
            Hai năm bảo hành
          </div>
          <div className="flex items-center gap-4 sm:justify-center">
            <Truck className="size-5 text-[var(--sf-primary)]" />
            Miễn phí giao hàng theo điều kiện
          </div>
          <div className="flex items-center gap-4 sm:justify-end">
            <RefreshCw className="size-5 text-[var(--sf-primary)]" />
            Đổi trả trong 30 ngày
          </div>
        </div>
      </section>

      {config.home.show_featured_products && (
        <section
          id="products"
          className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24"
        >
          <SectionHeading>
            {config.home.featured_heading || "Hàng mới về"}
          </SectionHeading>
          <ProductCarousel
            label={config.home.featured_heading || "Hàng mới về"}
            headerAction={
              <button
                type="button"
                onClick={onOpenAllProducts}
                className="mr-2 hidden border-b border-[var(--sf-primary)] pb-1 text-xs font-bold text-[var(--sf-primary)] sm:block lg:text-sm"
              >
                Xem tất cả
              </button>
            }
          >
            {newArrivals.map((product) => (
              <ProductCarouselItem key={product.id}>
                <OrebiProductCard
                  product={product}
                  config={config}
                  onAdd={onAddProduct}
                  onSelectProduct={onSelectProduct}
                />
              </ProductCarouselItem>
            ))}
          </ProductCarousel>
        </section>
      )}

      {config.home.show_featured_products && spotlight && (
        <section className="mx-auto max-w-[1440px] px-5 pb-16 sm:px-8 lg:px-12 lg:pb-24">
          <div className="grid overflow-hidden bg-[#f3f3f3] lg:grid-cols-[1.1fr_0.9fr]">
            <div className="min-h-[360px] overflow-hidden lg:min-h-[520px]">
              <img
                src={spotlight.image_url || FALLBACK_PRODUCT_IMAGE}
                alt={spotlight.name}
                className="size-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-center px-7 py-12 sm:px-12 lg:px-16">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#767676] lg:text-sm">
                Sản phẩm của năm
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-[#262626] sm:text-5xl lg:text-6xl">
                {spotlight.name}
              </h2>
              <p className="mt-5 line-clamp-3 text-sm leading-7 text-[#6d6d6d] lg:text-base lg:leading-8">
                {spotlight.description ||
                  `Một lựa chọn nổi bật từ ${store.name}, được tuyển chọn cho chất lượng và trải nghiệm sử dụng lâu dài.`}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onSelectProduct?.(spotlight)}
                  className="bg-[var(--sf-primary)] px-8 py-4 text-sm font-bold text-white hover:brightness-110 lg:text-base"
                >
                  Xem sản phẩm
                </button>
                <button
                  type="button"
                  onClick={() => onAddProduct(spotlight)}
                  className="border border-[var(--sf-primary)] px-8 py-4 text-sm font-bold text-[var(--sf-primary)] hover:bg-[var(--sf-primary)] hover:text-white lg:text-base"
                >
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {config.home.show_featured_products && (
        <section className="mx-auto max-w-[1440px] px-5 pb-16 sm:px-8 lg:px-12 lg:pb-24">
          <SectionHeading>Sản phẩm bán chạy</SectionHeading>
          <ProductCarousel label="Sản phẩm bán chạy">
            {bestSellers.map((product) => (
              <ProductCarouselItem key={product.id}>
                <OrebiProductCard
                  product={product}
                  config={config}
                  badge="Bán chạy"
                  onAdd={onAddProduct}
                  onSelectProduct={onSelectProduct}
                />
              </ProductCarouselItem>
            ))}
          </ProductCarousel>
        </section>
      )}

      {config.home.show_featured_products && specialOffers.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">
          <div className="flex items-center gap-3">
            <BadgeCheck className="mb-8 size-6 text-[#262626]" />
            <SectionHeading>Ưu đãi đặc biệt</SectionHeading>
          </div>
          <ProductCarousel label="Ưu đãi đặc biệt">
            {specialOffers.map((product) => (
              <ProductCarouselItem key={product.id}>
                <OrebiProductCard
                  product={product}
                  config={config}
                  badge="Ưu đãi"
                  onAdd={onAddProduct}
                  onSelectProduct={onSelectProduct}
                />
              </ProductCarouselItem>
            ))}
          </ProductCarousel>
        </section>
      )}
    </main>
  );
}
