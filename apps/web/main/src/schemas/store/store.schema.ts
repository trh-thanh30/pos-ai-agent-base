// eslint-disable-next-line filenames/match-regex
import { z } from "zod";

const optionalUrl = z.string().url().optional().or(z.literal(""));
const optionalColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/)
  .optional();

export const RetailConfigSchema = z.object({
  schema_version: z.literal(2).optional(),
  enabled: z.boolean().optional(),
  template_id: z
    .enum([
      "market",
      "editorial",
      "specialist",
      "orebi",
      "classic",
      "ecommerce",
      "restaurant",
    ])
    .optional(),
  primary_color: optionalColor,
  logo_url: optionalUrl,
  banner_url: optionalUrl,
  facebook_url: optionalUrl,
  tiktok_url: optionalUrl,
  brand: z
    .object({
      primary_color: optionalColor,
      accent_color: optionalColor,
      background_color: optionalColor,
      text_color: optionalColor,
      font_pair: z.enum(["modern", "editorial", "friendly"]).optional(),
      radius: z.enum(["sharp", "soft", "rounded"]).optional(),
      logo_url: optionalUrl,
      logo_asset_id: z.string().optional(),
      banner_url: optionalUrl,
      banner_asset_id: z.string().optional(),
      banner_urls: z.array(z.string().url()).max(5).optional(),
      banner_asset_ids: z.array(z.string()).max(5).optional(),
    })
    .optional(),
  announcement: z
    .object({
      enabled: z.boolean().optional(),
      text: z.string().max(160).optional(),
    })
    .optional(),
  home: z
    .object({
      hero_title: z.string().max(100).optional(),
      hero_subtitle: z.string().max(240).optional(),
      hero_cta_label: z.string().max(40).optional(),
      show_hero: z.boolean().optional(),
      show_hero_slider: z.boolean().optional(),
      show_categories: z.boolean().optional(),
      show_featured_products: z.boolean().optional(),
      featured_heading: z.string().max(80).optional(),
    })
    .optional(),
  catalog: z
    .object({
      show_search: z.boolean().optional(),
      show_category_filter: z.boolean().optional(),
      show_product_description: z.boolean().optional(),
      show_stock_status: z.boolean().optional(),
      show_out_of_stock: z.boolean().optional(),
      quick_add: z.boolean().optional(),
      image_ratio: z.enum(["square", "portrait", "landscape"]).optional(),
      products_per_page: z
        .union([z.literal(24), z.literal(36), z.literal(48)])
        .optional(),
    })
    .optional(),
  checkout: z
    .object({
      enabled: z.boolean().optional(),
      allow_note: z.boolean().optional(),
      require_address: z.boolean().optional(),
      allow_cod: z.boolean().optional(),
      allow_bank_transfer: z.boolean().optional(),
      success_message: z.string().max(240).optional(),
    })
    .optional(),
  footer: z
    .object({
      show_contact: z.boolean().optional(),
      show_business_hours: z.boolean().optional(),
      show_powered_by: z.boolean().optional(),
      show_newsletter: z.boolean().optional(),
      newsletter_title: z.string().max(80).optional(),
      newsletter_placeholder: z.string().max(100).optional(),
      newsletter_button_label: z.string().max(40).optional(),
      company_title: z.string().max(120).optional(),
      contact_email: z.string().email().or(z.literal("")).optional(),
      about_title: z.string().max(80).optional(),
      about_links: z.string().max(1200).optional(),
      support_title: z.string().max(80).optional(),
      support_links: z.string().max(1200).optional(),
      policy_title: z.string().max(80).optional(),
      policy_links: z.string().max(1200).optional(),
      copyright_text: z.string().max(160).optional(),
      policy_text: z.string().max(240).optional(),
    })
    .optional(),
  social: z
    .object({
      facebook_url: optionalUrl,
      instagram_url: optionalUrl,
      youtube_url: optionalUrl,
      tiktok_url: optionalUrl,
      zalo_url: optionalUrl,
    })
    .optional(),
  seo: z
    .object({
      title: z.string().max(70).optional(),
      description: z.string().max(160).optional(),
    })
    .optional(),
});

export const StoreSchema = z.object({
  id: z.string().uuid(),
  name: z.string().nonempty({ message: "Vui lòng nhập tên doanh nghiệp" }),
  description: z.string().optional(),
  phone_number: z.string().optional(),
  business_hour: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  address: z.string().optional(),
  subdomain: z.string().optional().nullable(),
  retail_config: RetailConfigSchema.optional().nullable(),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export const CreateStoreSchema = StoreSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const updateStoreSchema = CreateStoreSchema.partial();

// Inferred types
export type Store = z.infer<typeof StoreSchema>;
export type CreateStoreInput = z.infer<typeof CreateStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
export type RetailConfig = z.infer<typeof RetailConfigSchema>;
