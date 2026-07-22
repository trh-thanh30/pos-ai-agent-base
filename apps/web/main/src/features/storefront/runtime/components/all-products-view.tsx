"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import type { StorefrontConfig } from "../../config";
import type {
  StorefrontCategory,
  StorefrontProduct,
  StorefrontStore,
  StorefrontTheme,
} from "../types";
import { getProductStock, getProductVariant } from "../utils";
import { OrebiProductCard } from "./product-cards";

interface AllProductsViewProps {
  store: StorefrontStore;
  products: StorefrontProduct[];
  categories: StorefrontCategory[];
  selectedCategory: string;
  config: StorefrontConfig;
  theme: StorefrontTheme;
  onCategoryChange: (catId: string) => void;
  onAddProduct: (product: StorefrontProduct) => void;
  onSelectProduct?: (product: StorefrontProduct) => void;
  onBackToHome: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMoreError: string;
  totalProducts: number;
  onLoadMore: () => void;
}

type SortOption = "default" | "price-asc" | "price-desc" | "name";

export function AllProductsView({
  products,
  categories,
  selectedCategory,
  config,
  onCategoryChange,
  onAddProduct,
  onSelectProduct,
  onBackToHome,
  hasMore,
  isLoadingMore,
  loadMoreError,
  totalProducts,
  onLoadMore,
}: AllProductsViewProps) {
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const filteredProducts = useMemo(() => {
    const list = products.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" ||
        product.categories?.some(
          (category) => category.id === selectedCategory,
        );
      const matchesStock =
        config.catalog.show_out_of_stock || getProductStock(product) > 0;
      return matchesCategory && matchesStock;
    });

    if (sortBy === "price-asc")
      return [...list].sort(
        (a, b) => getProductVariant(a).price - getProductVariant(b).price,
      );
    if (sortBy === "price-desc")
      return [...list].sort(
        (a, b) => getProductVariant(b).price - getProductVariant(a).price,
      );
    if (sortBy === "name")
      return [...list].sort((a, b) => a.name.localeCompare(b.name, "vi"));
    return list;
  }, [config.catalog, products, selectedCategory, sortBy]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMore || isLoadingMore || loadMoreError) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMoreError, onLoadMore]);

  const activeCategory =
    categories.find((category) => category.id === selectedCategory)?.name ||
    "Tất cả sản phẩm";

  return (
    <main className="mx-auto min-h-[70vh] max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
      <button
        type="button"
        onClick={onBackToHome}
        className="text-xs font-medium text-[#767676] hover:text-[var(--sf-primary)] lg:text-sm"
      >
        Trang chủ / <span className="text-[#262626]">Sản phẩm</span>
      </button>
      <h1 className="mt-5 text-3xl font-bold tracking-[-0.04em] text-[#262626] sm:text-5xl lg:text-6xl">
        {activeCategory}
      </h1>

      <div
        className={`mt-12 items-center justify-between border-y border-[#e6e6e3] py-4 lg:hidden ${
          config.catalog.show_category_filter ? "flex" : "hidden"
        }`}
      >
        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          className="flex items-center gap-2 text-sm font-bold"
        >
          <SlidersHorizontal className="size-4" /> Bộ lọc
        </button>
        <span className="text-xs text-[#767676]">
          {filteredProducts.length} sản phẩm
        </span>
      </div>

      <div
        className={`mt-10 grid gap-10 lg:gap-14 ${
          config.catalog.show_category_filter
            ? "lg:grid-cols-[240px_1fr]"
            : "grid-cols-1"
        }`}
      >
        {config.catalog.show_category_filter && (
          <aside className={`${filtersOpen ? "block" : "hidden"} lg:block`}>
            <div className="border-b border-[#e6e6e3] pb-5">
              <h2 className="flex items-center justify-between text-base font-bold lg:text-lg">
                Danh mục <ChevronDown className="size-4" />
              </h2>
              <div className="mt-4 grid text-sm text-[#767676] lg:text-base">
                <button
                  type="button"
                  onClick={() => onCategoryChange("all")}
                  className={`border-b border-[#eeeeeb] py-3 text-left hover:text-[var(--sf-primary)] ${selectedCategory === "all" ? "font-bold text-[var(--sf-primary)]" : ""}`}
                >
                  Tất cả sản phẩm
                </button>
                {categories.map((category) => (
                  <button
                    type="button"
                    key={category.id}
                    onClick={() => onCategoryChange(category.id)}
                    className={`border-b border-[#eeeeeb] py-3 text-left hover:text-[var(--sf-primary)] ${selectedCategory === category.id ? "font-bold text-[var(--sf-primary)]" : ""}`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="border-b border-[#e6e6e3] py-5">
              <h2 className="text-base font-bold lg:text-lg">Tình trạng</h2>
              <p className="mt-4 text-sm text-[#767676] lg:text-base">
                Sản phẩm còn hàng
              </p>
            </div>
          </aside>
        )}

        <section>
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-[#767676] lg:text-base">
              Đã tải {products.length}/{totalProducts} sản phẩm
            </p>
            <label className="flex items-center gap-3 text-sm text-[#767676]">
              Sắp xếp:
              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value as SortOption)
                }
                className="h-11 min-w-48 border border-[#d8d8d5] bg-white px-3 text-sm text-[var(--sf-text)] outline-none focus:border-[var(--sf-primary)]"
              >
                <option value="default">Mặc định</option>
                <option value="price-asc">Giá thấp đến cao</option>
                <option value="price-desc">Giá cao đến thấp</option>
                <option value="name">Tên A–Z</option>
              </select>
            </label>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4 lg:gap-x-7">
              {filteredProducts.map((product) => (
                <OrebiProductCard
                  key={product.id}
                  product={product}
                  config={config}
                  onAdd={onAddProduct}
                  onSelectProduct={onSelectProduct}
                />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-[#d8d8d5] px-6 py-20 text-center text-sm text-[#767676]">
              Danh mục này chưa có sản phẩm.
            </div>
          )}

          <div ref={loadMoreRef} className="mt-12 min-h-20" aria-live="polite">
            {isLoadingMore && (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-[4/5] animate-pulse rounded-[var(--sf-radius)] bg-[#ecece9]"
                  />
                ))}
              </div>
            )}
            {loadMoreError && hasMore && (
              <div className="text-center">
                <p className="text-sm text-[#767676]">{loadMoreError}</p>
                <button
                  type="button"
                  onClick={onLoadMore}
                  className="mt-4 bg-[var(--sf-primary)] px-6 py-3 text-sm font-bold text-white hover:brightness-110"
                >
                  Thử tải lại
                </button>
              </div>
            )}
            {!hasMore && products.length > 0 && (
              <p className="text-center text-sm text-[#767676] lg:text-base">
                Bạn đã xem hết {totalProducts} sản phẩm.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
