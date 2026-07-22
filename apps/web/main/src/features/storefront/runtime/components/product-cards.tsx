"use client";

/* eslint-disable @next/next/no-img-element */
import type { MouseEvent } from "react";
import { useState } from "react";
import { Eye, Heart, RefreshCw, ShoppingCart } from "lucide-react";
import type { StorefrontConfig } from "../../config";
import type { StorefrontProduct } from "../types";
import {
  FALLBACK_PRODUCT_IMAGE,
  formatCurrency,
  getProductStock,
  getProductVariant,
} from "../utils";

interface ProductCardProps {
  product: StorefrontProduct;
  config: StorefrontConfig;
  onAdd: (product: StorefrontProduct) => void;
  onSelectProduct?: (product: StorefrontProduct) => void;
  badge?: string;
}

export function OrebiProductCard({
  product,
  config,
  onAdd,
  onSelectProduct,
  badge = "Mới",
}: ProductCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const variant = getProductVariant(product);
  const stock = getProductStock(product);
  const category = product.categories?.[0]?.name;
  const ratioClass =
    config.catalog.image_ratio === "portrait"
      ? "aspect-[4/5]"
      : config.catalog.image_ratio === "landscape"
        ? "aspect-[4/3]"
        : "aspect-square";
  const productHref = `/products/${encodeURIComponent(product.id)}`;
  const handleProductLink = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      !onSelectProduct ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    onSelectProduct(product);
  };

  return (
    <article
      className="group flex h-full min-w-0 flex-col border border-[#ecece9] bg-white p-3 text-[var(--sf-text)] transition duration-300 hover:-translate-y-1 hover:border-[#d8d8d5] hover:shadow-[0_16px_40px_rgba(38,38,38,0.08)] sm:p-4 lg:p-5"
      style={{ borderRadius: "var(--sf-radius)" }}
    >
      <div
        className={`relative ${ratioClass} overflow-hidden bg-transparent`}
        style={{ borderRadius: "var(--sf-radius)" }}
      >
        <a
          href={productHref}
          onClick={handleProductLink}
          className="block size-full cursor-pointer"
          aria-label={`Xem ${product.name}`}
        >
          {imageLoading && (
            <span className="absolute inset-0 grid place-items-center bg-white/85">
              <span className="size-8 animate-spin rounded-full border-2 border-[#e7e7e3] border-t-[var(--sf-primary)]" />
              <span className="sr-only">Đang tải ảnh {product.name}</span>
            </span>
          )}
          <img
            src={product.image_url || FALLBACK_PRODUCT_IMAGE}
            alt={product.name}
            draggable={false}
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
            className={`size-full object-contain p-2 transition duration-700 ease-out group-hover:scale-[1.04] sm:p-3 ${imageLoading ? "opacity-0" : "opacity-100"}`}
          />
        </a>

        {(stock > 0 || config.catalog.show_stock_status) && (
          <span className="absolute left-4 top-4 bg-[var(--sf-primary)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
            {stock > 0 ? badge : "Hết hàng"}
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-white/95 px-4 py-3 backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0">
          <div className="grid gap-2 text-xs font-semibold text-[#767676] lg:text-sm">
            {config.catalog.quick_add && (
              <button
                type="button"
                onClick={() => onAdd(product)}
                disabled={stock <= 0}
                className="flex items-center justify-end gap-3 transition hover:text-[var(--sf-primary)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Thêm vào giỏ <ShoppingCart className="size-4" />
              </button>
            )}
            <a
              href={productHref}
              onClick={handleProductLink}
              className="flex items-center justify-end gap-3 transition hover:text-[var(--sf-primary)]"
            >
              Xem chi tiết <Eye className="size-4" />
            </a>
            <span className="flex items-center justify-end gap-3">
              Yêu thích <Heart className="size-4" />
            </span>
            <span className="flex items-center justify-end gap-3">
              So sánh <RefreshCw className="size-4" />
            </span>
          </div>
        </div>
      </div>

      <a
        href={productHref}
        onClick={handleProductLink}
        className="mt-4 flex w-full flex-1 flex-col px-1 pb-1 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <h3
            className="line-clamp-2 min-h-10 text-sm font-bold leading-5 transition group-hover:text-[var(--sf-primary)] sm:text-base lg:min-h-14 lg:text-lg lg:leading-7"
            style={{ fontFamily: "var(--sf-heading)" }}
          >
            {product.name}
          </h3>
          <span className="shrink-0 text-xs font-semibold text-[var(--sf-primary)] sm:text-sm lg:text-base">
            {formatCurrency(variant.price)}
          </span>
        </div>
        {config.catalog.show_product_description && (
          <p className="mt-auto line-clamp-1 pt-2 text-xs leading-5 text-[#767676] lg:text-sm">
            {category || product.description || "Sản phẩm chọn lọc"}
          </p>
        )}
      </a>
    </article>
  );
}

// Giữ tên export cũ để các view chuyển đổi độc lập mà không nhân bản card.
export const MarketProductCard = OrebiProductCard;
export const EditorialProductCard = OrebiProductCard;
export const SpecialistProductCard = OrebiProductCard;
