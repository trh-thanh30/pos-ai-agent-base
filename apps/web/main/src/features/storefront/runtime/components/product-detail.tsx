"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import {
  Check,
  Minus,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react";
import type { StorefrontConfig } from "../../config";
import type {
  StorefrontProduct,
  StorefrontStore,
  StorefrontTheme,
} from "../types";
import {
  FALLBACK_PRODUCT_IMAGE,
  formatCurrency,
  getProductStock,
  getProductVariant,
} from "../utils";
import { OrebiProductCard } from "./product-cards";

interface ProductDetailViewProps {
  product: StorefrontProduct;
  allProducts: StorefrontProduct[];
  store: StorefrontStore;
  config: StorefrontConfig;
  theme: StorefrontTheme;
  onAddProduct: (
    product: StorefrontProduct,
    variantId?: string,
    quantity?: number,
  ) => void;
  onSelectProduct: (product: StorefrontProduct) => void;
  onBack: () => void;
  onCheckoutDirect?: (
    product: StorefrontProduct,
    variantId: string,
    quantity: number,
  ) => void;
}

export function ProductDetailView({
  product,
  allProducts,
  store,
  config,
  onAddProduct,
  onSelectProduct,
  onBack,
  onCheckoutDirect,
}: ProductDetailViewProps) {
  const variants = product.variant || [];
  const fallbackVariant = getProductVariant(product);
  const [selectedVariantId, setSelectedVariantId] = useState(
    variants[0]?.id || fallbackVariant.id,
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const selectedVariant =
    variants.find((variant) => variant.id === selectedVariantId) ||
    fallbackVariant;
  const stock = getProductStock(product);

  useEffect(() => {
    setSelectedVariantId(
      product.variant?.[0]?.id || getProductVariant(product).id,
    );
    setQuantity(1);
    setAdded(false);
  }, [product]);

  const related = allProducts
    .filter(
      (item) =>
        item.id !== product.id &&
        (!product.categories?.[0] ||
          item.categories?.some(
            (category) => category.id === product.categories?.[0]?.id,
          )),
    )
    .slice(0, 4);

  const addToCart = () => {
    onAddProduct(product, selectedVariant.id, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <main className="sf-view-enter mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
      <button
        type="button"
        onClick={onBack}
        className="text-xs text-[#767676] hover:text-[var(--sf-primary)] lg:text-sm"
      >
        Trang chủ / {product.categories?.[0]?.name || "Sản phẩm"} /{" "}
        <span className="text-[#262626]">{product.name}</span>
      </button>

      <section className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-square overflow-hidden bg-[#f3f3f3]">
          <img
            src={product.image_url || FALLBACK_PRODUCT_IMAGE}
            alt={product.name}
            className="size-full object-contain p-8 sm:p-12"
          />
          <span className="absolute left-5 top-5 bg-[var(--sf-primary)] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
            {stock > 0 ? "Còn hàng" : "Hết hàng"}
          </span>
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#767676] lg:text-sm">
            {product.categories?.[0]?.name || store.name}
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.04em] text-[#262626] sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-5 border-b border-[#e6e6e3] pb-6 text-2xl font-bold text-[#262626]">
            {formatCurrency(selectedVariant.price)}
          </p>
          <p className="mt-6 text-sm leading-7 text-[#6d6d6d] lg:text-base lg:leading-8">
            {product.description ||
              `Sản phẩm được tuyển chọn và phân phối bởi ${store.name}.`}
          </p>

          {variants.length > 1 && (
            <div className="mt-7">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] lg:text-sm">
                Phiên bản
              </p>
              <div className="flex flex-wrap gap-2">
                {variants.map((variant) => (
                  <button
                    type="button"
                    key={variant.id}
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={`border px-4 py-3 text-xs font-semibold lg:text-sm ${selectedVariantId === variant.id ? "border-[var(--sf-primary)] bg-[var(--sf-primary)] text-white" : "border-[#d8d8d5] text-[#6d6d6d] hover:border-[var(--sf-primary)] hover:text-[var(--sf-primary)]"}`}
                  >
                    {variant.name} · {formatCurrency(variant.price)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-7 flex flex-wrap gap-3">
            <div className="flex h-13 items-center border border-[#d8d8d5]">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="grid size-12 place-items-center"
                aria-label="Giảm số lượng"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-10 text-center text-sm font-bold">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((value) => value + 1)}
                className="grid size-12 place-items-center"
                aria-label="Tăng số lượng"
              >
                <Plus className="size-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={addToCart}
              disabled={stock <= 0}
              className="flex h-13 flex-1 items-center justify-center gap-3 bg-[var(--sf-primary)] px-6 text-sm font-bold text-white hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 lg:text-base"
            >
              {added ? (
                <Check className="size-5" />
              ) : (
                <ShoppingCart className="size-5" />
              )}
              {added ? "Đã thêm vào giỏ" : "Thêm vào giỏ"}
            </button>
            {onCheckoutDirect && (
              <button
                type="button"
                onClick={() =>
                  onCheckoutDirect(product, selectedVariant.id, quantity)
                }
                disabled={stock <= 0}
                className="h-13 border border-[var(--sf-primary)] px-7 text-sm font-bold text-[var(--sf-primary)] hover:bg-[var(--sf-primary)] hover:text-white disabled:opacity-40 lg:text-base"
              >
                Mua ngay
              </button>
            )}
          </div>

          <div className="mt-8 grid gap-3 border-t border-[#e6e6e3] pt-6 text-xs text-[#6d6d6d] sm:grid-cols-3 lg:text-sm">
            <span className="flex items-center gap-2">
              <Truck className="size-4 text-[#262626]" /> Giao hàng nhanh
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-[#262626]" /> Đảm bảo chất
              lượng
            </span>
            <span className="flex items-center gap-2">
              <RefreshCw className="size-4 text-[#262626]" /> Đổi trả thuận tiện
            </span>
          </div>

          <dl className="mt-8 grid gap-3 border-t border-[#e6e6e3] pt-6 text-xs lg:text-sm">
            <div className="flex gap-3">
              <dt className="w-20 font-bold">SKU</dt>
              <dd className="text-[#767676]">
                {selectedVariant.sku || product.id.slice(0, 8)}
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-20 font-bold">Tồn kho</dt>
              <dd className="text-[#767676]">
                {stock > 0 ? `${stock} sản phẩm` : "Liên hệ cửa hàng"}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-20 lg:py-28">
          <h2 className="mb-8 text-2xl font-bold tracking-[-0.03em] sm:text-4xl">
            Sản phẩm tương tự
          </h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 lg:gap-x-8">
            {related.map((item) => (
              <OrebiProductCard
                key={item.id}
                product={item}
                config={config}
                onAdd={onAddProduct}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
