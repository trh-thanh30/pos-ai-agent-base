"use client";

import { useMemo, useState } from "react";
import type { StorefrontConfig } from "../../config";
import type {
  StorefrontCategory,
  StorefrontProduct,
  StorefrontStore,
  StorefrontTheme,
} from "../types";
import { getProductStock, getProductVariant } from "../utils";
import { OrebiProductCard } from "./product-cards";

interface SearchResultsViewProps {
  searchTerm: string;
  store: StorefrontStore;
  products: StorefrontProduct[];
  categories: StorefrontCategory[];
  config: StorefrontConfig;
  theme: StorefrontTheme;
  onAddProduct: (product: StorefrontProduct) => void;
  onSelectProduct: (product: StorefrontProduct) => void;
  onBackToHome: () => void;
}

type SortOption = "default" | "price-asc" | "price-desc" | "name";

export function SearchResultsView({
  searchTerm,
  products,
  categories,
  config,
  onAddProduct,
  onSelectProduct,
  onBackToHome,
}: SearchResultsViewProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  const results = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase("vi");
    const list = products.filter((product) => {
      const matchesQuery =
        !query ||
        product.name.toLocaleLowerCase("vi").includes(query) ||
        product.description?.toLocaleLowerCase("vi").includes(query) ||
        product.categories?.some((category) =>
          category.name.toLocaleLowerCase("vi").includes(query),
        );
      const matchesCategory =
        selectedCategory === "all" ||
        product.categories?.some(
          (category) => category.id === selectedCategory,
        );
      const matchesStock =
        config.catalog.show_out_of_stock || getProductStock(product) > 0;
      return matchesQuery && matchesCategory && matchesStock;
    });
    if (sortBy === "price-asc")
      return [...list]
        .sort((a, b) => getProductVariant(a).price - getProductVariant(b).price)
        .slice(0, config.catalog.products_per_page);
    if (sortBy === "price-desc")
      return [...list]
        .sort((a, b) => getProductVariant(b).price - getProductVariant(a).price)
        .slice(0, config.catalog.products_per_page);
    if (sortBy === "name")
      return [...list]
        .sort((a, b) => a.name.localeCompare(b.name, "vi"))
        .slice(0, config.catalog.products_per_page);
    return list.slice(0, config.catalog.products_per_page);
  }, [config.catalog, products, searchTerm, selectedCategory, sortBy]);

  return (
    <main className="mx-auto min-h-[70vh] max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12 lg:py-20">
      <button
        type="button"
        onClick={onBackToHome}
        className="text-xs text-[#767676] hover:text-[var(--sf-primary)] lg:text-sm"
      >
        Trang chủ / Tìm kiếm
      </button>
      <h1 className="mt-5 text-3xl font-bold tracking-[-0.04em] text-[#262626] sm:text-5xl">
        Kết quả cho “{searchTerm}”
      </h1>
      <p className="mt-3 text-sm text-[#767676] lg:text-base">
        Tìm thấy {results.length} sản phẩm phù hợp.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-y border-[#e6e6e3] py-4">
        {config.catalog.show_category_filter && (
          <div className="flex max-w-full gap-5 overflow-x-auto text-xs font-semibold text-[#767676] lg:text-sm">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={
                selectedCategory === "all"
                  ? "text-[var(--sf-primary)]"
                  : "hover:text-[var(--sf-primary)]"
              }
            >
              Tất cả
            </button>
            {categories.map((category) => (
              <button
                type="button"
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`shrink-0 ${selectedCategory === category.id ? "text-[var(--sf-primary)]" : "hover:text-[var(--sf-primary)]"}`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as SortOption)}
          className="h-11 border border-[#d8d8d5] bg-white px-3 text-xs outline-none lg:text-sm"
        >
          <option value="default">Sắp xếp mặc định</option>
          <option value="price-asc">Giá thấp đến cao</option>
          <option value="price-desc">Giá cao đến thấp</option>
          <option value="name">Tên A–Z</option>
        </select>
      </div>

      {results.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 lg:gap-x-7">
          {results.map((product) => (
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
        <div className="mt-12 border border-dashed border-[#d8d8d5] px-6 py-20 text-center">
          <h2 className="text-xl font-bold text-[#262626]">
            Không tìm thấy sản phẩm
          </h2>
          <p className="mt-2 text-sm text-[#767676]">
            Thử một từ khóa ngắn hơn hoặc quay lại xem toàn bộ cửa hàng.
          </p>
          <button
            type="button"
            onClick={onBackToHome}
            className="mt-6 bg-[var(--sf-primary)] px-7 py-3 text-sm font-bold text-white hover:brightness-110"
          >
            Về trang chủ
          </button>
        </div>
      )}
    </main>
  );
}
