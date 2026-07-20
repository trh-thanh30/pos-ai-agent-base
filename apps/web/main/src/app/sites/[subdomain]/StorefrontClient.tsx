"use client";
import React, { useState, useMemo } from "react";
import {
  ShoppingBag,
  Search,
  Phone,
  MapPin,
  X,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  ExternalLink,
  Facebook,
  Info,
} from "lucide-react";

export function formatCurrency(value: number | string) {
  const num = typeof value === "number" ? value : parseFloat(value || "0");
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(num);
}

interface VariantStock {
  onHand: number;
}

interface Variant {
  id: string;
  name: string;
  price: number;
  sku: string;
  variant_stocks?: VariantStock[];
}

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  categories?: Category[];
  variant?: Variant[];
}

interface StorePayment {
  id: string;
  bank_code: string;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  bank_qr_image_url: string | null;
  note: string | null;
}

interface Store {
  id: string;
  name: string;
  description: string | null;
  phone_number: string | null;
  city: string | null;
  state: string | null;
  address: string | null;
  business_hour: string | null;
  retail_config?: {
    enabled?: boolean;
    template_id?: string;
    primary_color?: string;
    logo_url?: string;
    banner_url?: string;
    facebook_url?: string;
    tiktok_url?: string;
  };
  store_payment?: StorePayment[];
}

interface StorefrontClientProps {
  store: Store;
  products: Product[];
}

interface CartItem {
  product: Product;
  variant: Variant | null;
  quantity: number;
}

export default function StorefrontClient({
  store,
  products,
}: StorefrontClientProps) {
  // Config variables
  const config = store.retail_config || {};
  const template = config.template_id || "classic";
  const primaryColor = config.primary_color || "#2563eb";
  const logo = config.logo_url || "/logo.png";
  const banner =
    config.banner_url ||
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80";

  // Shopping States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Checkout form
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [orderCode, setOrderCode] = useState("");

  // Extract unique categories
  const categoriesList = useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.categories && p.categories.length > 0) {
        p.categories.forEach((c) => cats.add(c.name));
      }
    });
    return Array.from(cats);
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description &&
          p.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCat =
        selectedCategory === "all" ||
        (p.categories && p.categories.some((c) => c.name === selectedCategory));

      return matchSearch && matchCat;
    });
  }, [products, searchTerm, selectedCategory]);

  // Cart operations
  const addToCart = (product: Product, variant: Variant | null = null) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          (!variant || item.variant?.id === variant.id),
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [...prev, { product, variant, quantity: 1 }];
      }
    });
  };

  const updateCartQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((_, i) => i !== index));
      return;
    }
    setCart((prev) => {
      const updated = [...prev];
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = item.variant ? item.variant.price : item.product.price;
      return sum + price * item.quantity;
    }, 0);
  }, [cart]);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) return;

    // Generate mock order code
    const code = "DH" + Math.floor(100000 + Math.random() * 900000);
    setOrderCode(code);
    setCheckoutSuccess(true);
  };

  const closeCheckout = () => {
    setCheckoutOpen(false);
    setCheckoutSuccess(false);
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerNote("");
  };

  // Construct VietQR Payment Details
  const activePayment =
    store.store_payment && store.store_payment.length > 0
      ? store.store_payment[0]
      : null;

  const vietQrUrl = useMemo(() => {
    if (!activePayment) return "";
    const desc = `Thanh toan ${orderCode}`;
    return `https://img.vietqr.io/image/${activePayment.bank_code}-${activePayment.bank_account_number}-compact2.png?amount=${cartTotal}&addInfo=${encodeURIComponent(desc)}&accountName=${encodeURIComponent(activePayment.bank_account_name)}`;
  }, [activePayment, cartTotal, orderCode]);

  // Layout template rendering
  const renderStorefrontContent = () => {
    switch (template) {
      case "ecommerce":
        return (
          <div className="space-y-12">
            {/* Banner Hero */}
            <div className="relative h-[320px] rounded-2xl overflow-hidden bg-gray-900 flex items-center justify-center text-center px-4">
              <img
                src={banner}
                alt={store.name}
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
              <div className="relative z-10 text-white space-y-4 max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-md">
                  {store.name}
                </h2>
                <p className="text-gray-200 text-base md:text-lg max-w-lg mx-auto font-medium drop-shadow-sm">
                  {store.description ||
                    "Mua sắm các sản phẩm cao cấp, chính hãng với giá tốt nhất ngay hôm nay!"}
                </p>
                <div className="flex gap-4 justify-center pt-2">
                  <button
                    onClick={() => {
                      const el = document.getElementById("products-section");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    style={{ backgroundColor: primaryColor }}
                    className="px-6 py-2.5 rounded-full text-white font-semibold shadow hover:brightness-105 transition-all"
                  >
                    Xem sản phẩm
                  </button>
                </div>
              </div>
            </div>

            {/* Filter & Grid */}
            <div id="products-section" className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                      selectedCategory === "all"
                        ? "text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    style={
                      selectedCategory === "all"
                        ? { backgroundColor: primaryColor }
                        : {}
                    }
                  >
                    Tất cả
                  </button>
                  {categoriesList.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                        selectedCategory === cat
                          ? "text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      style={
                        selectedCategory === cat
                          ? { backgroundColor: primaryColor }
                          : {}
                      }
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 border rounded-full text-sm w-full outline-none focus:ring-1"
                    style={
                      { "--tw-ring-color": primaryColor } as React.CSSProperties
                    }
                  />
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-xl border">
                  Không tìm thấy sản phẩm nào phù hợp.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="group border border-gray-100 rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div className="h-48 bg-gray-50 relative overflow-hidden">
                          <img
                            src={
                              prod.image_url ||
                              "https://images.unsplash.com/photo-1546213290-e1b492ab3eee?w=300"
                            }
                            alt={prod.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-4 space-y-1">
                          <h3 className="font-semibold text-gray-800 text-base line-clamp-1 group-hover:text-pos-blue-600 transition-colors">
                            {prod.name}
                          </h3>
                          <p className="text-gray-500 text-xs line-clamp-2 min-h-[32px] leading-relaxed">
                            {prod.description || "Không có mô tả sản phẩm."}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 pt-0 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900 text-base">
                            {formatCurrency(prod.price)}
                          </span>
                        </div>
                        <button
                          onClick={() => addToCart(prod)}
                          style={{ backgroundColor: primaryColor }}
                          className="w-full py-2 rounded-lg text-white font-semibold text-sm flex items-center justify-center gap-1.5 shadow hover:brightness-105 transition-all"
                        >
                          <Plus size={16} /> Thêm giỏ hàng
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case "restaurant":
        return (
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
            {/* Left sticky menu */}
            <div className="hidden md:block space-y-3 sticky top-24 self-start">
              <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider px-3">
                Danh mục
              </h3>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    selectedCategory === "all"
                      ? "bg-gray-100 text-gray-900 border-l-4"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                  style={
                    selectedCategory === "all"
                      ? { borderLeftColor: primaryColor }
                      : {}
                  }
                >
                  Tất cả thực đơn
                </button>
                {categoriesList.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      selectedCategory === cat
                        ? "bg-gray-100 text-gray-900 border-l-4"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    style={
                      selectedCategory === cat
                        ? { borderLeftColor: primaryColor }
                        : {}
                    }
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Category Navigation */}
            <div className="md:hidden flex overflow-x-auto gap-2 pb-2 shrink-0 no-scrollbar">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                  selectedCategory === "all"
                    ? "text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
                style={
                  selectedCategory === "all"
                    ? { backgroundColor: primaryColor }
                    : {}
                }
              >
                Tất cả
              </button>
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                    selectedCategory === cat
                      ? "text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                  style={
                    selectedCategory === cat
                      ? { backgroundColor: primaryColor }
                      : {}
                  }
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Right Food Items */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <h2 className="font-bold text-gray-800 text-xl">
                  Thực đơn đặt món
                </h2>
                <div className="relative w-48 sm:w-64">
                  <Search className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm món..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-1.5 border rounded-full text-xs w-full outline-none focus:ring-1"
                    style={
                      { "--tw-ring-color": primaryColor } as React.CSSProperties
                    }
                  />
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-xl border">
                  Hôm nay chưa có món này, vui lòng chọn món khác.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className="border border-gray-100 bg-white p-3 rounded-xl flex gap-4 hover:shadow-md transition-all duration-300 justify-between items-center"
                    >
                      <div className="flex gap-3 items-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                          <img
                            src={
                              prod.image_url ||
                              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150"
                            }
                            alt={prod.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-gray-800 text-sm sm:text-base">
                            {prod.name}
                          </h3>
                          <p className="text-gray-500 text-xs line-clamp-2 max-w-md">
                            {prod.description || "Không có mô tả chi tiết."}
                          </p>
                          <p className="font-bold text-gray-900 text-sm">
                            {formatCurrency(prod.price)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => addToCart(prod)}
                        style={{ backgroundColor: primaryColor }}
                        className="p-2 rounded-full text-white shadow hover:brightness-105 transition-all shrink-0"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case "classic":
      default:
        return (
          <div className="space-y-8">
            {/* Header info */}
            <div className="border border-gray-100 bg-white rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-full border bg-gray-50 flex items-center justify-center p-2 shrink-0">
                  <img
                    src={logo}
                    alt={store.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {store.name}
                  </h1>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Phone size={14} />{" "}
                      {store.phone_number || "Chưa cập nhật hotline"}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />{" "}
                      {store.address || "Chưa cập nhật địa chỉ"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Mở cửa
                </span>
                <span className="text-sm font-bold text-gray-700">
                  {store.business_hour || "08:00 - 22:00"}
                </span>
              </div>
            </div>

            {/* List & Search */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
              {/* Product Grid */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <h2 className="font-bold text-gray-800 text-lg">
                    Danh sách sản phẩm
                  </h2>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Tìm sản phẩm..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-1.5 border rounded-lg text-sm w-full outline-none focus:ring-1"
                      style={
                        {
                          "--tw-ring-color": primaryColor,
                        } as React.CSSProperties
                      }
                    />
                  </div>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-xl border">
                    Cửa hàng chưa cập nhật sản phẩm.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {filteredProducts.map((prod) => (
                      <div
                        key={prod.id}
                        className="border bg-white rounded-lg p-3 hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="h-36 bg-gray-50 rounded-md overflow-hidden relative">
                            <img
                              src={
                                prod.image_url ||
                                "https://images.unsplash.com/photo-1546213290-e1b492ab3eee?w=200"
                              }
                              alt={prod.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="mt-3 space-y-1">
                            <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">
                              {prod.name}
                            </h3>
                            <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed min-h-[32px]">
                              {prod.description || "Cửa hàng nexpos"}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="font-bold text-gray-900 text-sm">
                            {formatCurrency(prod.price)}
                          </span>
                          <button
                            onClick={() => addToCart(prod)}
                            style={{ backgroundColor: primaryColor }}
                            className="p-1.5 rounded-full text-white shadow hover:brightness-105 transition-all"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Side Categories list */}
              <div className="hidden lg:block space-y-4">
                <div className="bg-white border rounded-xl p-5 space-y-3">
                  <h3 className="font-bold text-gray-800 text-sm">
                    Danh mục hàng hóa
                  </h3>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        selectedCategory === "all"
                          ? "bg-gray-50 text-pos-blue-600"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      Tất cả
                    </button>
                    {categoriesList.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                          selectedCategory === cat
                            ? "bg-gray-50 text-pos-blue-600"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt={store.name}
              className="h-8 w-8 rounded-full object-contain"
            />
            <h1 className="font-bold text-gray-800 text-lg md:text-xl tracking-tight">
              {store.name}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {config.facebook_url && (
              <a
                href={config.facebook_url}
                target="_blank"
                rel="noreferrer"
                className="text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Facebook size={20} />
              </a>
            )}

            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2.5 rounded-full border hover:bg-gray-50 transition-all flex items-center justify-center"
            >
              <ShoppingBag size={20} className="text-gray-700" />
              {cart.length > 0 && (
                <span
                  style={{ backgroundColor: primaryColor }}
                  className="absolute -top-1 -right-1 w-5 h-5 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white shadow"
                >
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        {renderStorefrontContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-8 mt-16 text-center text-sm text-gray-500">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-gray-700">
            © {new Date().getFullYear()} {store.name}. Bảo lưu mọi quyền.
          </p>
          <p className="flex items-center justify-center gap-2 text-xs">
            <span>Powered by</span>
            <span className="font-bold text-pos-blue-600 flex items-center gap-0.5">
              NexPOS <ExternalLink size={10} />
            </span>
          </p>
        </div>
      </footer>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity"
            onClick={() => setCartOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col justify-between">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                <ShoppingBag size={20} style={{ color: primaryColor }} />
                <span>Giỏ hàng của bạn</span>
              </h2>
              <button
                onClick={() => setCartOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-20 text-gray-400 space-y-2">
                  <ShoppingBag size={48} className="mx-auto text-gray-300" />
                  <p className="font-semibold">Giỏ hàng của bạn đang trống</p>
                </div>
              ) : (
                cart.map((item, index) => {
                  const price = item.variant
                    ? item.variant.price
                    : item.product.price;
                  return (
                    <div
                      key={index}
                      className="flex gap-4 border-b pb-4 items-start"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        <img
                          src={
                            item.product.image_url ||
                            "https://images.unsplash.com/photo-1546213290-e1b492ab3eee?w=150"
                          }
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="font-semibold text-gray-800 text-sm line-clamp-1">
                          {item.product.name}
                        </h4>
                        {item.variant && (
                          <p className="text-xs text-gray-400 font-medium">
                            Phân loại: {item.variant.name}
                          </p>
                        )}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-sm font-bold text-gray-900">
                            {formatCurrency(price)}
                          </span>
                          <div className="flex items-center gap-2 border rounded-lg px-2 py-0.5">
                            <button
                              onClick={() =>
                                updateCartQty(index, item.quantity - 1)
                              }
                              className="text-gray-500 hover:text-gray-800"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-xs font-semibold min-w-[16px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateCartQty(index, item.quantity + 1)
                              }
                              className="text-gray-500 hover:text-gray-800"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="text-gray-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-4 border-t bg-gray-50 space-y-4">
                <div className="flex justify-between items-center text-base font-bold text-gray-800">
                  <span>Tổng tiền:</span>
                  <span
                    className="text-lg text-gray-900"
                    style={{ color: primaryColor }}
                  >
                    {formatCurrency(cartTotal)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setCartOpen(false);
                    setCheckoutOpen(true);
                  }}
                  style={{ backgroundColor: primaryColor }}
                  className="w-full py-3 rounded-xl text-white font-bold tracking-wide hover:brightness-105 shadow transition-all"
                >
                  Tiến hành thanh toán
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            onClick={() => !checkoutSuccess && setCheckoutOpen(false)}
          />
          <div className="relative max-w-lg w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-lg">
                {checkoutSuccess
                  ? "Đơn hàng đã đặt thành công!"
                  : "Thông tin đặt hàng"}
              </h3>
              <button
                onClick={closeCheckout}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {!checkoutSuccess ? (
                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-1"
                      style={
                        {
                          "--tw-ring-color": primaryColor,
                        } as React.CSSProperties
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="09XXXXXXXX"
                      className="w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-1"
                      style={
                        {
                          "--tw-ring-color": primaryColor,
                        } as React.CSSProperties
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">
                      Ghi chú đơn hàng
                    </label>
                    <textarea
                      value={customerNote}
                      onChange={(e) => setCustomerNote(e.target.value)}
                      placeholder="Yêu cầu giao hàng nhanh, lưu ý thời gian..."
                      rows={3}
                      className="w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-1"
                      style={
                        {
                          "--tw-ring-color": primaryColor,
                        } as React.CSSProperties
                      }
                    />
                  </div>

                  <div className="border bg-gray-50 rounded-xl p-4 space-y-2 mt-4 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Tổng tiền hàng:</span>
                      <span className="font-semibold text-gray-800">
                        {formatCurrency(cartTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-base text-gray-900 border-t pt-2 mt-2">
                      <span>Cần thanh toán:</span>
                      <span style={{ color: primaryColor }}>
                        {formatCurrency(cartTotal)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    style={{ backgroundColor: primaryColor }}
                    className="w-full py-3 rounded-xl text-white font-bold hover:brightness-105 shadow transition-all mt-4"
                  >
                    Xác nhận đặt hàng
                  </button>
                </form>
              ) : (
                <div className="text-center space-y-6">
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle size={56} className="text-emerald-500" />
                    <h4 className="text-xl font-bold text-gray-800">
                      Đặt hàng thành công!
                    </h4>
                    <p className="text-sm text-gray-500">
                      Mã đơn hàng của bạn là{" "}
                      <span className="font-bold text-gray-800">
                        {orderCode}
                      </span>
                    </p>
                  </div>

                  {activePayment && vietQrUrl ? (
                    <div className="space-y-4 bg-gray-50 p-6 rounded-xl border flex flex-col items-center">
                      <div className="text-sm font-semibold text-gray-700">
                        Chuyển khoản thanh toán qua QR
                      </div>
                      <div className="bg-white p-3 border rounded-lg shadow-sm">
                        <img
                          src={vietQrUrl}
                          alt="VietQR Payment"
                          className="w-56 h-56 object-contain"
                        />
                      </div>
                      <div className="text-center text-xs text-gray-500 space-y-1">
                        <p>
                          Chủ tài khoản:{" "}
                          <span className="font-bold text-gray-700">
                            {activePayment.bank_account_name}
                          </span>
                        </p>
                        <p>
                          Số tài khoản:{" "}
                          <span className="font-bold text-gray-700">
                            {activePayment.bank_account_number}
                          </span>{" "}
                          ({activePayment.bank_name})
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700 flex gap-3 text-left">
                      <Info size={20} className="shrink-0" />
                      <div>
                        <p className="font-bold">
                          Thanh toán khi nhận hàng (COD)
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Cửa hàng chưa cấu hình tài khoản ngân hàng. Đơn hàng
                          của bạn sẽ được xử lý và giao nhận thanh toán bằng
                          tiền mặt khi giao hàng.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-gray-400 leading-relaxed border-t pt-4">
                    Nhân viên bán hàng sẽ liên hệ với bạn qua số điện thoại{" "}
                    <span className="font-bold text-gray-700">
                      {customerPhone}
                    </span>{" "}
                    để xác nhận đơn hàng sớm nhất.
                  </div>

                  <button
                    onClick={closeCheckout}
                    style={{ backgroundColor: primaryColor }}
                    className="w-full py-2.5 rounded-xl text-white font-semibold hover:brightness-105 transition-all"
                  >
                    Hoàn thành
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
