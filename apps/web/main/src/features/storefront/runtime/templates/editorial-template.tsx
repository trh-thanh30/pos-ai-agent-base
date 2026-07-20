"use client";

/* eslint-disable @next/next/no-img-element */
import { ArrowRight } from "lucide-react";
import type { StorefrontTemplateProps } from "../types";
import {
  CatalogEmptyState,
  CategoryControls,
  SearchControl,
} from "../components/catalog-controls";
import { EditorialProductCard } from "../components/product-cards";

export function EditorialTemplate({
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
  onScrollToProducts,
}: StorefrontTemplateProps) {
  return (
    <>
      {config.home.show_hero && (
        <section className="relative min-h-[520px] overflow-hidden bg-neutral-950 text-white">
          <img
            src={theme.banner}
            alt=""
            className="absolute inset-0 size-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className="relative mx-auto flex min-h-[520px] max-w-7xl items-end px-5 pb-14 pt-32 lg:px-8 lg:pb-20">
            <div className="max-w-2xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                Bộ sưu tập của {store.name}
              </p>
              <h1
                className="text-4xl leading-[1.08] sm:text-6xl lg:text-7xl"
                style={{ fontFamily: theme.headingFont }}
              >
                {config.home.hero_title}
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-white/78">
                {config.home.hero_subtitle}
              </p>
              <button
                onClick={onScrollToProducts}
                className="mt-7 inline-flex h-12 items-center gap-3 bg-white px-6 text-sm font-semibold text-neutral-950 transition hover:bg-[var(--sf-accent)] hover:text-white"
              >
                {config.home.hero_cta_label}
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      <main
        id="products"
        className="mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-20"
      >
        <div className="grid gap-8 border-b border-black/15 pb-8 lg:grid-cols-[1fr_340px] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sf-accent)]">
              Curated selection
            </p>
            <h2
              className="mt-2 text-3xl text-[var(--sf-text)] sm:text-5xl"
              style={{ fontFamily: theme.headingFont }}
            >
              {config.home.featured_heading}
            </h2>
          </div>
          <SearchControl
            enabled={config.catalog.show_search}
            value={searchTerm}
            placeholder="Tìm trong bộ sưu tập"
            onChange={onSearchChange}
          />
        </div>
        <div className="my-7">
          <CategoryControls
            enabled={config.catalog.show_category_filter}
            categories={categories}
            selectedCategory={selectedCategory}
            onChange={onCategoryChange}
          />
        </div>
        {filteredProducts.length ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-7 lg:gap-y-14">
            {filteredProducts.map((product) => (
              <EditorialProductCard
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
