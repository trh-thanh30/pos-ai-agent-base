"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
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
import { EditorialTemplate } from "../../../features/storefront/runtime/templates/editorial-template";
import { MarketTemplate } from "../../../features/storefront/runtime/templates/market-template";
import { SpecialistTemplate } from "../../../features/storefront/runtime/templates/specialist-template";
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
  products,
}: StorefrontClientProps) {
  const config = normalizeStorefrontConfig(store.retail_config);
  const theme = createStorefrontTheme(config);
  const [cart, setCart] = useState<StorefrontCartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
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
  ) => {
    setCart((current) => {
      const itemIndex = current.findIndex(
        (item) =>
          item.product.id === product.id && item.variant.id === variant.id,
      );
      if (itemIndex === -1) {
        return [...current, { product, variant, quantity: 1 }];
      }
      return current.map((item, index) =>
        index === itemIndex ? { ...item, quantity: item.quantity + 1 } : item,
      );
    });
    setVariantProduct(null);
    setCartOpen(true);
  };

  const handleAddProduct = (product: StorefrontProduct) => {
    const variants = product.variant || [];
    if (variants.length > 1) {
      setVariantProduct(product);
      setSelectedVariantId(variants[0].id);
      return;
    }
    addVariantToCart(product, getProductVariant(product));
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
      paymentMethod: config.checkout.allow_cod ? "cod" : "bank_transfer",
    });
    setCheckoutError("");
    setCreatedPayment(null);
  };

  const scrollToProducts = () =>
    document
      .getElementById("products")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

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
    onSearchChange: setSearchTerm,
    onAddProduct: handleAddProduct,
    onScrollToProducts: scrollToProducts,
  };

  return (
    <div
      style={theme.style}
      className="min-h-screen bg-[var(--sf-bg)] text-[var(--sf-text)]"
    >
      {config.announcement.enabled && config.announcement.text && (
        <div className="bg-[var(--sf-accent)] px-4 py-2 text-center text-xs font-bold text-white">
          {config.announcement.text}
        </div>
      )}

      <StorefrontHeader
        store={store}
        theme={theme}
        cartCount={cartCount}
        onOpenMenu={() => setMobileMenuOpen(true)}
        onOpenCart={() => setCartOpen(true)}
        onScrollToProducts={scrollToProducts}
      />

      {config.template_id === "editorial" ? (
        <EditorialTemplate {...templateProps} />
      ) : config.template_id === "specialist" ? (
        <SpecialistTemplate {...templateProps} />
      ) : (
        <MarketTemplate {...templateProps} />
      )}

      <StorefrontFooter
        store={store}
        config={config}
        headingFont={theme.headingFont}
      />

      <MobileMenu
        open={mobileMenuOpen}
        store={store}
        onClose={() => setMobileMenuOpen(false)}
        onScrollToProducts={scrollToProducts}
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
