"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useEffect, useRef, useMemo } from "react";
import { Search, X, Clock, TrendingUp, ChevronRight } from "lucide-react";
import type {
  StorefrontProduct,
  StorefrontStore,
  StorefrontTheme,
} from "../types";
import {
  formatCurrency,
  FALLBACK_PRODUCT_IMAGE,
  getProductVariant,
} from "../utils";

interface SearchDropdownProps {
  store: StorefrontStore;
  products: StorefrontProduct[];
  theme: StorefrontTheme;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  onSelectProduct: (product: StorefrontProduct) => void;
  onExecuteSearch: (query: string) => void;
}

const DEFAULT_POPULAR_KEYWORDS = [
  "Trà Ô Long",
  "Sữa Yến Mạch",
  "Bánh Heo Nướng",
  "Xá Xị Zero",
  "Nước Giặt Comfort",
  "Ahmad Tea",
];

export function StorefrontSearchDropdown({
  store,
  products,
  theme: _theme,
  searchTerm,
  onSearchChange,
  onSelectProduct,
  onExecuteSearch,
}: SearchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(searchTerm);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const storageKey = `sf_recent_searches_${store.subdomain || "default"}`;

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, [storageKey]);

  // Debounce search query (280ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchTerm);
    }, 280);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Save term to recent searches
  const saveSearchTerm = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const updated = [
      trimmed,
      ...recentSearches.filter(
        (s) => s.toLowerCase() !== trimmed.toLowerCase(),
      ),
    ].slice(0, 8);
    setRecentSearches(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const removeRecentTerm = (termToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== termToRemove);
    setRecentSearches(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const clearAllRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Ignore
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter matching products based on debounced query
  const searchResults = useMemo(() => {
    const query = debouncedQuery.trim().toLowerCase();
    if (!query) return [];
    return products
      .filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(query);
        const descMatch = p.description?.toLowerCase().includes(query);
        const catMatch = p.categories?.some((c) =>
          c.name.toLowerCase().includes(query),
        );
        return nameMatch || descMatch || catMatch;
      })
      .slice(0, 6);
  }, [products, debouncedQuery]);

  // Generate popular search tags dynamically or fallback
  const popularKeywords = useMemo(() => {
    if (products.length > 0) {
      const names = products.slice(0, 6).map((p) => p.name);
      return names.length >= 4 ? names : DEFAULT_POPULAR_KEYWORDS;
    }
    return DEFAULT_POPULAR_KEYWORDS;
  }, [products]);

  const handleSelectKeyword = (keyword: string) => {
    onSearchChange(keyword);
    saveSearchTerm(keyword);
    onExecuteSearch(keyword);
    setIsOpen(false);
  };

  const handleSelectProductItem = (product: StorefrontProduct) => {
    saveSearchTerm(product.name);
    onSelectProduct(product);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (searchTerm.trim()) {
        saveSearchTerm(searchTerm.trim());
        onExecuteSearch(searchTerm.trim());
        setIsOpen(false);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-400 pointer-events-none transition-colors group-focus-within:text-[var(--sf-primary)]" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onSearchChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Tìm sản phẩm, thương hiệu..."
          className="w-full border-0 bg-white py-3 pl-10 pr-9 text-xs text-[#262626] outline-none placeholder:text-[#a0a0a0] sm:text-sm"
        />
        {searchTerm ? (
          <button
            type="button"
            onClick={() => {
              onSearchChange("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 grid size-5 -translate-y-1/2 place-items-center text-[#767676] hover:text-[var(--sf-primary)]"
            aria-label="Xóa văn bản"
          >
            <X className="size-3" />
          </button>
        ) : null}
      </div>

      {/* Dropdown Overlay */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[480px] min-w-[320px] overflow-y-auto border border-[#e5e5e2] bg-white p-4 shadow-2xl sm:min-w-[420px]">
          {/* Active Search Results Mode */}
          {debouncedQuery.trim() ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2 text-xs font-semibold text-gray-500">
                <span>Gợi ý kết quả ({searchResults.length})</span>
                <span className="text-[11px] font-bold text-[var(--sf-primary)]">
                  Nhấn Enter để tìm full
                </span>
              </div>

              {searchResults.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {searchResults.map((product) => {
                    const variant = getProductVariant(product);
                    return (
                      <div
                        key={product.id}
                        onClick={() => handleSelectProductItem(product)}
                        className="group flex cursor-pointer items-center gap-3 px-2 py-2.5 transition hover:bg-[#f5f5f3]"
                      >
                        <img
                          src={product.image_url || FALLBACK_PRODUCT_IMAGE}
                          alt={product.name}
                          className="size-11 shrink-0 border border-gray-100 bg-gray-50 object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs sm:text-sm font-semibold text-gray-800 group-hover:text-[var(--sf-primary)] transition-colors">
                            {product.name}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate">
                            {product.categories?.[0]?.name || "Sản phẩm"}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-[var(--sf-primary)]">
                            {formatCurrency(variant.price)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-gray-500">
                  Không tìm thấy sản phẩm khớp với &quot;{debouncedQuery}&quot;
                </div>
              )}

              {/* View all results button */}
              <button
                type="button"
                onClick={() => {
                  saveSearchTerm(debouncedQuery);
                  onExecuteSearch(debouncedQuery);
                  setIsOpen(false);
                }}
                className="mt-2 flex w-full items-center justify-center gap-1.5 bg-[var(--sf-primary)] py-3 text-xs font-bold text-white transition hover:opacity-90"
              >
                <span>Xem tất cả kết quả cho &quot;{debouncedQuery}&quot;</span>
                <ChevronRight className="size-4" />
              </button>
            </div>
          ) : (
            /* Default Mode: Recent Searches & Popular Keywords */
            <div className="space-y-5">
              {/* 1. Recent Searches (Lịch sử tìm kiếm) */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="mb-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--sf-primary)]">
                      <Clock className="size-3.5" />
                      <span>Recent Searches</span>
                    </div>
                    <button
                      type="button"
                      onClick={clearAllRecent}
                      className="text-[11px] font-semibold text-[var(--sf-primary)] hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <span
                        key={term}
                        onClick={() => handleSelectKeyword(term)}
                        className="inline-flex cursor-pointer items-center gap-1.5 border border-[#d8d8d5] px-3 py-1 text-xs text-gray-700 transition hover:border-[var(--sf-primary)]"
                      >
                        <span className="truncate max-w-[140px] sm:max-w-[200px]">
                          {term}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => removeRecentTerm(term, e)}
                          className="text-gray-400 hover:text-[var(--sf-primary)]"
                          aria-label="Xóa từ khóa"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Popular Right Now (Xu hướng tìm kiếm) */}
              <div>
                <div className="mb-2.5 flex items-center gap-1.5 text-xs font-bold text-[var(--sf-primary)]">
                  <TrendingUp className="size-3.5" />
                  <span>Popular Right Now</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularKeywords.map((keyword) => (
                    <button
                      key={keyword}
                      type="button"
                      onClick={() => handleSelectKeyword(keyword)}
                      className="cursor-pointer border border-[#d8d8d5] bg-white px-3.5 py-1.5 text-xs font-medium text-gray-700 transition hover:border-[var(--sf-primary)] hover:text-[var(--sf-primary)]"
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
