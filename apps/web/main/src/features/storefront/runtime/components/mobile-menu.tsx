"use client";

import { Phone, User, X } from "lucide-react";
import type { StorefrontStore } from "../types";
import type { CustomerUser } from "./auth-dialog";

interface MobileMenuProps {
  open: boolean;
  store: StorefrontStore;
  user: CustomerUser | null;
  onClose: () => void;
  onOpenAuth: () => void;
  onScrollToProducts: () => void;
}

export function MobileMenu({
  open,
  store,
  user,
  onClose,
  onOpenAuth,
  onScrollToProducts,
}: MobileMenuProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        aria-label="Đóng menu"
        className="absolute inset-0 bg-black/40 backdrop-blur-xs"
        onClick={onClose}
      />
      <div className="relative h-full w-[min(86vw,340px)] bg-white p-6 shadow-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b pb-4">
            <span className="font-bold text-lg text-gray-900 truncate">{store.name}</span>
            <button
              aria-label="Đóng menu"
              onClick={onClose}
              className="grid size-9 place-items-center rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Customer Auth Button */}
          <div className="mt-5 mb-2">
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 text-left transition hover:bg-gray-100"
            >
              <div className="grid size-9 place-items-center rounded-lg bg-[var(--sf-primary)] text-white">
                <User className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-gray-900 truncate">
                  {user ? user.name : "Tài khoản khách hàng"}
                </p>
                <p className="text-[11px] text-[var(--sf-primary)] font-medium">
                  {user ? `SĐT: ${user.phone}` : "Đăng ký / Đăng nhập ngay"}
                </p>
              </div>
            </button>
          </div>

          <nav className="mt-4 grid text-sm font-bold text-gray-700">
            <button
              className="border-b border-gray-100 py-3.5 text-left hover:text-[var(--sf-primary)]"
              onClick={() => {
                onClose();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Trang chủ
            </button>
            <button
              className="border-b border-gray-100 py-3.5 text-left hover:text-[var(--sf-primary)]"
              onClick={() => {
                onClose();
                onScrollToProducts();
              }}
            >
              Tất cả sản phẩm
            </button>
            {store.phone_number && (
              <a
                className="flex items-center gap-2 border-b border-gray-100 py-3.5 text-left text-emerald-600 font-bold"
                href={`tel:${store.phone_number}`}
              >
                <Phone className="size-4" /> Gọi điện: {store.phone_number}
              </a>
            )}
          </nav>
        </div>

        <div className="pt-4 border-t text-center text-xs text-gray-400">
          <p>{store.name} · Online Store</p>
        </div>
      </div>
    </div>
  );
}
