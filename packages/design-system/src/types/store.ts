export enum StoreRole {
  OWNER = "OWNER",
  MEMBER = "MEMBER",
}
export interface StoreOwner {
  id: string;
  username: string;
  email: string;
}

export interface StoreMemberUser {
  id: string;
  username: string;
  email: string;
}

export interface StoreMember {
  storeId: string;
  userId: string;
  role: StoreRole;
  name: string;
  total_order: string;
  email: string;
  createdAt: string; // ISO datetime
  user: StoreMemberUser;
}

export interface StoreCount {
  products: number;
  categories: number;
  customer: number;
  members: number;
}
export interface StorePayment {
  bank_qr_image_url: string;
}
export interface RetailConfig {
  schema_version?: 2;
  enabled?: boolean;
  template_id?:
    | "market"
    | "editorial"
    | "specialist"
    | "classic"
    | "ecommerce"
    | "restaurant";
  primary_color?: string;
  logo_url?: string;
  banner_url?: string;
  facebook_url?: string;
  tiktok_url?: string;
  brand?: {
    primary_color?: string;
    accent_color?: string;
    background_color?: string;
    text_color?: string;
    font_pair?: "modern" | "editorial" | "friendly";
    radius?: "sharp" | "soft" | "rounded";
    logo_url?: string;
    logo_asset_id?: string;
    banner_url?: string;
    banner_asset_id?: string;
  };
  announcement?: { enabled?: boolean; text?: string };
  home?: {
    hero_title?: string;
    hero_subtitle?: string;
    hero_cta_label?: string;
    show_hero?: boolean;
    show_categories?: boolean;
    show_featured_products?: boolean;
    featured_heading?: string;
  };
  catalog?: {
    show_search?: boolean;
    show_category_filter?: boolean;
    show_product_description?: boolean;
    show_stock_status?: boolean;
    show_out_of_stock?: boolean;
    quick_add?: boolean;
    image_ratio?: "square" | "portrait" | "landscape";
    products_per_page?: 24 | 36 | 48;
  };
  checkout?: {
    enabled?: boolean;
    allow_note?: boolean;
    require_address?: boolean;
    allow_cod?: boolean;
    allow_bank_transfer?: boolean;
    success_message?: string;
  };
  footer?: {
    show_contact?: boolean;
    show_business_hours?: boolean;
    show_powered_by?: boolean;
    policy_text?: string;
  };
  social?: {
    facebook_url?: string;
    instagram_url?: string;
    tiktok_url?: string;
    zalo_url?: string;
  };
  seo?: { title?: string; description?: string };
}
export interface Store {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  phone_number: string | null;
  address: string | null;
  business_hour: string | null;
  city: string | null;
  state: string | null;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
  owner: StoreOwner;
  members: StoreMember[] | null;
  qrPayment: string | null;
  _count: StoreCount;
  store_payment: StorePayment[];
  subdomain: string | null;
  retail_config: RetailConfig | null;
}

// Response từ API
export interface GetStoresResponse {
  success: boolean;
  meta: {
    timestamp: string;
    version: string;
  };
  data: Store[];
  message: string;
}
