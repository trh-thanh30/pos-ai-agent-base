"use client";

import { X } from "lucide-react";
import type { StorefrontStore } from "../types";

interface MobileMenuProps {
  open: boolean;
  store: StorefrontStore;
  onClose: () => void;
  onScrollToProducts: () => void;
}

export function MobileMenu({
  open,
  store,
  onClose,
  onScrollToProducts,
}: MobileMenuProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        aria-label="Đóng menu"
        className="absolute inset-0 bg-black/35"
        onClick={onClose}
      />
      <div className="relative h-full w-[min(86vw,340px)] bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-5">
          <span className="font-bold">{store.name}</span>
          <button
            aria-label="Đóng menu"
            onClick={onClose}
            className="grid size-10 place-items-center"
          >
            <X className="size-5" />
          </button>
        </div>
        <nav className="mt-5 grid text-base font-semibold">
          <button
            className="border-b py-4 text-left"
            onClick={() => {
              onClose();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Trang chủ
          </button>
          <button
            className="border-b py-4 text-left"
            onClick={() => {
              onClose();
              onScrollToProducts();
            }}
          >
            Sản phẩm
          </button>
          {store.phone_number && (
            <a className="border-b py-4" href={`tel:${store.phone_number}`}>
              Gọi {store.phone_number}
            </a>
          )}
        </nav>
      </div>
    </div>
  );
}
