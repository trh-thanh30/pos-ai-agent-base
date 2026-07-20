"use client";

/* eslint-disable @next/next/no-img-element */
import { Plus, ShoppingBag } from "lucide-react";
import type { StorefrontConfig } from "../../config";
import type { StorefrontProduct } from "../types";
import {
  FALLBACK_PRODUCT_IMAGE,
  formatCurrency,
  getProductStock,
  getProductVariant,
} from "../utils";

function ProductImage({
  product,
  ratio,
}: {
  product: StorefrontProduct;
  ratio: "square" | "portrait" | "landscape";
}) {
  const ratioClass =
    ratio === "portrait"
      ? "aspect-[4/5]"
      : ratio === "landscape"
        ? "aspect-[4/3]"
        : "aspect-square";
  return (
    <div className={`${ratioClass} overflow-hidden bg-black/5`}>
      <img
        src={product.image_url || FALLBACK_PRODUCT_IMAGE}
        alt={product.name}
        className="size-full object-cover transition duration-500 group-hover:scale-[1.035]"
      />
    </div>
  );
}

interface ProductCardProps {
  product: StorefrontProduct;
  config: StorefrontConfig;
  onAdd: (product: StorefrontProduct) => void;
}

export function MarketProductCard({
  product,
  config,
  onAdd,
}: ProductCardProps) {
  const variant = getProductVariant(product);
  const stock = getProductStock(product);
  return (
    <article
      className="group flex min-w-0 flex-col overflow-hidden border border-black/10 bg-white transition hover:-translate-y-0.5 hover:border-[var(--sf-primary)]/40 hover:shadow-lg"
      style={{ borderRadius: "var(--sf-radius)" }}
    >
      <ProductImage product={product} ratio={config.catalog.image_ratio} />
      <div className="flex flex-1 flex-col p-3">
        <p className="line-clamp-2 min-h-10 text-sm font-bold leading-5">
          {product.name}
        </p>
        {config.catalog.show_stock_status && (
          <span
            className={`mt-1 text-[11px] font-semibold ${
              stock > 0 ? "text-emerald-700" : "text-amber-700"
            }`}
          >
            {stock > 0 ? `Còn hàng${stock ? ` · ${stock}` : ""}` : "Liên hệ"}
          </span>
        )}
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <strong className="text-sm text-[var(--sf-primary)]">
            {formatCurrency(variant.price)}
          </strong>
          <button
            onClick={() => onAdd(product)}
            aria-label={`Thêm ${product.name} vào giỏ`}
            className="grid size-9 shrink-0 place-items-center bg-[var(--sf-primary)] text-white"
            style={{ borderRadius: "var(--sf-radius)" }}
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

export function EditorialProductCard({
  product,
  config,
  onAdd,
}: ProductCardProps) {
  const variant = getProductVariant(product);
  return (
    <article className="group min-w-0">
      <div className="relative">
        <ProductImage product={product} ratio={config.catalog.image_ratio} />
        <button
          onClick={() => onAdd(product)}
          className="absolute bottom-3 right-3 grid size-11 place-items-center bg-white text-neutral-950 opacity-100 shadow-lg transition hover:bg-[var(--sf-accent)] hover:text-white lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100"
          aria-label={`Chọn ${product.name}`}
        >
          <ShoppingBag className="size-4" />
        </button>
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3
            className="truncate text-base"
            style={{ fontFamily: "var(--sf-heading)" }}
          >
            {product.name}
          </h3>
          {config.catalog.show_product_description && (
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-black/48">
              {product.description || "Một lựa chọn được cửa hàng đề xuất."}
            </p>
          )}
        </div>
        <strong className="shrink-0 text-sm">
          {formatCurrency(variant.price)}
        </strong>
      </div>
    </article>
  );
}

export function SpecialistProductCard({
  product,
  config,
  onAdd,
}: ProductCardProps) {
  const variant = getProductVariant(product);
  const stock = getProductStock(product);
  return (
    <article
      className="group overflow-hidden border border-black/10 bg-white transition hover:border-[var(--sf-primary)]/45 hover:shadow-md"
      style={{ borderRadius: "var(--sf-radius)" }}
    >
      <ProductImage product={product} ratio={config.catalog.image_ratio} />
      <div className="p-4">
        <div className="flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-[0.08em]">
          <span className="text-[var(--sf-primary)]">
            {product.categories?.[0]?.name || "Sản phẩm"}
          </span>
          {config.catalog.show_stock_status && (
            <span className={stock > 0 ? "text-emerald-700" : "text-amber-700"}>
              {stock > 0 ? "Còn hàng" : "Liên hệ"}
            </span>
          )}
        </div>
        <h3 className="mt-2 line-clamp-2 min-h-11 text-base font-bold leading-[1.4]">
          {product.name}
        </h3>
        {config.catalog.show_product_description && (
          <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-black/48">
            {product.description || "Thông tin chi tiết đang được cập nhật."}
          </p>
        )}
        <div className="mt-4 border-t border-black/8 pt-4">
          <div className="flex items-center justify-between">
            <strong className="text-base text-[var(--sf-primary)]">
              {product.variant && product.variant.length > 1 && (
                <span className="mr-1 text-[10px] font-normal text-black/40">
                  Từ
                </span>
              )}
              {formatCurrency(variant.price)}
            </strong>
            <span className="text-[11px] text-black/40">
              {product.variant?.length || 1} lựa chọn
            </span>
          </div>
          <button
            onClick={() => onAdd(product)}
            className="mt-3 h-10 w-full border border-[var(--sf-primary)] text-xs font-bold text-[var(--sf-primary)] transition hover:bg-[var(--sf-primary)] hover:text-white"
            style={{ borderRadius: "var(--sf-radius)" }}
          >
            Chọn sản phẩm
          </button>
        </div>
      </div>
    </article>
  );
}
