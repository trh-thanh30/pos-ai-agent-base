"use client";

import { SegmentedControl } from "@mantine/core";
import { currentStoreAtom } from "@repo/design-system/stores/auth";
import useToast from "@repo/design-system/hooks/client/use-toast-notification";
import { ApiResponse } from "@repo/types/response";
import { useAtomValue } from "jotai";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Globe2,
  LayoutTemplate,
  Monitor,
  Palette,
  PanelTop,
  RotateCcw,
  Save,
  Search,
  Share2,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import ImageUpload, {
  UploadedAsset,
} from "../../../components/common/ImageUpload";
import {
  applyTemplateDefaults,
  getDefaultStorefrontConfig,
  normalizeStorefrontConfig,
  STOREFRONT_TEMPLATES,
  StorefrontConfig,
  storefrontConfigToPayload,
  StorefrontTemplateId,
} from "../../../features/storefront/config";
import StorefrontPreview from "../../../features/storefront/StorefrontPreview";
import useStore from "../../../hooks/store/use-store";
import api from "../../../libs/axios";

type PanelId =
  | "overview"
  | "template"
  | "brand"
  | "home"
  | "catalog"
  | "checkout"
  | "footer";

const PANELS: Array<{
  id: PanelId;
  label: string;
  icon: typeof Globe2;
}> = [
  { id: "overview", label: "Tổng quan", icon: Globe2 },
  { id: "template", label: "Mẫu giao diện", icon: LayoutTemplate },
  { id: "brand", label: "Thương hiệu", icon: Palette },
  { id: "home", label: "Trang chủ", icon: PanelTop },
  { id: "catalog", label: "Danh mục & sản phẩm", icon: Search },
  { id: "checkout", label: "Giỏ hàng & đặt hàng", icon: ShoppingBag },
  { id: "footer", label: "Liên hệ & SEO", icon: Share2 },
];

const COLOR_PRESETS = [
  {
    name: "Coastal",
    primary: "#0f766e",
    accent: "#f59e0b",
    background: "#f8faf9",
    text: "#17201e",
  },
  {
    name: "Ink",
    primary: "#18181b",
    accent: "#be7c4d",
    background: "#f7f4ef",
    text: "#27231f",
  },
  {
    name: "Signal",
    primary: "#1d4ed8",
    accent: "#ea580c",
    background: "#f8fafc",
    text: "#172033",
  },
  {
    name: "Berry",
    primary: "#9f1239",
    accent: "#ca8a04",
    background: "#fffafb",
    text: "#32151d",
  },
];

function getSiteUrl(subdomain: string) {
  const configuredDomain =
    process.env.NEXT_PUBLIC_STORE_BASE_DOMAIN ||
    process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  const browserDomain =
    typeof window !== "undefined"
      ? window.location.hostname.includes("localhost")
        ? "localhost:3001"
        : window.location.hostname
      : "localhost:3001";
  const baseDomain = configuredDomain || browserDomain;
  const protocol = baseDomain.includes("localhost") ? "http" : "https";
  return subdomain ? `${protocol}://${subdomain}.${baseDomain}` : "";
}

export function InfoOnlineStore() {
  const currentStore = useAtomValue(currentStoreAtom);
  const { showSuccessToast, showErrorToast } = useToast();
  const { store, getStoreDetail } = useStore();
  const [activePanel, setActivePanel] = useState<PanelId>("overview");
  const [config, setConfig] = useState<StorefrontConfig>(
    getDefaultStorefrontConfig(),
  );
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [savedSubdomain, setSavedSubdomain] = useState("");
  const [subdomainValid, setSubdomainValid] = useState<boolean | null>(null);
  const [validationMsg, setValidationMsg] = useState("");
  const [validating, setValidating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">(
    "desktop",
  );

  useEffect(() => {
    if (!currentStore?.id) return;
    getStoreDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStore?.id]);

  useEffect(() => {
    if (!store) return;
    const nextConfig = normalizeStorefrontConfig(store.retail_config);
    const nextSubdomain = store.subdomain || "";
    setConfig(nextConfig);
    setSavedSnapshot(JSON.stringify(nextConfig));
    setSubdomain(nextSubdomain);
    setSavedSubdomain(nextSubdomain);
    setSubdomainValid(nextSubdomain ? true : null);
  }, [store]);

  const hasChanges =
    savedSnapshot !== JSON.stringify(config) || subdomain !== savedSubdomain;
  const siteUrl = getSiteUrl(subdomain);
  const selectedTemplate = STOREFRONT_TEMPLATES.find(
    (template) => template.id === config.template_id,
  );

  const updateConfig = (
    updater: (current: StorefrontConfig) => StorefrontConfig,
  ) => setConfig((current) => updater(current));

  const logoAssets = useMemo<UploadedAsset[]>(
    () =>
      config.brand.logo_url
        ? [
            {
              id: config.brand.logo_asset_id || "legacy-logo",
              url: config.brand.logo_url,
              original_name: "Logo cửa hàng",
            },
          ]
        : [],
    [config.brand.logo_asset_id, config.brand.logo_url],
  );

  const bannerAssets = useMemo<UploadedAsset[]>(() => {
    const urls = config.brand.banner_urls?.length
      ? config.brand.banner_urls
      : config.brand.banner_url
        ? [config.brand.banner_url]
        : [];
    return urls.map((url, index) => ({
      id:
        config.brand.banner_asset_ids?.[index] ||
        (index === 0 ? config.brand.banner_asset_id : undefined) ||
        `legacy-banner-${index}`,
      url,
      original_name: `Ảnh hero ${index + 1}`,
    }));
  }, [
    config.brand.banner_asset_id,
    config.brand.banner_asset_ids,
    config.brand.banner_url,
    config.brand.banner_urls,
  ]);

  const handleCheckSubdomain = async () => {
    if (!subdomain.trim()) {
      setSubdomainValid(false);
      setValidationMsg("Vui lòng nhập tên subdomain.");
      return;
    }
    setValidating(true);
    try {
      const params = new URLSearchParams({ subdomain: subdomain.trim() });
      if (currentStore?.id) params.set("storeId", currentStore.id);
      const response = await api.get<ApiResponse>(
        `/stores/subdomain/validate?${params.toString()}`,
      );
      const result = response.data.data as {
        available?: boolean;
        message?: string;
      };
      setSubdomainValid(result.available === true);
      setValidationMsg(
        result.available
          ? "Địa chỉ này có thể sử dụng."
          : result.message || "Địa chỉ đã được sử dụng.",
      );
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data &&
        "message" in error.response.data
          ? String(error.response.data.message)
          : "Không thể kiểm tra địa chỉ lúc này.";
      setSubdomainValid(false);
      setValidationMsg(message);
    } finally {
      setValidating(false);
    }
  };

  const handleSave = async () => {
    if (!currentStore?.id) return;
    if (config.enabled && !subdomain.trim()) {
      setActivePanel("overview");
      showErrorToast("Cần có địa chỉ website trước khi bật công khai.");
      return;
    }
    if (
      subdomain.trim() &&
      subdomain !== savedSubdomain &&
      subdomainValid !== true
    ) {
      setActivePanel("overview");
      showErrorToast("Hãy kiểm tra địa chỉ website trước khi lưu.");
      return;
    }
    setSaving(true);
    try {
      const payload = storefrontConfigToPayload(config);
      const response = await api.patch<ApiResponse>(
        `/stores/${currentStore.id}`,
        {
          subdomain: subdomain.trim() || null,
          retail_config: payload,
        },
      );
      if (response.data.success) {
        setSavedSnapshot(JSON.stringify(payload));
        setSavedSubdomain(subdomain.trim());
        showSuccessToast("Đã lưu cấu hình website.");
        getStoreDetail();
      }
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data &&
        "message" in error.response.data
          ? String(error.response.data.message)
          : "Không thể lưu cấu hình.";
      showErrorToast(message);
    } finally {
      setSaving(false);
    }
  };

  const resetChanges = () => {
    if (!savedSnapshot) return;
    setConfig(normalizeStorefrontConfig(JSON.parse(savedSnapshot)));
    setSubdomain(savedSubdomain);
    setSubdomainValid(savedSubdomain ? true : null);
  };

  return (
    <div className="min-h-full bg-[#f3f5f5]">
      <header className="sticky top-0 z-20 flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-[#dce1e1] bg-white px-5 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-md bg-[#17211f] text-white">
            <Store className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-bold text-[#17211f]">
                Website cửa hàng
              </h1>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                  config.enabled
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {config.enabled ? "Công khai" : "Đang tắt"}
              </span>
            </div>
            <p className="truncate text-xs text-[#6c7774]">
              {hasChanges ? "Có thay đổi chưa lưu" : "Mọi thay đổi đã được lưu"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {siteUrl && config.enabled && (
            <a
              href={siteUrl}
              target="_blank"
              rel="noreferrer"
              title="Mở website"
              className="grid size-9 place-items-center rounded-md border border-[#d4dada] bg-white text-[#4b5754] transition hover:border-[#9ba6a3] hover:text-[#17211f]"
            >
              <ExternalLink className="size-4" />
            </a>
          )}
          <button
            type="button"
            onClick={resetChanges}
            disabled={!hasChanges || saving}
            title="Hoàn tác thay đổi"
            className="grid size-9 place-items-center rounded-md border border-[#d4dada] bg-white text-[#4b5754] transition hover:border-[#9ba6a3] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <RotateCcw className="size-4" />
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-[#17211f] px-4 text-sm font-bold text-white transition hover:bg-[#26332f] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? (
              <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Save className="size-4" />
            )}
            Lưu thay đổi
          </button>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-12rem)] xl:grid-cols-[390px_minmax(520px,1fr)]">
        <div className="border-r border-[#dce1e1] bg-white">
          <div className="grid border-b border-[#e5e9e8] sm:grid-cols-[150px_1fr] xl:grid-cols-1">
            <nav className="border-r border-[#e5e9e8] p-2 sm:min-h-[640px] xl:min-h-0 xl:border-b xl:border-r-0">
              <div className="grid gap-1 xl:grid-cols-4">
                {PANELS.map((panel) => {
                  const Icon = panel.icon;
                  const active = activePanel === panel.id;
                  return (
                    <button
                      key={panel.id}
                      type="button"
                      onClick={() => setActivePanel(panel.id)}
                      className={`flex min-h-10 items-center gap-2 rounded-md px-3 text-left text-xs font-semibold transition xl:justify-center xl:px-2 ${
                        active
                          ? "bg-[#e9f2ef] text-[#0d6658]"
                          : "text-[#62706c] hover:bg-[#f4f6f5] hover:text-[#17211f]"
                      }`}
                      title={panel.label}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="xl:hidden">{panel.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>
            <div className="p-5">
              <PanelHeading
                title={PANELS.find((panel) => panel.id === activePanel)?.label}
                templateName={selectedTemplate?.name}
              />

              {activePanel === "overview" && (
                <div className="grid gap-6">
                  <SettingGroup title="Trạng thái website">
                    <ToggleRow
                      label="Bật website công khai"
                      description={
                        config.enabled
                          ? "Khách hàng có thể truy cập website."
                          : "Website đang ẩn với khách hàng."
                      }
                      checked={config.enabled}
                      onChange={(enabled) =>
                        updateConfig((current) => ({ ...current, enabled }))
                      }
                    />
                  </SettingGroup>

                  <SettingGroup title="Địa chỉ website">
                    <label className="grid gap-1.5 text-xs font-semibold text-[#34413d]">
                      Subdomain
                      <div className="flex">
                        <input
                          value={subdomain}
                          onChange={(event) => {
                            setSubdomain(
                              event.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9-]/g, ""),
                            );
                            setSubdomainValid(null);
                            setValidationMsg("");
                          }}
                          placeholder="ten-cua-hang"
                          className="h-10 min-w-0 flex-1 rounded-l-md border border-[#cfd6d4] px-3 text-sm outline-none focus:border-[#0d7666]"
                        />
                        <button
                          type="button"
                          onClick={handleCheckSubdomain}
                          disabled={validating || !subdomain}
                          className="h-10 rounded-r-md border border-l-0 border-[#cfd6d4] bg-[#f6f8f7] px-3 text-xs font-bold text-[#35423e] disabled:opacity-40"
                        >
                          {validating ? "Đang kiểm tra" : "Kiểm tra"}
                        </button>
                      </div>
                    </label>
                    {subdomain && (
                      <p className="break-all text-[11px] text-[#6b7774]">
                        {siteUrl}
                      </p>
                    )}
                    {subdomainValid !== null && (
                      <div
                        className={`flex items-start gap-1.5 text-xs ${
                          subdomainValid ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        {subdomainValid ? (
                          <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />
                        ) : (
                          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                        )}
                        {validationMsg}
                      </div>
                    )}
                  </SettingGroup>

                  <SettingGroup title="Thanh thông báo">
                    <ToggleRow
                      label="Hiển thị thông báo"
                      checked={config.announcement.enabled}
                      onChange={(enabled) =>
                        updateConfig((current) => ({
                          ...current,
                          announcement: {
                            ...current.announcement,
                            enabled,
                          },
                        }))
                      }
                    />
                    {config.announcement.enabled && (
                      <TextField
                        label="Nội dung"
                        maxLength={160}
                        value={config.announcement.text}
                        onChange={(text) =>
                          updateConfig((current) => ({
                            ...current,
                            announcement: {
                              ...current.announcement,
                              text,
                            },
                          }))
                        }
                      />
                    )}
                  </SettingGroup>
                </div>
              )}

              {activePanel === "template" && (
                <div className="grid gap-3">
                  {STOREFRONT_TEMPLATES.map((template) => {
                    const active = config.template_id === template.id;
                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() =>
                          updateConfig((current) =>
                            applyTemplateDefaults(current, template.id),
                          )
                        }
                        className={`overflow-hidden rounded-md border text-left transition ${
                          active
                            ? "border-[#0d7666] ring-2 ring-[#0d7666]/10"
                            : "border-[#d9dfdd] hover:border-[#a9b3b0]"
                        }`}
                      >
                        <TemplateThumbnail
                          id={template.id}
                          palette={template.palette}
                        />
                        <div className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#7a8682]">
                                {template.eyebrow}
                              </p>
                              <h3 className="mt-0.5 text-sm font-bold text-[#17211f]">
                                {template.name}
                              </h3>
                            </div>
                            {active && (
                              <span className="grid size-6 place-items-center rounded-full bg-[#0d7666] text-white">
                                <Check className="size-3.5" />
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-[11px] leading-4 text-[#65716e]">
                            {template.description}
                          </p>
                          <p className="mt-2 text-[10px] font-semibold text-[#37443f]">
                            {template.recommendedFor}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {activePanel === "brand" && (
                <div className="grid gap-6">
                  <SettingGroup title="Bộ màu">
                    <div className="grid grid-cols-4 gap-2">
                      {COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          title={preset.name}
                          onClick={() =>
                            updateConfig((current) => ({
                              ...current,
                              brand: {
                                ...current.brand,
                                primary_color: preset.primary,
                                accent_color: preset.accent,
                                background_color: preset.background,
                                text_color: preset.text,
                              },
                            }))
                          }
                          className="grid h-9 grid-cols-2 overflow-hidden rounded border border-[#d7dddb] p-1"
                        >
                          <span
                            className="rounded-l-sm"
                            style={{ background: preset.primary }}
                          />
                          <span
                            className="rounded-r-sm"
                            style={{ background: preset.accent }}
                          />
                        </button>
                      ))}
                    </div>
                    <div className="grid min-w-0 grid-cols-2 gap-3">
                      <ColorField
                        label="Màu chính"
                        value={config.brand.primary_color}
                        onChange={(primary_color) =>
                          updateConfig((current) => ({
                            ...current,
                            brand: { ...current.brand, primary_color },
                          }))
                        }
                      />
                      <ColorField
                        label="Màu nhấn"
                        value={config.brand.accent_color}
                        onChange={(accent_color) =>
                          updateConfig((current) => ({
                            ...current,
                            brand: { ...current.brand, accent_color },
                          }))
                        }
                      />
                      <ColorField
                        label="Màu nền"
                        value={config.brand.background_color}
                        onChange={(background_color) =>
                          updateConfig((current) => ({
                            ...current,
                            brand: { ...current.brand, background_color },
                          }))
                        }
                      />
                      <ColorField
                        label="Màu chữ"
                        value={config.brand.text_color}
                        onChange={(text_color) =>
                          updateConfig((current) => ({
                            ...current,
                            brand: { ...current.brand, text_color },
                          }))
                        }
                      />
                    </div>
                  </SettingGroup>

                  <SettingGroup title="Kiểu chữ & bo góc">
                    <SelectField
                      label="Bộ kiểu chữ"
                      value={config.brand.font_pair}
                      options={[
                        ["friendly", "Thân thiện"],
                        ["modern", "Hiện đại"],
                        ["editorial", "Tạp chí"],
                      ]}
                      onChange={(font_pair) =>
                        updateConfig((current) => ({
                          ...current,
                          brand: {
                            ...current.brand,
                            font_pair:
                              font_pair as StorefrontConfig["brand"]["font_pair"],
                          },
                        }))
                      }
                    />
                    <SegmentedControl
                      fullWidth
                      size="xs"
                      value={config.brand.radius}
                      onChange={(radius) =>
                        updateConfig((current) => ({
                          ...current,
                          brand: {
                            ...current.brand,
                            radius:
                              radius as StorefrontConfig["brand"]["radius"],
                          },
                        }))
                      }
                      data={[
                        { value: "sharp", label: "Vuông" },
                        { value: "soft", label: "Mềm" },
                        { value: "rounded", label: "Bo tròn" },
                      ]}
                    />
                  </SettingGroup>

                  <SettingGroup title="Logo">
                    <ImageUpload
                      label=""
                      folder="storefront/logo"
                      maxFiles={1}
                      value={logoAssets}
                      onChange={(assets) => {
                        const asset = assets[0];
                        updateConfig((current) => ({
                          ...current,
                          brand: {
                            ...current.brand,
                            logo_url: asset?.url,
                            logo_asset_id: asset?.id,
                          },
                        }));
                      }}
                    />
                  </SettingGroup>

                  <SettingGroup title="Ảnh hero slider (tối đa 5 ảnh)">
                    <ImageUpload
                      label=""
                      folder="storefront/banner"
                      maxFiles={5}
                      value={bannerAssets}
                      onChange={(assets) => {
                        const asset = assets[0];
                        updateConfig((current) => ({
                          ...current,
                          brand: {
                            ...current.brand,
                            banner_url: asset?.url,
                            banner_asset_id: asset?.id,
                            banner_urls: assets.map((item) => item.url),
                            banner_asset_ids: assets.map((item) => item.id),
                          },
                        }));
                      }}
                    />
                  </SettingGroup>
                </div>
              )}

              {activePanel === "home" && (
                <div className="grid gap-6">
                  <SettingGroup title="Hero">
                    <ToggleRow
                      label="Hiển thị hero slider"
                      checked={config.home.show_hero_slider}
                      onChange={(show_hero_slider) =>
                        updateConfig((current) => ({
                          ...current,
                          home: { ...current.home, show_hero_slider },
                        }))
                      }
                    />
                    <TextField
                      label="Tiêu đề"
                      maxLength={100}
                      value={config.home.hero_title}
                      onChange={(hero_title) =>
                        updateConfig((current) => ({
                          ...current,
                          home: { ...current.home, hero_title },
                        }))
                      }
                    />
                    <TextAreaField
                      label="Mô tả"
                      maxLength={240}
                      value={config.home.hero_subtitle}
                      onChange={(hero_subtitle) =>
                        updateConfig((current) => ({
                          ...current,
                          home: { ...current.home, hero_subtitle },
                        }))
                      }
                    />
                    <TextField
                      label="Nhãn nút"
                      maxLength={40}
                      value={config.home.hero_cta_label}
                      onChange={(hero_cta_label) =>
                        updateConfig((current) => ({
                          ...current,
                          home: { ...current.home, hero_cta_label },
                        }))
                      }
                    />
                  </SettingGroup>

                  <SettingGroup title="Khu vực sản phẩm">
                    <ToggleRow
                      label="Hiển thị các khu vực sản phẩm"
                      checked={config.home.show_featured_products}
                      onChange={(show_featured_products) =>
                        updateConfig((current) => ({
                          ...current,
                          home: {
                            ...current.home,
                            show_featured_products,
                          },
                        }))
                      }
                    />
                    <TextField
                      label="Tiêu đề"
                      maxLength={80}
                      value={config.home.featured_heading}
                      onChange={(featured_heading) =>
                        updateConfig((current) => ({
                          ...current,
                          home: { ...current.home, featured_heading },
                        }))
                      }
                    />
                    <ToggleRow
                      label="Hiển thị danh mục"
                      checked={config.home.show_categories}
                      onChange={(show_categories) =>
                        updateConfig((current) => ({
                          ...current,
                          home: { ...current.home, show_categories },
                          catalog: {
                            ...current.catalog,
                            show_category_filter: show_categories,
                          },
                        }))
                      }
                    />
                  </SettingGroup>
                </div>
              )}

              {activePanel === "catalog" && (
                <div className="grid gap-6">
                  <SettingGroup title="Duyệt sản phẩm">
                    <ToggleRow
                      label="Thanh tìm kiếm"
                      checked={config.catalog.show_search}
                      onChange={(show_search) =>
                        updateConfig((current) => ({
                          ...current,
                          catalog: { ...current.catalog, show_search },
                        }))
                      }
                    />
                    <ToggleRow
                      label="Bộ lọc danh mục"
                      checked={config.catalog.show_category_filter}
                      onChange={(show_category_filter) =>
                        updateConfig((current) => ({
                          ...current,
                          catalog: {
                            ...current.catalog,
                            show_category_filter,
                          },
                        }))
                      }
                    />
                    <ToggleRow
                      label="Mô tả trên thẻ sản phẩm"
                      checked={config.catalog.show_product_description}
                      onChange={(show_product_description) =>
                        updateConfig((current) => ({
                          ...current,
                          catalog: {
                            ...current.catalog,
                            show_product_description,
                          },
                        }))
                      }
                    />
                    <ToggleRow
                      label="Trạng thái tồn kho"
                      checked={config.catalog.show_stock_status}
                      onChange={(show_stock_status) =>
                        updateConfig((current) => ({
                          ...current,
                          catalog: {
                            ...current.catalog,
                            show_stock_status,
                          },
                        }))
                      }
                    />
                    <ToggleRow
                      label="Hiện sản phẩm hết hàng"
                      checked={config.catalog.show_out_of_stock}
                      onChange={(show_out_of_stock) =>
                        updateConfig((current) => ({
                          ...current,
                          catalog: {
                            ...current.catalog,
                            show_out_of_stock,
                          },
                        }))
                      }
                    />
                    <ToggleRow
                      label="Thêm nhanh vào giỏ"
                      checked={config.catalog.quick_add}
                      onChange={(quick_add) =>
                        updateConfig((current) => ({
                          ...current,
                          catalog: { ...current.catalog, quick_add },
                        }))
                      }
                    />
                  </SettingGroup>
                  <SettingGroup title="Hình ảnh & mật độ">
                    <SelectField
                      label="Tỷ lệ ảnh"
                      value={config.catalog.image_ratio}
                      options={[
                        ["square", "Vuông 1:1"],
                        ["portrait", "Dọc 4:5"],
                        ["landscape", "Ngang 4:3"],
                      ]}
                      onChange={(image_ratio) =>
                        updateConfig((current) => ({
                          ...current,
                          catalog: {
                            ...current.catalog,
                            image_ratio:
                              image_ratio as StorefrontConfig["catalog"]["image_ratio"],
                          },
                        }))
                      }
                    />
                    <SelectField
                      label="Sản phẩm mỗi trang"
                      value={String(config.catalog.products_per_page)}
                      options={[
                        ["24", "24 sản phẩm"],
                        ["36", "36 sản phẩm"],
                        ["48", "48 sản phẩm"],
                      ]}
                      onChange={(value) =>
                        updateConfig((current) => ({
                          ...current,
                          catalog: {
                            ...current.catalog,
                            products_per_page: Number(
                              value,
                            ) as StorefrontConfig["catalog"]["products_per_page"],
                          },
                        }))
                      }
                    />
                  </SettingGroup>
                </div>
              )}

              {activePanel === "checkout" && (
                <div className="grid gap-6">
                  <SettingGroup title="Nhận đơn">
                    <ToggleRow
                      label="Cho phép đặt hàng"
                      checked={config.checkout.enabled}
                      onChange={(enabled) =>
                        updateConfig((current) => ({
                          ...current,
                          checkout: { ...current.checkout, enabled },
                        }))
                      }
                    />
                    <ToggleRow
                      label="Yêu cầu địa chỉ"
                      checked={config.checkout.require_address}
                      onChange={(require_address) =>
                        updateConfig((current) => ({
                          ...current,
                          checkout: {
                            ...current.checkout,
                            require_address,
                          },
                        }))
                      }
                    />
                    <ToggleRow
                      label="Cho phép ghi chú"
                      checked={config.checkout.allow_note}
                      onChange={(allow_note) =>
                        updateConfig((current) => ({
                          ...current,
                          checkout: { ...current.checkout, allow_note },
                        }))
                      }
                    />
                  </SettingGroup>
                  <SettingGroup title="Thanh toán">
                    <ToggleRow
                      label="Thanh toán khi nhận hàng"
                      checked={config.checkout.allow_cod}
                      onChange={(allow_cod) =>
                        updateConfig((current) => ({
                          ...current,
                          checkout: { ...current.checkout, allow_cod },
                        }))
                      }
                    />
                    <ToggleRow
                      label="Chuyển khoản ngân hàng"
                      checked={config.checkout.allow_bank_transfer}
                      onChange={(allow_bank_transfer) =>
                        updateConfig((current) => ({
                          ...current,
                          checkout: {
                            ...current.checkout,
                            allow_bank_transfer,
                          },
                        }))
                      }
                    />
                  </SettingGroup>
                  <SettingGroup title="Sau khi đặt hàng">
                    <TextAreaField
                      label="Thông báo thành công"
                      maxLength={240}
                      value={config.checkout.success_message}
                      onChange={(success_message) =>
                        updateConfig((current) => ({
                          ...current,
                          checkout: {
                            ...current.checkout,
                            success_message,
                          },
                        }))
                      }
                    />
                  </SettingGroup>
                </div>
              )}

              {activePanel === "footer" && (
                <div className="grid gap-6">
                  <SettingGroup title="Chân trang">
                    <ToggleRow
                      label="Đăng ký nhận tin"
                      checked={config.footer.show_newsletter}
                      onChange={(show_newsletter) =>
                        updateConfig((current) => ({
                          ...current,
                          footer: { ...current.footer, show_newsletter },
                        }))
                      }
                    />
                    <ToggleRow
                      label="Thông tin liên hệ"
                      checked={config.footer.show_contact}
                      onChange={(show_contact) =>
                        updateConfig((current) => ({
                          ...current,
                          footer: { ...current.footer, show_contact },
                        }))
                      }
                    />
                    <ToggleRow
                      label="Giờ mở cửa"
                      checked={config.footer.show_business_hours}
                      onChange={(show_business_hours) =>
                        updateConfig((current) => ({
                          ...current,
                          footer: {
                            ...current.footer,
                            show_business_hours,
                          },
                        }))
                      }
                    />
                    <ToggleRow
                      label="Powered by NexPOS"
                      checked={config.footer.show_powered_by}
                      onChange={(show_powered_by) =>
                        updateConfig((current) => ({
                          ...current,
                          footer: { ...current.footer, show_powered_by },
                        }))
                      }
                    />
                    <TextAreaField
                      label="Chính sách ngắn"
                      maxLength={240}
                      value={config.footer.policy_text}
                      onChange={(policy_text) =>
                        updateConfig((current) => ({
                          ...current,
                          footer: { ...current.footer, policy_text },
                        }))
                      }
                    />
                    <TextField
                      label="Tên doanh nghiệp ở footer"
                      value={config.footer.company_title}
                      placeholder="Để trống để dùng tên cửa hàng"
                      maxLength={120}
                      onChange={(company_title) =>
                        updateConfig((current) => ({
                          ...current,
                          footer: { ...current.footer, company_title },
                        }))
                      }
                    />
                    <TextField
                      label="Email liên hệ"
                      value={config.footer.contact_email}
                      placeholder="hello@cuahang.vn"
                      maxLength={160}
                      onChange={(contact_email) =>
                        updateConfig((current) => ({
                          ...current,
                          footer: { ...current.footer, contact_email },
                        }))
                      }
                    />
                    <TextField
                      label="Dòng bản quyền"
                      value={config.footer.copyright_text}
                      placeholder="Để trống để tạo tự động"
                      maxLength={160}
                      onChange={(copyright_text) =>
                        updateConfig((current) => ({
                          ...current,
                          footer: { ...current.footer, copyright_text },
                        }))
                      }
                    />
                  </SettingGroup>

                  <SettingGroup title="Form nhận tin">
                    <TextField
                      label="Tiêu đề"
                      value={config.footer.newsletter_title}
                      maxLength={80}
                      onChange={(newsletter_title) =>
                        updateConfig((current) => ({
                          ...current,
                          footer: { ...current.footer, newsletter_title },
                        }))
                      }
                    />
                    <TextField
                      label="Placeholder email"
                      value={config.footer.newsletter_placeholder}
                      maxLength={100}
                      onChange={(newsletter_placeholder) =>
                        updateConfig((current) => ({
                          ...current,
                          footer: {
                            ...current.footer,
                            newsletter_placeholder,
                          },
                        }))
                      }
                    />
                    <TextField
                      label="Nhãn nút gửi"
                      value={config.footer.newsletter_button_label}
                      maxLength={40}
                      onChange={(newsletter_button_label) =>
                        updateConfig((current) => ({
                          ...current,
                          footer: {
                            ...current.footer,
                            newsletter_button_label,
                          },
                        }))
                      }
                    />
                  </SettingGroup>

                  <SettingGroup title="Các cột liên kết">
                    <TextField
                      label="Tiêu đề cột giới thiệu"
                      value={config.footer.about_title}
                      maxLength={80}
                      onChange={(about_title) =>
                        updateConfig((current) => ({
                          ...current,
                          footer: { ...current.footer, about_title },
                        }))
                      }
                    />
                    <TextAreaField
                      label="Link giới thiệu — mỗi dòng: Tên | URL"
                      value={config.footer.about_links}
                      maxLength={1200}
                      onChange={(about_links) =>
                        updateConfig((current) => ({
                          ...current,
                          footer: { ...current.footer, about_links },
                        }))
                      }
                    />
                    <TextField
                      label="Tiêu đề cột hỗ trợ"
                      value={config.footer.support_title}
                      maxLength={80}
                      onChange={(support_title) =>
                        updateConfig((current) => ({
                          ...current,
                          footer: { ...current.footer, support_title },
                        }))
                      }
                    />
                    <TextAreaField
                      label="Link hỗ trợ — mỗi dòng: Tên | URL"
                      value={config.footer.support_links}
                      maxLength={1200}
                      onChange={(support_links) =>
                        updateConfig((current) => ({
                          ...current,
                          footer: { ...current.footer, support_links },
                        }))
                      }
                    />
                    <TextField
                      label="Tiêu đề cột chính sách"
                      value={config.footer.policy_title}
                      maxLength={80}
                      onChange={(policy_title) =>
                        updateConfig((current) => ({
                          ...current,
                          footer: { ...current.footer, policy_title },
                        }))
                      }
                    />
                    <TextAreaField
                      label="Link chính sách — mỗi dòng: Tên | URL"
                      value={config.footer.policy_links}
                      maxLength={1200}
                      onChange={(policy_links) =>
                        updateConfig((current) => ({
                          ...current,
                          footer: { ...current.footer, policy_links },
                        }))
                      }
                    />
                  </SettingGroup>

                  <SettingGroup title="Mạng xã hội">
                    <TextField
                      label="Facebook"
                      value={config.social.facebook_url || ""}
                      placeholder="https://facebook.com/..."
                      onChange={(facebook_url) =>
                        updateConfig((current) => ({
                          ...current,
                          social: {
                            ...current.social,
                            facebook_url: facebook_url || undefined,
                          },
                        }))
                      }
                    />
                    <TextField
                      label="Instagram"
                      value={config.social.instagram_url || ""}
                      placeholder="https://instagram.com/..."
                      onChange={(instagram_url) =>
                        updateConfig((current) => ({
                          ...current,
                          social: {
                            ...current.social,
                            instagram_url: instagram_url || undefined,
                          },
                        }))
                      }
                    />
                    <TextField
                      label="TikTok"
                      value={config.social.tiktok_url || ""}
                      placeholder="https://tiktok.com/@..."
                      onChange={(tiktok_url) =>
                        updateConfig((current) => ({
                          ...current,
                          social: {
                            ...current.social,
                            tiktok_url: tiktok_url || undefined,
                          },
                        }))
                      }
                    />
                    <TextField
                      label="YouTube"
                      value={config.social.youtube_url || ""}
                      placeholder="https://youtube.com/@..."
                      onChange={(youtube_url) =>
                        updateConfig((current) => ({
                          ...current,
                          social: {
                            ...current.social,
                            youtube_url: youtube_url || undefined,
                          },
                        }))
                      }
                    />
                  </SettingGroup>

                  <SettingGroup title="SEO">
                    <TextField
                      label="Tiêu đề trang"
                      maxLength={70}
                      value={config.seo.title || ""}
                      onChange={(title) =>
                        updateConfig((current) => ({
                          ...current,
                          seo: { ...current.seo, title: title || undefined },
                        }))
                      }
                    />
                    <TextAreaField
                      label="Mô tả tìm kiếm"
                      maxLength={160}
                      value={config.seo.description || ""}
                      onChange={(description) =>
                        updateConfig((current) => ({
                          ...current,
                          seo: {
                            ...current.seo,
                            description: description || undefined,
                          },
                        }))
                      }
                    />
                  </SettingGroup>
                </div>
              )}
            </div>
          </div>
        </div>

        <section className="relative min-w-0 p-4 lg:p-6">
          <div className="sticky top-24">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#4e5b57]">
                <Sparkles className="size-3.5 text-[#0d7666]" />
                Xem trước trực tiếp
              </div>
              <div className="flex rounded-md border border-[#d4dada] bg-white p-1">
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  title="Màn hình máy tính"
                  className={`grid size-8 place-items-center rounded ${
                    previewDevice === "desktop"
                      ? "bg-[#17211f] text-white"
                      : "text-[#66726f]"
                  }`}
                >
                  <Monitor className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  title="Màn hình điện thoại"
                  className={`grid size-8 place-items-center rounded ${
                    previewDevice === "mobile"
                      ? "bg-[#17211f] text-white"
                      : "text-[#66726f]"
                  }`}
                >
                  <Smartphone className="size-4" />
                </button>
              </div>
            </div>
            <div className="flex min-h-[650px] items-start justify-center overflow-auto rounded-md border border-[#cfd6d4] bg-[#dfe4e3] p-3 shadow-sm">
              <div
                className={`min-h-[620px] overflow-hidden bg-white shadow-xl transition-all duration-300 ${
                  previewDevice === "mobile"
                    ? "w-[390px] max-w-full"
                    : "w-full min-w-[520px]"
                }`}
              >
                <StorefrontPreview
                  config={config}
                  storeName={store?.name || currentStore?.name || "Cửa hàng"}
                  storeDescription={store?.description}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function PanelHeading({
  title,
  templateName,
}: {
  title?: string;
  templateName?: string;
}) {
  return (
    <div className="mb-6 border-b border-[#e5e9e8] pb-4">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#85908d]">
        {templateName}
        <ChevronRight className="size-3" />
        Thiết lập
      </div>
      <h2 className="mt-1 text-lg font-bold text-[#17211f]">{title}</h2>
    </div>
  );
}

function SettingGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid min-w-0 gap-3">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#77827f]">
        {title}
      </h3>
      {children}
    </section>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3 rounded-md border border-[#dce2e0] bg-white p-3">
      <span>
        <span className="block text-xs font-semibold text-[#26332f]">
          {label}
        </span>
        {description && (
          <span className="mt-0.5 block text-[10px] leading-4 text-[#75807d]">
            {description}
          </span>
        )}
      </span>
      <span
        className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition ${
          checked ? "bg-[#0d7666]" : "bg-[#c5cdca]"
        }`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="sr-only"
        />
        <span
          className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition ${
            checked ? "left-[18px]" : "left-0.5"
          }`}
        />
      </span>
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <label className="grid min-w-0 gap-1.5 text-xs font-semibold text-[#34413d]">
      <span className="flex justify-between gap-2">
        {label}
        {maxLength && (
          <span className="font-normal text-[#929c99]">
            {value.length}/{maxLength}
          </span>
        )}
      </span>
      <input
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full min-w-0 rounded-md border border-[#cfd6d4] px-3 text-sm font-normal outline-none transition focus:border-[#0d7666] focus:ring-2 focus:ring-[#0d7666]/10"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}) {
  return (
    <label className="grid min-w-0 gap-1.5 text-xs font-semibold text-[#34413d]">
      <span className="flex justify-between gap-2">
        {label}
        {maxLength && (
          <span className="font-normal text-[#929c99]">
            {value.length}/{maxLength}
          </span>
        )}
      </span>
      <textarea
        value={value}
        maxLength={maxLength}
        rows={4}
        onChange={(event) => onChange(event.target.value)}
        className="w-full min-w-0 resize-none rounded-md border border-[#cfd6d4] p-3 text-sm font-normal leading-5 outline-none transition focus:border-[#0d7666] focus:ring-2 focus:ring-[#0d7666]/10"
      />
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid min-w-0 gap-1.5 text-xs font-semibold text-[#34413d]">
      {label}
      <span className="flex h-10 min-w-0 items-center gap-1.5 rounded-md border border-[#cfd6d4] bg-white p-1.5">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="size-7 shrink-0 cursor-pointer border-0 bg-transparent p-0"
        />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-0 min-w-0 flex-1 bg-transparent text-xs font-normal uppercase outline-none"
        />
      </span>
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid min-w-0 gap-1.5 text-xs font-semibold text-[#34413d]">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full min-w-0 rounded-md border border-[#cfd6d4] bg-white px-3 text-sm font-normal outline-none focus:border-[#0d7666]"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function TemplateThumbnail({
  id: _id,
  palette,
}: {
  id: StorefrontTemplateId;
  palette: [string, string, string];
}) {
  return (
    <div className="h-24 bg-[#edf0ef] p-2">
      <div className="h-full overflow-hidden rounded-sm bg-white shadow-sm">
        <div className="flex h-3 items-center justify-between border-b px-1.5">
          <span
            className="size-1.5 rounded-full"
            style={{ background: palette[0] }}
          />
          <span className="h-1 w-8 rounded bg-black/10" />
        </div>
        <div className="h-[calc(100%-12px)]">
          <div style={{ background: palette[2] }} className="h-7 p-1.5">
            <div className="h-1.5 w-16 bg-black/20" />
            <div className="mt-1 h-1 w-10 bg-black/10" />
          </div>
          <div className="grid grid-cols-4 gap-1 p-1.5">
            {[1, 2, 3, 4].map((item) => (
              <span
                key={item}
                className="h-7 border border-black/5"
                style={{ background: palette[2] }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
