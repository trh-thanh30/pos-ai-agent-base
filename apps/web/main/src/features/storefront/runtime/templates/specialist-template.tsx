"use client";

import type { ReactNode } from "react";
import {
  ChevronRight,
  PackageCheck,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";
import type { StorefrontTemplateProps } from "../types";
import {
  CatalogEmptyState,
  CategoryControls,
  SearchControl,
} from "../components/catalog-controls";
import { SpecialistProductCard } from "../components/product-cards";

export function SpecialistTemplate({
  config,
  store,
  filteredProducts,
  categories,
  selectedCategory,
  searchTerm,
  theme,
  onCategoryChange,
  onSearchChange,
  onAddProduct,
}: StorefrontTemplateProps) {
  return (
    <>
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 lg:grid-cols-[1fr_0.8fr] lg:items-center lg:px-6 lg:py-14">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 border border-[var(--sf-primary)]/20 bg-[var(--sf-primary)]/5 px-3 py-1.5 text-xs font-bold text-[var(--sf-primary)]">
              <ShieldCheck className="size-4" />
              Tư vấn đúng sản phẩm, thông tin minh bạch
            </div>
            <h1
              className="max-w-3xl text-3xl font-bold leading-tight text-[var(--sf-text)] sm:text-5xl"
              style={{ fontFamily: theme.headingFont }}
            >
              {config.home.hero_title}
            </h1>
            <p className="mt-4 max-w-2xl leading-7 text-black/58">
              {config.home.hero_subtitle}
            </p>
            <div className="mt-7 max-w-xl">
              <SearchControl
                enabled={config.catalog.show_search}
                value={searchTerm}
                placeholder="Tìm tên, mã hoặc dòng sản phẩm"
                onChange={onSearchChange}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 border border-black/10 bg-[var(--sf-bg)]">
            {[
              [ShieldCheck, "Thông tin rõ", "Variant và tồn kho"],
              [Truck, "Giao nhận tiện", "Theo chính sách shop"],
              [PackageCheck, "Hàng chọn lọc", "Đang bán tại cửa hàng"],
              [Phone, "Hỗ trợ nhanh", store.phone_number || "Liên hệ cửa hàng"],
            ].map(([Icon, title, detail]) => {
              const FeatureIcon = Icon as typeof ShieldCheck;
              return (
                <div
                  key={String(title)}
                  className="border-b border-r border-black/10 p-5 last:border-b-0"
                >
                  <FeatureIcon className="mb-4 size-5 text-[var(--sf-primary)]" />
                  <p className="text-sm font-bold text-[var(--sf-text)]">
                    {String(title)}
                  </p>
                  <p className="mt-1 text-xs text-black/48">{String(detail)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <main
        id="products"
        className="mx-auto grid max-w-7xl gap-8 px-4 py-9 lg:grid-cols-[220px_1fr] lg:px-6"
      >
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <p className="border-b border-black/15 pb-3 text-xs font-bold uppercase tracking-[0.12em] text-black/45">
              Danh mục sản phẩm
            </p>
            <CategoryLink
              active={selectedCategory === "all"}
              onClick={() => onCategoryChange("all")}
            >
              Tất cả
            </CategoryLink>
            {categories.map((category) => (
              <CategoryLink
                key={category.id}
                active={selectedCategory === category.id}
                onClick={() => onCategoryChange(category.id)}
              >
                {category.name}
              </CategoryLink>
            ))}
          </div>
        </aside>
        <div>
          <div className="mb-6 flex items-end justify-between gap-4 border-b border-black/15 pb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--sf-primary)]">
                Catalog
              </p>
              <h2
                className="mt-1 text-2xl font-bold text-[var(--sf-text)]"
                style={{ fontFamily: theme.headingFont }}
              >
                {config.home.featured_heading}
              </h2>
            </div>
            <span className="text-sm text-black/45">
              {filteredProducts.length} sản phẩm
            </span>
          </div>
          <div className="mb-5 lg:hidden">
            <CategoryControls
              enabled={config.catalog.show_category_filter}
              categories={categories}
              selectedCategory={selectedCategory}
              compact
              onChange={onCategoryChange}
            />
          </div>
          {filteredProducts.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <SpecialistProductCard
                  key={product.id}
                  product={product}
                  config={config}
                  onAdd={onAddProduct}
                />
              ))}
            </div>
          ) : (
            <CatalogEmptyState />
          )}
        </div>
      </main>
    </>
  );
}

function CategoryLink({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between border-b border-black/8 py-3 text-left text-sm ${
        active ? "font-bold text-[var(--sf-primary)]" : "text-black/60"
      }`}
    >
      {children} <ChevronRight className="size-4" />
    </button>
  );
}
