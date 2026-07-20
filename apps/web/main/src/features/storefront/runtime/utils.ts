import type { StorefrontProduct, StorefrontVariant } from "./types";

export const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80";

export const FALLBACK_BANNER =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1800&auto=format&fit=crop&q=85";

export function formatCurrency(value: number | string) {
  const amount = typeof value === "number" ? value : Number(value || 0);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export function getProductVariant(
  product: StorefrontProduct,
): StorefrontVariant {
  return (
    product.variant?.[0] || {
      id: product.id,
      name: "Mặc định",
      price: product.price,
      sku: "",
      variant_stocks: [],
    }
  );
}

export function getStock(variant: StorefrontVariant) {
  return (variant.variant_stocks || []).reduce(
    (total, stock) => total + stock.onHand,
    0,
  );
}

export function getProductStock(product: StorefrontProduct) {
  return (product.variant || []).reduce(
    (total, variant) => total + getStock(variant),
    0,
  );
}
