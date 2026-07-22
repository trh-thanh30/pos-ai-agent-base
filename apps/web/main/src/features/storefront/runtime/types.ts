import type { StorefrontConfig, StorefrontConfigInput } from "../config";
import type { CSSProperties } from "react";

export interface StorefrontVariantStock {
  onHand: number;
}

export interface StorefrontVariant {
  id: string;
  name: string;
  price: number;
  sku: string;
  variant_stocks?: StorefrontVariantStock[];
}

export interface StorefrontCategory {
  id: string;
  name: string;
}

export interface StorefrontProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  categories?: StorefrontCategory[];
  variant?: StorefrontVariant[];
}

export interface StorefrontPayment {
  id?: string;
  bank_code: string;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  bank_qr_image_url?: string | null;
  note?: string | null;
}

export interface StorefrontStore {
  id: string;
  subdomain: string;
  name: string;
  description: string | null;
  phone_number: string | null;
  city: string | null;
  state: string | null;
  address: string | null;
  business_hour: string | null;
  retail_config?: StorefrontConfigInput;
  payment_methods?: {
    bank_transfer?: boolean;
  };
}

export interface StorefrontCartItem {
  product: StorefrontProduct;
  variant: StorefrontVariant;
  quantity: number;
}

export interface StorefrontTheme {
  logo: string;
  banner: string;
  radius: string;
  headingFont: string;
  style: CSSProperties;
}

export interface StorefrontTemplateProps {
  config: StorefrontConfig;
  store: StorefrontStore;
  products: StorefrontProduct[];
  filteredProducts: StorefrontProduct[];
  categories: StorefrontCategory[];
  selectedCategory: string;
  searchTerm: string;
  theme: StorefrontTheme;
  onCategoryChange: (categoryId: string) => void;
  onSearchChange: (query: string) => void;
  onAddProduct: (product: StorefrontProduct) => void;
  onSelectProduct?: (product: StorefrontProduct) => void;
  onScrollToProducts: () => void;
}
