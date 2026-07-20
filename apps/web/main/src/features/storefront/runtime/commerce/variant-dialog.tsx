"use client";

/* eslint-disable @next/next/no-img-element */
import { Check } from "lucide-react";
import type { StorefrontConfig } from "../../config";
import type { StorefrontProduct, StorefrontVariant } from "../types";
import { FALLBACK_PRODUCT_IMAGE, formatCurrency, getStock } from "../utils";

interface VariantDialogProps {
  product: StorefrontProduct | null;
  selectedVariantId: string;
  config: StorefrontConfig;
  onSelect: (variantId: string) => void;
  onAdd: (product: StorefrontProduct, variant: StorefrontVariant) => void;
  onClose: () => void;
}

export function VariantDialog({
  product,
  selectedVariantId,
  config,
  onSelect,
  onAdd,
  onClose,
}: VariantDialogProps) {
  if (!product) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <button
        className="absolute inset-0 bg-black/45"
        aria-label="Đóng chọn phân loại"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-md bg-white p-6 shadow-2xl"
        style={{ borderRadius: "var(--sf-radius)" }}
      >
        <div className="flex gap-4">
          <img
            src={product.image_url || FALLBACK_PRODUCT_IMAGE}
            alt={product.name}
            className="size-24 object-cover"
            style={{ borderRadius: "var(--sf-radius)" }}
          />
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-black/40">
              Chọn phân loại
            </p>
            <h2 className="mt-1 text-lg font-bold">{product.name}</h2>
          </div>
        </div>
        <div className="mt-5 grid gap-2">
          {product.variant?.map((variant) => {
            const selected = selectedVariantId === variant.id;
            const stock = getStock(variant);
            return (
              <button
                key={variant.id}
                onClick={() => onSelect(variant.id)}
                className={`flex items-center justify-between border px-4 py-3 text-left ${
                  selected
                    ? "border-[var(--sf-primary)] bg-[var(--sf-primary)]/5"
                    : "border-black/12"
                }`}
                style={{ borderRadius: "var(--sf-radius)" }}
              >
                <span>
                  <span className="block text-sm font-semibold">
                    {variant.name}
                  </span>
                  {config.catalog.show_stock_status && (
                    <span className="text-xs text-black/45">
                      {stock > 0 ? `Còn ${stock}` : "Liên hệ cửa hàng"}
                    </span>
                  )}
                </span>
                <span className="flex items-center gap-2 text-sm font-bold">
                  {formatCurrency(variant.price)}
                  {selected && (
                    <Check className="size-4 text-[var(--sf-primary)]" />
                  )}
                </span>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => {
            const variant = product.variant?.find(
              (item) => item.id === selectedVariantId,
            );
            if (variant) onAdd(product, variant);
          }}
          className="mt-5 h-12 w-full bg-[var(--sf-primary)] text-sm font-bold text-white"
          style={{ borderRadius: "var(--sf-radius)" }}
        >
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}
