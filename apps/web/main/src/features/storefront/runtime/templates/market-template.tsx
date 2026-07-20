"use client";

import { ArrowRight } from "lucide-react";
import type { StorefrontTemplateProps } from "../types";
import {
  CatalogEmptyState,
  CategoryControls,
  SearchControl,
} from "../components/catalog-controls";
import { MarketProductCard } from "../components/product-cards";

export function MarketTemplate({
  config,
  store,
  products,
  filteredProducts,
  categories,
  selectedCategory,
  searchTerm,
  theme,
  onCategoryChange,
  onSearchChange,
  onAddProduct,
  onScrollToProducts,
}: StorefrontTemplateProps) {
  return (
    <>
      <section className="border-b border-black/10 bg-[var(--sf-primary)] text-white">
        <div className="mx-auto grid max-w-7xl gap-7 px-4 py-9 lg:grid-cols-[1fr_440px] lg:items-center lg:px-6">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-white/70">
              Chọn nhanh, nhận hàng tiện
            </p>
            <h1
              className="max-w-2xl text-3xl font-bold leading-tight sm:text-4xl"
              style={{ fontFamily: theme.headingFont }}
            >
              {config.home.hero_title || store.name}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
              {config.home.hero_subtitle || store.description}
            </p>
          </div>
          <div className="border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
            <SearchControl
              enabled={config.catalog.show_search}
              value={searchTerm}
              placeholder="Bạn đang cần tìm gì?"
              onChange={onSearchChange}
            />
            <div className="mt-3 flex items-center justify-between text-xs text-white/75">
              <span>{products.length} sản phẩm đang bán</span>
              <button
                onClick={onScrollToProducts}
                className="inline-flex items-center gap-1 font-semibold text-white"
              >
                Xem tất cả <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <main id="products" className="mx-auto max-w-7xl px-4 py-7 lg:px-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--sf-primary)]">
              Mua sắm hôm nay
            </p>
            <h2
              className="mt-1 text-2xl font-bold text-[var(--sf-text)]"
              style={{ fontFamily: theme.headingFont }}
            >
              {config.home.featured_heading}
            </h2>
          </div>
          <span className="hidden text-sm text-black/45 sm:block">
            {filteredProducts.length} kết quả
          </span>
        </div>
        <div className="mb-6">
          <CategoryControls
            enabled={config.catalog.show_category_filter}
            categories={categories}
            selectedCategory={selectedCategory}
            compact
            onChange={onCategoryChange}
          />
        </div>
        {filteredProducts.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {filteredProducts.map((product) => (
              <MarketProductCard
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
      </main>
    </>
  );
}
