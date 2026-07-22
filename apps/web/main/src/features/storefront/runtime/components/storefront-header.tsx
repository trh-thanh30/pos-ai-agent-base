"use client";

/* eslint-disable @next/next/no-img-element */
import { ChevronDown, Menu, ShoppingCart, UserRound } from "lucide-react";
import type {
  StorefrontCategory,
  StorefrontProduct,
  StorefrontStore,
  StorefrontTheme,
} from "../types";
import type { CustomerUser } from "./auth-dialog";
import { StorefrontSearchDropdown } from "./search-dropdown";

interface StorefrontHeaderProps {
  store: StorefrontStore;
  products: StorefrontProduct[];
  categories?: StorefrontCategory[];
  selectedCategory?: string;
  theme: StorefrontTheme;
  cartCount: number;
  showSearch: boolean;
  searchTerm: string;
  user: CustomerUser | null;
  activeView?: "home" | "search-result" | "product-detail" | "all-products";
  onSearchChange: (query: string) => void;
  onCategoryChange?: (categoryId: string) => void;
  onSelectProduct: (product: StorefrontProduct) => void;
  onExecuteSearch: (query: string) => void;
  onOpenMenu: () => void;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onGoHome: () => void;
  onScrollToProducts: () => void;
  onOpenAllProducts?: () => void;
}

export function StorefrontHeader({
  store,
  products,
  categories = [],
  selectedCategory = "all",
  theme,
  cartCount,
  showSearch,
  searchTerm,
  user,
  activeView = "home",
  onSearchChange,
  onCategoryChange,
  onSelectProduct,
  onExecuteSearch,
  onOpenMenu,
  onOpenCart,
  onOpenAuth,
  onGoHome,
  onScrollToProducts,
  onOpenAllProducts,
}: StorefrontHeaderProps) {
  return (
    <header className="relative z-40 bg-white text-[#262626]">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-6 px-5 sm:px-8 lg:h-24 lg:px-12">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Mở menu"
          className="grid size-10 place-items-center lg:hidden"
        >
          <Menu className="size-6" />
        </button>

        <button
          type="button"
          onClick={onGoHome}
          className="flex min-w-0 items-center gap-3 text-left"
        >
          {theme.logo ? (
            <img
              src={theme.logo}
              alt={`Logo ${store.name}`}
              className="max-h-10 w-auto max-w-36 object-contain"
            />
          ) : null}
          <span
            className="truncate text-xl font-bold tracking-[-0.04em] sm:text-2xl"
            style={{ fontFamily: "var(--sf-heading)" }}
          >
            {store.name}
          </span>
        </button>

        <nav className="hidden items-center gap-9 text-base font-semibold lg:flex">
          <button
            type="button"
            onClick={onGoHome}
            className={
              activeView === "home"
                ? "text-[var(--sf-primary)]"
                : "text-[#767676] hover:text-[var(--sf-primary)]"
            }
          >
            Trang chủ
          </button>
          <button
            type="button"
            onClick={onOpenAllProducts || onScrollToProducts}
            className={
              activeView === "all-products"
                ? "text-[var(--sf-primary)]"
                : "text-[#767676] hover:text-[var(--sf-primary)]"
            }
          >
            Sản phẩm
          </button>
          <button
            type="button"
            onClick={onScrollToProducts}
            className="text-[#767676] hover:text-[var(--sf-primary)]"
          >
            Ưu đãi
          </button>
          <button
            type="button"
            onClick={onScrollToProducts}
            className="text-[#767676] hover:text-[var(--sf-primary)]"
          >
            Bộ sưu tập
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onOpenAuth}
            className="hidden items-center gap-2 text-base font-semibold sm:flex"
          >
            <UserRound className="size-5" />
            <span className="max-w-28 truncate">
              {user?.name || "Tài khoản"}
            </span>
            <ChevronDown className="size-3" />
          </button>
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Giỏ hàng có ${cartCount} sản phẩm`}
            className="relative grid size-10 place-items-center"
          >
            <ShoppingCart className="size-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 grid min-h-6 min-w-6 place-items-center rounded-full bg-[var(--sf-primary)] px-1 text-base font-bold leading-none text-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="bg-[#f5f5f3]">
        <div className="mx-auto flex min-h-16 max-w-[1440px] items-center gap-5 px-5 py-3 sm:px-8 lg:px-12">
          <div className="group relative hidden shrink-0 md:block">
            <button
              type="button"
              className="flex items-center gap-3 text-base font-bold"
            >
              <Menu className="size-5" />
              Danh mục sản phẩm
              <ChevronDown className="size-3" />
            </button>
            <div className="invisible absolute left-0 top-full z-50 mt-3 w-64 translate-y-2 bg-[var(--sf-primary)] py-2 opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => {
                  onCategoryChange?.("all");
                  onOpenAllProducts?.();
                }}
                className={`block w-full px-5 py-3 text-left text-base font-semibold transition hover:pl-7 hover:text-white ${selectedCategory === "all" ? "text-white" : "text-white/65"}`}
              >
                Tất cả sản phẩm
              </button>
              {categories.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => onCategoryChange?.(category.id)}
                  className={`block w-full border-t border-white/10 px-5 py-3 text-left text-base font-semibold transition hover:pl-7 hover:text-white ${selectedCategory === category.id ? "text-white" : "text-white/65"}`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {showSearch ? (
            <div className="mx-auto w-full max-w-2xl">
              <StorefrontSearchDropdown
                store={store}
                products={products}
                theme={theme}
                searchTerm={searchTerm}
                onSearchChange={onSearchChange}
                onSelectProduct={onSelectProduct}
                onExecuteSearch={onExecuteSearch}
              />
            </div>
          ) : (
            <div className="flex-1" />
          )}

          <p className="hidden shrink-0 text-base text-[#767676] xl:block">
            Giao hàng nhanh · Hỗ trợ tận tâm
          </p>
        </div>
      </div>
    </header>
  );
}
