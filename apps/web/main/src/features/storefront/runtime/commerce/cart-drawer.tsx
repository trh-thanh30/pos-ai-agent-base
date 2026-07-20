"use client";

/* eslint-disable @next/next/no-img-element */
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import type { StorefrontConfig } from "../../config";
import type { StorefrontCartItem } from "../types";
import { FALLBACK_PRODUCT_IMAGE, formatCurrency } from "../utils";

interface CartDrawerProps {
  open: boolean;
  cart: StorefrontCartItem[];
  cartCount: number;
  cartTotal: number;
  config: StorefrontConfig;
  onClose: () => void;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemove: (index: number) => void;
  onCheckout: () => void;
}

export function CartDrawer({
  open,
  cart,
  cartCount,
  cartTotal,
  config,
  onClose,
  onUpdateQuantity,
  onRemove,
  onCheckout,
}: CartDrawerProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <button
        className="absolute inset-0 bg-black/40"
        aria-label="Đóng giỏ hàng"
        onClick={onClose}
      />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex h-16 items-center justify-between border-b px-5">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <ShoppingBag className="size-5 text-[var(--sf-primary)]" />
            Giỏ hàng
            <span className="text-sm font-normal text-black/40">
              ({cartCount})
            </span>
          </h2>
          <button
            aria-label="Đóng giỏ hàng"
            onClick={onClose}
            className="grid size-10 place-items-center"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {cart.length === 0 ? (
            <div className="grid h-full place-items-center text-center">
              <div>
                <ShoppingBag className="mx-auto size-10 text-black/20" />
                <p className="mt-4 font-semibold">Giỏ hàng đang trống</p>
                <button
                  onClick={onClose}
                  className="mt-3 text-sm font-bold text-[var(--sf-primary)]"
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-5">
              {cart.map((item, index) => (
                <div
                  key={`${item.product.id}-${item.variant.id}`}
                  className="grid grid-cols-[72px_1fr_auto] gap-3 border-b border-black/10 pb-5"
                >
                  <img
                    src={item.product.image_url || FALLBACK_PRODUCT_IMAGE}
                    alt={item.product.name}
                    className="size-[72px] object-cover"
                    style={{ borderRadius: "var(--sf-radius)" }}
                  />
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold">
                      {item.product.name}
                    </h3>
                    <p className="mt-1 text-xs text-black/45">
                      {item.variant.name}
                    </p>
                    <p className="mt-2 text-sm font-bold">
                      {formatCurrency(item.variant.price)}
                    </p>
                    <div className="mt-3 flex w-fit items-center border border-black/12">
                      <button
                        aria-label="Giảm số lượng"
                        onClick={() =>
                          onUpdateQuantity(index, item.quantity - 1)
                        }
                        className="grid size-8 place-items-center"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold">
                        {item.quantity}
                      </span>
                      <button
                        aria-label="Tăng số lượng"
                        onClick={() =>
                          onUpdateQuantity(index, item.quantity + 1)
                        }
                        className="grid size-8 place-items-center"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  </div>
                  <button
                    aria-label={`Xóa ${item.product.name}`}
                    onClick={() => onRemove(index)}
                    className="grid size-9 place-items-center text-black/35 hover:text-red-600"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {cart.length > 0 && (
          <div className="border-t bg-[var(--sf-bg)] p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-black/55">Tạm tính</span>
              <span className="text-xl font-bold">
                {formatCurrency(cartTotal)}
              </span>
            </div>
            <p className="mt-1 text-xs text-black/40">
              Phí giao hàng được cửa hàng xác nhận sau.
            </p>
            <button
              disabled={!config.checkout.enabled}
              onClick={onCheckout}
              className="mt-4 h-12 w-full bg-[var(--sf-primary)] text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              style={{ borderRadius: "var(--sf-radius)" }}
            >
              {config.checkout.enabled
                ? "Tiếp tục đặt hàng"
                : "Cửa hàng tạm ngưng nhận đơn"}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
