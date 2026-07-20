"use client";

import type { ReactNode } from "react";
import { PackageCheck, Search } from "lucide-react";
import type { StorefrontCategory } from "../types";

interface SearchControlProps {
  enabled: boolean;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

export function SearchControl({
  enabled,
  value,
  placeholder = "Tìm kiếm sản phẩm",
  onChange,
}: SearchControlProps) {
  if (!enabled) return null;
  return (
    <label className="relative block w-full">
      <span className="sr-only">{placeholder}</span>
      <Search
        aria-hidden="true"
        className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-black/45"
      />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full border border-black/15 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[var(--sf-primary)] focus:ring-2 focus:ring-[var(--sf-primary)]/15"
        style={{ borderRadius: "var(--sf-radius)" }}
      />
    </label>
  );
}

interface CategoryControlsProps {
  enabled: boolean;
  categories: StorefrontCategory[];
  selectedCategory: string;
  compact?: boolean;
  onChange: (categoryId: string) => void;
}

export function CategoryControls({
  enabled,
  categories,
  selectedCategory,
  compact = false,
  onChange,
}: CategoryControlsProps) {
  if (!enabled) return null;
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
      <CategoryButton
        active={selectedCategory === "all"}
        compact={compact}
        onClick={() => onChange("all")}
      >
        Tất cả
      </CategoryButton>
      {categories.map((category) => (
        <CategoryButton
          key={category.id}
          active={selectedCategory === category.id}
          compact={compact}
          onClick={() => onChange(category.id)}
        >
          {category.name}
        </CategoryButton>
      ))}
    </div>
  );
}

function CategoryButton({
  active,
  compact,
  onClick,
  children,
}: {
  active: boolean;
  compact: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 border px-4 py-2 text-xs font-bold transition ${
        active
          ? "border-[var(--sf-primary)] bg-[var(--sf-primary)] text-white"
          : "border-black/12 bg-white text-black/55 hover:border-[var(--sf-primary)]"
      } ${compact ? "py-1.5" : ""}`}
      style={{ borderRadius: "var(--sf-radius)" }}
    >
      {children}
    </button>
  );
}

export function CatalogEmptyState() {
  return (
    <div className="border border-dashed border-black/20 bg-white px-6 py-20 text-center">
      <PackageCheck className="mx-auto mb-4 size-8 text-black/30" />
      <h3 className="font-semibold text-[var(--sf-text)]">
        Chưa tìm thấy sản phẩm phù hợp
      </h3>
      <p className="mt-1 text-sm text-black/50">
        Thử từ khóa khác hoặc chọn lại danh mục.
      </p>
    </div>
  );
}
