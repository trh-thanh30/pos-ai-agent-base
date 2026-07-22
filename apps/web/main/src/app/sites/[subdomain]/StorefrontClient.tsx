"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { normalizeStorefrontConfig } from "../../../features/storefront/config";
import { CartDrawer } from "../../../features/storefront/runtime/commerce/cart-drawer";
import {
  CheckoutDialog,
  type CheckoutFormState,
} from "../../../features/storefront/runtime/commerce/checkout-dialog";
import { VariantDialog } from "../../../features/storefront/runtime/commerce/variant-dialog";
import { MobileMenu } from "../../../features/storefront/runtime/components/mobile-menu";
import { StorefrontFooter } from "../../../features/storefront/runtime/components/storefront-footer";
import { StorefrontHeader } from "../../../features/storefront/runtime/components/storefront-header";
import { createStorefrontTheme } from "../../../features/storefront/runtime/theme";
import { OrebiTemplate } from "../../../features/storefront/runtime/templates/orebi-template";
import { ProductDetailView } from "../../../features/storefront/runtime/components/product-detail";
import { SearchResultsView } from "../../../features/storefront/runtime/components/search-results-view";
import { AllProductsView } from "../../../features/storefront/runtime/components/all-products-view";
import {
  StorefrontAuthDialog,
  type CustomerUser,
} from "../../../features/storefront/runtime/components/auth-dialog";
import type {
  StorefrontCartItem,
  StorefrontCategory,
  StorefrontPayment,
  StorefrontProduct,
  StorefrontStore,
  StorefrontTemplateProps,
  StorefrontVariant,
} from "../../../features/storefront/runtime/types";
import {
  getProductStock,
  getProductVariant,
} from "../../../features/storefront/runtime/utils";

export { formatCurrency } from "../../../features/storefront/runtime/utils";

interface StorefrontClientProps {
  store: StorefrontStore;
  products: StorefrontProduct[];
  initialPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  initialProductId?: string;
}

const EMPTY_CHECKOUT_FORM: CheckoutFormState = {
  customerName: "",
  customerPhone: "",
  customerAddress: "",
  customerNote: "",
  paymentMethod: "cod",
};

export default function StorefrontClient({
  store,
  products: initialProducts,
  initialPagination,
  initialProductId,
}: StorefrontClientProps) {
  const config = normalizeStorefrontConfig(store.retail_config);
  const theme = createStorefrontTheme(config);
  const [cart, setCart] = useState<StorefrontCartItem[]>([]);
  const [products, setProducts] =
    useState<StorefrontProduct[]>(initialProducts);
  const [pagination, setPagination] = useState(initialPagination);
  const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState("");
  const loadingMoreRef = useRef(false);
  const viewTransitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [viewChanging, setViewChanging] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] =
    useState<StorefrontProduct | null>(
      initialProductId
        ? initialProducts.find((product) => product.id === initialProductId) ||
            null
        : null,
    );
  const [viewMode, setViewMode] = useState<
    "home" | "search-result" | "product-detail" | "all-products"
  >(initialProductId ? "product-detail" : "home");
  const [authOpen, setAuthOpen] = useState(false);
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(null);
  const [variantProduct, setVariantProduct] =
    useState<StorefrontProduct | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutForm, setCheckoutForm] = useState<CheckoutFormState>({
    ...EMPTY_CHECKOUT_FORM,
    paymentMethod: config.checkout.allow_cod ? "cod" : "bank_transfer",
  });
  const [orderCode, setOrderCode] = useState("");
  const [createdPayment, setCreatedPayment] =
    useState<StorefrontPayment | null>(null);

  const hasMoreProducts = pagination.page < pagination.totalPages;

  const beginViewTransition = () => {
    setViewChanging(true);
    if (viewTransitionTimerRef.current)
      window.clearTimeout(viewTransitionTimerRef.current);
    viewTransitionTimerRef.current = window.setTimeout(
      () => setViewChanging(false),
      420,
    );
  };

  const loadMoreProducts = useCallback(async () => {
    if (loadingMoreRef.current || pagination.page >= pagination.totalPages)
      return;

    loadingMoreRef.current = true;
    setLoadingMoreProducts(true);
    setLoadMoreError("");
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
      const nextPage = pagination.page + 1;
      const response = await fetch(
        `${apiUrl}/stores/subdomain/${encodeURIComponent(store.subdomain)}?page=${nextPage}&limit=${pagination.limit}`,
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Không thể tải thêm sản phẩm.");
      }

      const nextProducts = (result.data?.products || []) as StorefrontProduct[];
      setProducts((current) => {
        const productMap = new Map(
          current.map((product) => [product.id, product]),
        );
        nextProducts.forEach((product) => productMap.set(product.id, product));
        return Array.from(productMap.values());
      });
      setPagination(result.data.pagination);
    } catch (error) {
      setLoadMoreError(
        error instanceof Error ? error.message : "Không thể tải thêm sản phẩm.",
      );
    } finally {
      loadingMoreRef.current = false;
      setLoadingMoreProducts(false);
    }
  }, [
    pagination.limit,
    pagination.page,
    pagination.totalPages,
    store.subdomain,
  ]);

  // Load saved customer auth from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("storefront_customer");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.name && parsed?.phone) {
          setCustomerUser(parsed);
          setCheckoutForm((prev) => ({
            ...prev,
            customerName: parsed.name,
            customerPhone: parsed.phone,
          }));
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  useEffect(
    () => () => {
      if (viewTransitionTimerRef.current)
        window.clearTimeout(viewTransitionTimerRef.current);
    },
    [],
  );

  // Check URL query for ?product=ID or ?search=QUERY
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const productId =
        initialProductId ||
        params.get("product") ||
        window.location.pathname.match(/^\/products\/([^/]+)\/?$/)?.[1];
      const searchQuery = params.get("search");
      const viewParam = params.get("view");

      if (productId) {
        const found = products.find((p) => p.id === productId);
        if (found) {
          setSelectedProduct(found);
          setViewMode("product-detail");
        }
      } else if (searchQuery) {
        setSearchTerm(searchQuery);
        setViewMode("search-result");
      } else if (viewParam === "all-products") {
        setViewMode("all-products");
      }
    } catch {
      // Ignore
    }
  }, [initialProductId, products]);

  const handleSelectProduct = (product: StorefrontProduct | null) => {
    beginViewTransition();
    setSelectedProduct(product);
    if (product) {
      setViewMode("product-detail");
    } else {
      setViewMode("home");
    }
    try {
      const url = new URL(window.location.href);
      if (product) {
        url.pathname = `/products/${encodeURIComponent(product.id)}`;
        url.searchParams.delete("product");
        url.searchParams.delete("search");
        url.searchParams.delete("view");
      } else {
        url.pathname = "/";
        url.searchParams.delete("product");
      }
      window.history.pushState({}, "", url.toString());
    } catch {
      // Ignore
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleExecuteSearch = (query: string) => {
    beginViewTransition();
    setSearchTerm(query);
    setSelectedProduct(null);
    setViewMode("search-result");
    try {
      const url = new URL(window.location.href);
      url.pathname = "/";
      url.searchParams.set("search", query);
      url.searchParams.delete("product");
      url.searchParams.delete("view");
      window.history.pushState({}, "", url.toString());
    } catch {
      // Ignore
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGoHome = () => {
    beginViewTransition();
    setSelectedProduct(null);
    setSearchTerm("");
    setSelectedCategory("all");
    setViewMode("home");
    try {
      const url = new URL(window.location.href);
      url.pathname = "/";
      url.searchParams.delete("product");
      url.searchParams.delete("search");
      url.searchParams.delete("view");
      window.history.pushState({}, "", url.toString());
    } catch {
      // Ignore
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenAllProducts = () => {
    beginViewTransition();
    setSelectedProduct(null);
    setSearchTerm("");
    setViewMode("all-products");
    try {
      const url = new URL(window.location.href);
      url.pathname = "/";
      url.searchParams.set("view", "all-products");
      url.searchParams.delete("product");
      url.searchParams.delete("search");
      window.history.pushState({}, "", url.toString());
    } catch {
      // Ignore
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoginSuccess = (user: CustomerUser) => {
    setCustomerUser(user);
    setCheckoutForm((prev) => ({
      ...prev,
      customerName: user.name,
      customerPhone: user.phone,
    }));
    try {
      localStorage.setItem("storefront_customer", JSON.stringify(user));
    } catch {
      // Ignore
    }
  };

  const handleLogout = () => {
    setCustomerUser(null);
    try {
      localStorage.removeItem("storefront_customer");
    } catch {
      // Ignore
    }
  };

  const categories = useMemo(() => {
    const entries = new Map<string, StorefrontCategory>();
    products.forEach((product) =>
      product.categories?.forEach((category) =>
        entries.set(category.id, category),
      ),
    );
    return Array.from(entries.values());
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase("vi");
    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLocaleLowerCase("vi").includes(query) ||
        product.description?.toLocaleLowerCase("vi").includes(query);
      const matchesCategory =
        selectedCategory === "all" ||
        product.categories?.some(
          (category) => category.id === selectedCategory,
        );
      const matchesStock =
        config.catalog.show_out_of_stock || getProductStock(product) > 0;
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [
    config.catalog.show_out_of_stock,
    products,
    searchTerm,
    selectedCategory,
  ]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce(
    (total, item) => total + item.variant.price * item.quantity,
    0,
  );

  const addVariantToCart = (
    product: StorefrontProduct,
    variant: StorefrontVariant,
    quantityToAdd = 1,
  ) => {
    setCart((current) => {
      const itemIndex = current.findIndex(
        (item) =>
          item.product.id === product.id && item.variant.id === variant.id,
      );
      if (itemIndex === -1) {
        return [...current, { product, variant, quantity: quantityToAdd }];
      }
      return current.map((item, index) =>
        index === itemIndex
          ? { ...item, quantity: item.quantity + quantityToAdd }
          : item,
      );
    });
    setVariantProduct(null);
    setCartOpen(true);
  };

  const handleAddProduct = (
    product: StorefrontProduct,
    variantId?: string,
    quantityToAdd = 1,
  ) => {
    const variants = product.variant || [];
    if (variantId) {
      const matchedVariant =
        variants.find((v) => v.id === variantId) || getProductVariant(product);
      addVariantToCart(product, matchedVariant, quantityToAdd);
      return;
    }
    if (variants.length > 1) {
      setVariantProduct(product);
      setSelectedVariantId(variants[0].id);
      return;
    }
    addVariantToCart(product, getProductVariant(product), quantityToAdd);
  };

  const handleCheckoutDirect = (
    product: StorefrontProduct,
    variantId: string,
    quantityToAdd = 1,
  ) => {
    handleAddProduct(product, variantId, quantityToAdd);
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) {
      setCart((current) =>
        current.filter((_, itemIndex) => itemIndex !== index),
      );
      return;
    }
    setCart((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, quantity } : item,
      ),
    );
  };

  const submitCheckout = async (event: FormEvent) => {
    event.preventDefault();
    if (
      !checkoutForm.customerName.trim() ||
      !checkoutForm.customerPhone.trim()
    ) {
      return;
    }
    if (
      config.checkout.require_address &&
      !checkoutForm.customerAddress.trim()
    ) {
      return;
    }

    setCheckoutSubmitting(true);
    setCheckoutError("");
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
      const response = await fetch(
        `${apiUrl}/stores/subdomain/${store.subdomain}/orders`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer_name: checkoutForm.customerName.trim(),
            customer_phone: checkoutForm.customerPhone.trim(),
            customer_address: checkoutForm.customerAddress.trim() || undefined,
            customer_note: checkoutForm.customerNote.trim() || undefined,
            payment_method: checkoutForm.paymentMethod,
            items: cart.map((item) => ({
              product_id: item.product.id,
              variant_id: item.variant.id,
              quantity: item.quantity,
            })),
          }),
        },
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Không thể tạo đơn hàng.");
      }
      setOrderCode(result.data.order.code);
      setCreatedPayment(result.data.payment || null);
      setCheckoutSuccess(true);
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Không thể tạo đơn hàng. Vui lòng thử lại.",
      );
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  const closeCheckout = () => {
    setCheckoutOpen(false);
    setCheckoutSuccess(false);
    setCart([]);
    setCheckoutForm({
      ...EMPTY_CHECKOUT_FORM,
      customerName: customerUser?.name || "",
      customerPhone: customerUser?.phone || "",
      paymentMethod: config.checkout.allow_cod ? "cod" : "bank_transfer",
    });
    setCheckoutError("");
    setCreatedPayment(null);
  };

  const scrollToProducts = () => {
    if (viewMode !== "home") {
      handleGoHome();
    } else {
      document
        .getElementById("products")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const templateProps: StorefrontTemplateProps = {
    config,
    store,
    products,
    filteredProducts,
    categories,
    selectedCategory,
    searchTerm,
    theme,
    onCategoryChange: setSelectedCategory,
    onSearchChange: (q) => {
      setSearchTerm(q);
    },
    onAddProduct: handleAddProduct,
    onSelectProduct: handleSelectProduct,
    onScrollToProducts: scrollToProducts,
  };

  return (
    <div
      style={theme.style}
      className="min-h-screen bg-[var(--sf-bg)] text-[var(--sf-text)]"
    >
      {config.announcement.enabled && config.announcement.text && (
        <div className="bg-[var(--sf-accent)] px-4 py-2 text-center text-xs font-bold text-white shadow-xs">
          {config.announcement.text}
        </div>
      )}

      {viewChanging && (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden bg-[var(--sf-primary)]/15">
          <span className="sf-loading-progress block h-full w-1/2 bg-[var(--sf-primary)]" />
        </div>
      )}

      {/* Header with Logo, Search Dropdown, Sub-Navbar, Cart, Auth */}
      <StorefrontHeader
        store={store}
        products={products}
        categories={config.home.show_categories ? categories : []}
        selectedCategory={selectedCategory}
        theme={theme}
        cartCount={cartCount}
        showSearch={config.catalog.show_search}
        searchTerm={searchTerm}
        user={customerUser}
        activeView={viewMode}
        onSearchChange={(q) => setSearchTerm(q)}
        onCategoryChange={(catId) => {
          setSelectedCategory(catId);
          handleOpenAllProducts();
        }}
        onSelectProduct={handleSelectProduct}
        onExecuteSearch={handleExecuteSearch}
        onOpenMenu={() => setMobileMenuOpen(true)}
        onOpenCart={() => setCartOpen(true)}
        onOpenAuth={() => setAuthOpen(true)}
        onGoHome={handleGoHome}
        onScrollToProducts={scrollToProducts}
        onOpenAllProducts={handleOpenAllProducts}
      />

      {/* View Switcher: Product Detail vs Search Results vs All Products Tab vs Home Landing Page */}
      <div
        key={`${viewMode}-${selectedProduct?.id || ""}`}
        className="sf-view-enter"
      >
        {viewMode === "product-detail" && selectedProduct ? (
          <ProductDetailView
            product={selectedProduct}
            allProducts={products}
            store={store}
            config={config}
            theme={theme}
            onAddProduct={handleAddProduct}
            onSelectProduct={handleSelectProduct}
            onBack={handleGoHome}
            onCheckoutDirect={handleCheckoutDirect}
          />
        ) : viewMode === "search-result" ? (
          <SearchResultsView
            searchTerm={searchTerm}
            store={store}
            products={products}
            categories={categories}
            config={config}
            theme={theme}
            onAddProduct={handleAddProduct}
            onSelectProduct={handleSelectProduct}
            onBackToHome={handleGoHome}
          />
        ) : viewMode === "all-products" ? (
          <AllProductsView
            store={store}
            products={products}
            categories={categories}
            selectedCategory={selectedCategory}
            config={config}
            theme={theme}
            onCategoryChange={setSelectedCategory}
            onAddProduct={handleAddProduct}
            onSelectProduct={handleSelectProduct}
            onBackToHome={handleGoHome}
            hasMore={hasMoreProducts}
            isLoadingMore={loadingMoreProducts}
            loadMoreError={loadMoreError}
            totalProducts={pagination.total}
            onLoadMore={loadMoreProducts}
          />
        ) : (
          <OrebiTemplate
            {...templateProps}
            onOpenAllProducts={handleOpenAllProducts}
          />
        )}
      </div>

      <StorefrontFooter
        store={store}
        config={config}
        headingFont={theme.headingFont}
      />

      <MobileMenu
        open={mobileMenuOpen}
        store={store}
        user={customerUser}
        onClose={() => setMobileMenuOpen(false)}
        onOpenAuth={() => setAuthOpen(true)}
        onScrollToProducts={scrollToProducts}
      />

      <StorefrontAuthDialog
        open={authOpen}
        theme={theme}
        user={customerUser}
        onClose={() => setAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />

      <VariantDialog
        product={variantProduct}
        selectedVariantId={selectedVariantId}
        config={config}
        onSelect={setSelectedVariantId}
        onAdd={addVariantToCart}
        onClose={() => setVariantProduct(null)}
      />

      <CartDrawer
        open={cartOpen}
        cart={cart}
        cartCount={cartCount}
        cartTotal={cartTotal}
        config={config}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={updateQuantity}
        onRemove={(index) =>
          setCart((current) =>
            current.filter((_, itemIndex) => itemIndex !== index),
          )
        }
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      <CheckoutDialog
        open={checkoutOpen}
        success={checkoutSuccess}
        submitting={checkoutSubmitting}
        error={checkoutError}
        orderCode={orderCode}
        cartTotal={cartTotal}
        config={config}
        store={store}
        payment={createdPayment}
        form={checkoutForm}
        onFormChange={setCheckoutForm}
        onSubmit={submitCheckout}
        onClose={closeCheckout}
        onDismiss={() => setCheckoutOpen(false)}
      />
    </div>
  );
}
