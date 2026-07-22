export const STOREFRONT_TEMPLATE_IDS = ["orebi"] as const;

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
  banner_urls?: string[];
  banner_asset_ids?: string[];
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
  show_hero_slider: boolean;
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
  show_newsletter: boolean;
  newsletter_title: string;
  newsletter_placeholder: string;
  newsletter_button_label: string;
  company_title: string;
  contact_email: string;
  about_title: string;
  about_links: string;
  support_title: string;
  support_links: string;
  policy_title: string;
  policy_links: string;
  copyright_text: string;
  policy_text: string;
}

export interface StorefrontSocialConfig {
  facebook_url?: string;
  instagram_url?: string;
  youtube_url?: string;
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
    id: "orebi",
    name: "Orebi Store",
    eyebrow: "Tối giản và thương mại",
    description:
      "Bố cục mua sắm cổ điển, hình ảnh lớn và danh mục sản phẩm dễ khám phá.",
    recommendedFor: "Thời trang, gia dụng, phụ kiện và bán lẻ tổng hợp",
    palette: ["#262626", "#6d6d6d", "#f5f5f3"],
  },
];

const TEMPLATE_DEFAULTS: Record<
  StorefrontTemplateId,
  Pick<StorefrontConfig, "brand" | "catalog">
> = {
  orebi: {
    brand: {
      primary_color: "#262626",
      accent_color: "#6d6d6d",
      background_color: "#ffffff",
      text_color: "#262626",
      font_pair: "modern",
      radius: "sharp",
    },
    catalog: {
      show_search: true,
      show_category_filter: true,
      show_product_description: true,
      show_stock_status: true,
      show_out_of_stock: true,
      quick_add: true,
      image_ratio: "square",
      products_per_page: 48,
    },
  },
};

export function getDefaultStorefrontConfig(
  templateId: StorefrontTemplateId = "orebi",
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
      hero_title: "Bộ sưu tập mới",
      hero_subtitle:
        "Khám phá những sản phẩm được chọn lọc dành riêng cho bạn.",
      hero_cta_label: "Mua ngay",
      show_hero: true,
      show_hero_slider: true,
      show_categories: true,
      show_featured_products: true,
      featured_heading: "Sản phẩm nổi bật",
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
      show_newsletter: true,
      newsletter_title: "Đăng ký nhận tin",
      newsletter_placeholder: "Nhập email của bạn",
      newsletter_button_label: "Gửi ngay",
      company_title: "",
      contact_email: "",
      about_title: "Về chúng tôi",
      about_links: "Giới thiệu|#\nLiên hệ|#\nTin tức|#\nHệ thống cửa hàng|#",
      support_title: "Hỗ trợ khách hàng",
      support_links:
        "Câu hỏi thường gặp|#\nHướng dẫn đặt hàng|#\nMua hàng trả góp|#",
      policy_title: "Chính sách",
      policy_links:
        "Chính sách bảo hành|#\nChính sách đổi trả và hoàn tiền|#\nĐiều khoản dịch vụ|#\nChính sách bảo mật|#",
      copyright_text: "",
      policy_text: "Đổi trả theo chính sách của cửa hàng.",
    },
    social: {},
    seo: {},
  };
}

function normalizeTemplateId(templateId?: string): StorefrontTemplateId {
  void templateId;
  return "orebi";
}

function cleanUrl(url?: string): string | undefined {
  if (!url || typeof url !== "string" || !url.trim()) return undefined;
  return url.trim();
}

function cleanUrls(urls?: string[]): string[] {
  if (!Array.isArray(urls)) return [];
  return urls
    .map((url) => cleanUrl(url))
    .filter((url): url is string => Boolean(url))
    .slice(0, 5);
}

export function normalizeStorefrontConfig(
  input?: StorefrontConfigInput | null,
): StorefrontConfig {
  const templateId = normalizeTemplateId(input?.template_id);
  const defaults = getDefaultStorefrontConfig(templateId);
  const legacyPrimary = input?.primary_color;
  const legacyLogo = cleanUrl(input?.logo_url);
  const legacyBanner = cleanUrl(input?.banner_url);
  const legacyFacebook = cleanUrl(input?.facebook_url);
  const legacyTiktok = cleanUrl(input?.tiktok_url);

  const logoUrl = cleanUrl(input?.brand?.logo_url) || legacyLogo;
  const configuredBannerUrls = cleanUrls(input?.brand?.banner_urls);
  const bannerUrl =
    cleanUrl(input?.brand?.banner_url) ||
    legacyBanner ||
    configuredBannerUrls[0];
  const bannerUrls =
    configuredBannerUrls.length > 0
      ? configuredBannerUrls
      : bannerUrl
        ? [bannerUrl]
        : [];
  const facebookUrl = cleanUrl(input?.social?.facebook_url) || legacyFacebook;
  const instagramUrl = cleanUrl(input?.social?.instagram_url);
  const youtubeUrl = cleanUrl(input?.social?.youtube_url);
  const tiktokUrl = cleanUrl(input?.social?.tiktok_url) || legacyTiktok;
  const zaloUrl = cleanUrl(input?.social?.zalo_url);

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
      logo_url: logoUrl,
      banner_url: bannerUrl,
      banner_urls: bannerUrls,
      banner_asset_ids: input?.brand?.banner_asset_ids?.slice(0, 5),
    },
    announcement: {
      ...defaults.announcement,
      ...input?.announcement,
    },
    home: {
      ...defaults.home,
      ...input?.home,
      show_hero: input?.home?.show_hero ?? true,
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
      facebook_url: facebookUrl,
      instagram_url: instagramUrl,
      youtube_url: youtubeUrl,
      tiktok_url: tiktokUrl,
      zalo_url: zaloUrl,
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
