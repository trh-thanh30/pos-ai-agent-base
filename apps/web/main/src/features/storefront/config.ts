export const STOREFRONT_TEMPLATE_IDS = [
  "market",
  "editorial",
  "specialist",
] as const;

export type StorefrontTemplateId = (typeof STOREFRONT_TEMPLATE_IDS)[number];
export type StorefrontFontPair = "modern" | "editorial" | "friendly";
export type StorefrontRadius = "sharp" | "soft" | "rounded";
export type StorefrontImageRatio = "square" | "portrait" | "landscape";

export interface StorefrontBrandConfig {
  primary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  font_pair: StorefrontFontPair;
  radius: StorefrontRadius;
  logo_url?: string;
  logo_asset_id?: string;
  banner_url?: string;
  banner_asset_id?: string;
}

export interface StorefrontAnnouncementConfig {
  enabled: boolean;
  text: string;
}

export interface StorefrontHomeConfig {
  hero_title: string;
  hero_subtitle: string;
  hero_cta_label: string;
  show_hero: boolean;
  show_categories: boolean;
  show_featured_products: boolean;
  featured_heading: string;
}

export interface StorefrontCatalogConfig {
  show_search: boolean;
  show_category_filter: boolean;
  show_product_description: boolean;
  show_stock_status: boolean;
  show_out_of_stock: boolean;
  quick_add: boolean;
  image_ratio: StorefrontImageRatio;
  products_per_page: 24 | 36 | 48;
}

export interface StorefrontCheckoutConfig {
  enabled: boolean;
  allow_note: boolean;
  require_address: boolean;
  allow_cod: boolean;
  allow_bank_transfer: boolean;
  success_message: string;
}

export interface StorefrontFooterConfig {
  show_contact: boolean;
  show_business_hours: boolean;
  show_powered_by: boolean;
  policy_text: string;
}

export interface StorefrontSocialConfig {
  facebook_url?: string;
  instagram_url?: string;
  tiktok_url?: string;
  zalo_url?: string;
}

export interface StorefrontSeoConfig {
  title?: string;
  description?: string;
}

export interface StorefrontConfig {
  schema_version: 2;
  enabled: boolean;
  template_id: StorefrontTemplateId;
  brand: StorefrontBrandConfig;
  announcement: StorefrontAnnouncementConfig;
  home: StorefrontHomeConfig;
  catalog: StorefrontCatalogConfig;
  checkout: StorefrontCheckoutConfig;
  footer: StorefrontFooterConfig;
  social: StorefrontSocialConfig;
  seo: StorefrontSeoConfig;
  // Legacy mirrors keep metadata and older clients working during migration.
  primary_color?: string;
  logo_url?: string;
  banner_url?: string;
  facebook_url?: string;
  tiktok_url?: string;
}

export type StorefrontConfigInput = Omit<
  Partial<StorefrontConfig>,
  | "template_id"
  | "brand"
  | "announcement"
  | "home"
  | "catalog"
  | "checkout"
  | "footer"
  | "social"
  | "seo"
> & {
  template_id?: string;
  brand?: Partial<StorefrontBrandConfig>;
  announcement?: Partial<StorefrontAnnouncementConfig>;
  home?: Partial<StorefrontHomeConfig>;
  catalog?: Partial<StorefrontCatalogConfig>;
  checkout?: Partial<StorefrontCheckoutConfig>;
  footer?: Partial<StorefrontFooterConfig>;
  social?: Partial<StorefrontSocialConfig>;
  seo?: Partial<StorefrontSeoConfig>;
};

export const STOREFRONT_TEMPLATES: Array<{
  id: StorefrontTemplateId;
  name: string;
  eyebrow: string;
  description: string;
  recommendedFor: string;
  palette: [string, string, string];
}> = [
  {
    id: "market",
    name: "Market",
    eyebrow: "Nhanh và rõ",
    description:
      "Mật độ sản phẩm cao, tìm kiếm nổi bật và thao tác thêm hàng thật nhanh.",
    recommendedFor: "Tạp hóa, gia dụng, cửa hàng nhiều SKU",
    palette: ["#0f766e", "#f59e0b", "#f8faf9"],
  },
  {
    id: "editorial",
    name: "Editorial",
    eyebrow: "Tinh tế và giàu hình ảnh",
    description:
      "Ảnh lớn, khoảng trắng có chủ đích và nhịp trình bày như một tạp chí.",
    recommendedFor: "Thời trang, mỹ phẩm, lifestyle",
    palette: ["#18181b", "#be7c4d", "#f7f4ef"],
  },
  {
    id: "specialist",
    name: "Specialist",
    eyebrow: "Chi tiết và đáng tin",
    description:
      "Tập trung variant, tồn kho và thông tin giúp khách chọn đúng sản phẩm.",
    recommendedFor: "Điện tử, thể thao, mẹ và bé",
    palette: ["#1d4ed8", "#ea580c", "#f8fafc"],
  },
];

const TEMPLATE_DEFAULTS: Record<
  StorefrontTemplateId,
  Pick<StorefrontConfig, "brand" | "catalog">
> = {
  market: {
    brand: {
      primary_color: "#0f766e",
      accent_color: "#f59e0b",
      background_color: "#f8faf9",
      text_color: "#17201e",
      font_pair: "friendly",
      radius: "soft",
    },
    catalog: {
      show_search: true,
      show_category_filter: true,
      show_product_description: false,
      show_stock_status: true,
      show_out_of_stock: true,
      quick_add: true,
      image_ratio: "square",
      products_per_page: 48,
    },
  },
  editorial: {
    brand: {
      primary_color: "#18181b",
      accent_color: "#be7c4d",
      background_color: "#f7f4ef",
      text_color: "#27231f",
      font_pair: "editorial",
      radius: "sharp",
    },
    catalog: {
      show_search: true,
      show_category_filter: true,
      show_product_description: true,
      show_stock_status: false,
      show_out_of_stock: true,
      quick_add: false,
      image_ratio: "portrait",
      products_per_page: 24,
    },
  },
  specialist: {
    brand: {
      primary_color: "#1d4ed8",
      accent_color: "#ea580c",
      background_color: "#f8fafc",
      text_color: "#172033",
      font_pair: "modern",
      radius: "soft",
    },
    catalog: {
      show_search: true,
      show_category_filter: true,
      show_product_description: true,
      show_stock_status: true,
      show_out_of_stock: true,
      quick_add: true,
      image_ratio: "square",
      products_per_page: 36,
    },
  },
};

export function getDefaultStorefrontConfig(
  templateId: StorefrontTemplateId = "market",
): StorefrontConfig {
  const template = TEMPLATE_DEFAULTS[templateId];
  return {
    schema_version: 2,
    enabled: false,
    template_id: templateId,
    brand: { ...template.brand },
    announcement: {
      enabled: false,
      text: "Miễn phí giao hàng cho đơn đủ điều kiện",
    },
    home: {
      hero_title: "Sản phẩm tốt cho những ngày thật đẹp",
      hero_subtitle:
        "Khám phá bộ sưu tập được cửa hàng chọn lọc và đặt hàng ngay hôm nay.",
      hero_cta_label: "Khám phá sản phẩm",
      show_hero: templateId !== "market",
      show_categories: true,
      show_featured_products: true,
      featured_heading:
        templateId === "editorial" ? "Được chọn cho bạn" : "Sản phẩm nổi bật",
    },
    catalog: { ...template.catalog },
    checkout: {
      enabled: true,
      allow_note: true,
      require_address: true,
      allow_cod: true,
      allow_bank_transfer: true,
      success_message: "Cảm ơn bạn. Cửa hàng sẽ sớm liên hệ xác nhận đơn.",
    },
    footer: {
      show_contact: true,
      show_business_hours: true,
      show_powered_by: true,
      policy_text: "Đổi trả theo chính sách của cửa hàng.",
    },
    social: {},
    seo: {},
  };
}

function normalizeTemplateId(templateId?: string): StorefrontTemplateId {
  if (templateId === "editorial" || templateId === "ecommerce") {
    return "editorial";
  }
  if (templateId === "specialist") {
    return "specialist";
  }
  return "market";
}

export function normalizeStorefrontConfig(
  input?: StorefrontConfigInput | null,
): StorefrontConfig {
  const templateId = normalizeTemplateId(input?.template_id);
  const defaults = getDefaultStorefrontConfig(templateId);
  const legacyPrimary = input?.primary_color;
  const legacyLogo = input?.logo_url;
  const legacyBanner = input?.banner_url;
  const legacyFacebook = input?.facebook_url;
  const legacyTiktok = input?.tiktok_url;

  const config: StorefrontConfig = {
    ...defaults,
    ...input,
    schema_version: 2,
    enabled: input?.enabled === true,
    template_id: templateId,
    brand: {
      ...defaults.brand,
      ...input?.brand,
      primary_color:
        input?.brand?.primary_color ||
        legacyPrimary ||
        defaults.brand.primary_color,
      logo_url: input?.brand?.logo_url || legacyLogo,
      banner_url: input?.brand?.banner_url || legacyBanner,
    },
    announcement: {
      ...defaults.announcement,
      ...input?.announcement,
    },
    home: {
      ...defaults.home,
      ...input?.home,
    },
    catalog: {
      ...defaults.catalog,
      ...input?.catalog,
    },
    checkout: {
      ...defaults.checkout,
      ...input?.checkout,
    },
    footer: {
      ...defaults.footer,
      ...input?.footer,
    },
    social: {
      ...defaults.social,
      ...input?.social,
      facebook_url: input?.social?.facebook_url || legacyFacebook,
      tiktok_url: input?.social?.tiktok_url || legacyTiktok,
    },
    seo: {
      ...defaults.seo,
      ...input?.seo,
    },
  };

  return {
    ...config,
    primary_color: config.brand.primary_color,
    logo_url: config.brand.logo_url,
    banner_url: config.brand.banner_url,
    facebook_url: config.social.facebook_url,
    tiktok_url: config.social.tiktok_url,
  };
}

export function applyTemplateDefaults(
  config: StorefrontConfig,
  templateId: StorefrontTemplateId,
): StorefrontConfig {
  const templateDefaults = getDefaultStorefrontConfig(templateId);
  return normalizeStorefrontConfig({
    ...config,
    template_id: templateId,
    brand: {
      ...config.brand,
      ...templateDefaults.brand,
      logo_url: config.brand.logo_url,
      logo_asset_id: config.brand.logo_asset_id,
      banner_url: config.brand.banner_url,
      banner_asset_id: config.brand.banner_asset_id,
    },
    catalog: templateDefaults.catalog,
  });
}

export function storefrontConfigToPayload(
  config: StorefrontConfig,
): StorefrontConfig {
  const normalized = normalizeStorefrontConfig(config);
  return JSON.parse(JSON.stringify(normalized)) as StorefrontConfig;
}
