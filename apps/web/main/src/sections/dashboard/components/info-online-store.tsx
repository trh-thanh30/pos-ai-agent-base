"use client";
import useToast from "@repo/design-system/hooks/client/use-toast-notification";
import api from "../../../libs/axios";
import React, { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Input,
  Loading,
} from "@repo/design-system/components/ui";
import { useAtomValue } from "jotai";
import { currentStoreAtom } from "@repo/design-system/stores/auth";
import {
  Globe,
  Palette,
  Layout,
  Link2,
  Check,
  AlertCircle,
} from "lucide-react";
import useStore from "../../../hooks/store/use-store";
import { ApiResponse } from "@repo/types/response";

const TEMPLATES = [
  {
    id: "classic",
    name: "Classic Grid",
    desc: "Giao diện dạng lưới POS truyền thống, tối ưu cho tìm nhanh & xem chi tiết sản phẩm.",
    preview:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&auto=format&fit=crop&q=60",
  },
  {
    id: "ecommerce",
    name: "Modern E-commerce",
    desc: "Kiểu cửa hàng trực tuyến hiện đại với hình ảnh lớn, giỏ hàng nổi bật, tối ưu cho thời trang, mỹ phẩm.",
    preview:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&auto=format&fit=crop&q=60",
  },
  {
    id: "restaurant",
    name: "Restaurant Menu",
    desc: "Giao diện dạng danh mục thực đơn dọc, tối ưu cho quán ăn, cafe, trà sữa đặt trên thiết bị di động.",
    preview:
      "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=300&auto=format&fit=crop&q=60",
  },
];

const PRESET_COLORS = [
  { name: "Blue", value: "#2563eb" },
  { name: "Emerald", value: "#10b981" },
  { name: "Violet", value: "#7c3aed" },
  { name: "Orange", value: "#ea580c" },
  { name: "Rose", value: "#e11d48" },
];

export function InfoOnlineStore() {
  const currentStore = useAtomValue(currentStoreAtom);
  const { showSuccessToast, showErrorToast } = useToast();
  const { store, getStoreDetail } = useStore();

  const [loading, setLoading] = useState(false);
  const [subdomain, setSubdomain] = useState("");
  const [subdomainValid, setSubdomainValid] = useState<boolean | null>(null);
  const [validationMsg, setValidationMsg] = useState("");
  const [validating, setValidating] = useState(false);

  // Retail Config
  const [isPublished, setIsPublished] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [facebookLink, setFacebookLink] = useState("");
  const [tiktokLink, setTiktokLink] = useState("");

  useEffect(() => {
    if (!currentStore?.id) return;
    getStoreDetail();
  }, [currentStore?.id, getStoreDetail]);

  useEffect(() => {
    if (store) {
      setSubdomain(store.subdomain || "");

      const config = (store.retail_config as any) || {};
      setIsPublished(config.enabled === true);
      setSelectedTemplate(config.template_id || "classic");
      setPrimaryColor(config.primary_color || "#2563eb");
      setLogoUrl(config.logo_url || "");
      setBannerUrl(config.banner_url || "");
      setFacebookLink(config.facebook_url || "");
      setTiktokLink(config.tiktok_url || "");
    }
  }, [store]);

  const handleCheckSubdomain = async () => {
    if (!subdomain.trim()) {
      setSubdomainValid(false);
      setValidationMsg("Vui lòng nhập tên subdomain.");
      return;
    }

    setValidating(true);
    try {
      const params = new URLSearchParams({
        subdomain: subdomain.trim(),
      });
      if (currentStore?.id) {
        params.set("storeId", currentStore.id);
      }
      const res = await api.get<ApiResponse>(
        `/stores/subdomain/validate?${params.toString()}`,
      );
      if (res.data.success) {
        const data = res.data.data as any;
        if (data.available) {
          setSubdomainValid(true);
          setValidationMsg("Subdomain này có thể sử dụng!");
        } else {
          setSubdomainValid(false);
          setValidationMsg(data.message || "Subdomain đã tồn tại.");
        }
      }
    } catch (err: any) {
      setSubdomainValid(false);
      setValidationMsg(
        err.response?.data?.message || "Có lỗi xảy ra khi kiểm tra.",
      );
    } finally {
      setValidating(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (subdomain.trim() && subdomainValid === false) {
      showErrorToast(
        "Vui lòng sửa lỗi subdomain hoặc kiểm tra tính khả dụng trước khi lưu.",
      );
      setLoading(false);
      return;
    }

    if (isPublished && !subdomain.trim()) {
      showErrorToast("Vui lòng cấu hình subdomain trước khi bật website.");
      setLoading(false);
      return;
    }

    try {
      const optionalUrl = (value: string) => value.trim() || undefined;
      const configPayload = {
        enabled: isPublished,
        template_id: selectedTemplate,
        primary_color: primaryColor,
        logo_url: optionalUrl(logoUrl),
        banner_url: optionalUrl(bannerUrl),
        facebook_url: optionalUrl(facebookLink),
        tiktok_url: optionalUrl(tiktokLink),
      };

      const res = await api.patch<ApiResponse>(`/stores/${currentStore?.id}`, {
        subdomain: subdomain.trim() || null,
        retail_config: configPayload,
      });

      if (res.data.success) {
        showSuccessToast("Cập nhật cấu hình website online thành công!");
        getStoreDetail();
      }
    } catch (err: any) {
      showErrorToast(err.response?.data?.message || "Không thể lưu cấu hình.");
    } finally {
      setLoading(false);
    }
  };

  // Determine site link
  const configuredDomain =
    process.env.NEXT_PUBLIC_STORE_BASE_DOMAIN ||
    process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  const browserDomain =
    typeof window !== "undefined"
      ? `${window.location.hostname.includes("localhost") ? "localhost" : window.location.hostname}`
      : "localhost";
  const storeBaseDomain =
    configuredDomain ||
    (browserDomain === "localhost" ? "localhost:3001" : browserDomain);
  const protocol = storeBaseDomain.includes("localhost") ? "http" : "https";
  const domainSuffix = `.${storeBaseDomain}`;
  const siteUrl = subdomain ? `${protocol}://${subdomain}${domainSuffix}` : "";

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="text-3xl font-semibold text-pos-blue-500">
          Thiết lập Cửa hàng Online
        </h1>
        <p className="text-gray-500 text-sm">
          Cấu hình tên miền phụ, giao diện và các thông tin liên kết cho website
          bán hàng trực tuyến của bạn.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
        {/* Subdomain Section */}
        <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 font-semibold text-gray-800 text-lg">
            <Globe size={20} className="text-pos-blue-500" />
            <span>Tên miền phụ (Subdomain)</span>
          </div>

          <div className="rounded-md border border-gray-200 bg-white px-4 py-3">
            <Checkbox
              checked={isPublished}
              onChange={(event) => setIsPublished(event.currentTarget.checked)}
              label="Bật website bán hàng công khai"
              radius="sm"
            />
            <p className="mt-2 text-xs text-gray-500">
              Khi tắt, subdomain vẫn được giữ nhưng khách hàng sẽ không xem được
              storefront.
            </p>
          </div>

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Input
                label="Địa chỉ Website"
                placeholder="vi-du: shopcuatoi"
                value={subdomain}
                onChange={(e) => {
                  setSubdomain(e.target.value);
                  setSubdomainValid(null);
                  setValidationMsg("");
                }}
                radius="sm"
                className="w-full"
                rightSection={domainSuffix}
              />
            </div>
            <Button
              type="button"
              onClick={handleCheckSubdomain}
              disabled={validating || !subdomain.trim()}
              title={validating ? "Đang kiểm tra..." : "Kiểm tra"}
              variant="outline"
              size="md"
            />
          </div>

          {subdomainValid !== null && (
            <div
              className={`flex items-center gap-2 text-sm ${subdomainValid ? "text-emerald-600" : "text-rose-600"}`}
            >
              {subdomainValid ? <Check size={16} /> : <AlertCircle size={16} />}
              <span>{validationMsg}</span>
            </div>
          )}

          {subdomain && subdomainValid && siteUrl && (
            <div className="mt-2 text-sm text-gray-600">
              Đường dẫn website của bạn:{" "}
              <a
                href={siteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-pos-blue-600 font-semibold hover:underline"
              >
                {siteUrl}
              </a>
            </div>
          )}
        </div>

        {/* Template Gallery */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-semibold text-gray-800 text-lg">
            <Layout size={20} className="text-pos-blue-500" />
            <span>Mẫu giao diện (Templates)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TEMPLATES.map((tpl) => {
              const active = selectedTemplate === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className={`flex flex-col border rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                    active
                      ? "border-pos-blue-500 ring-2 ring-pos-blue-500/20 shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="h-40 bg-gray-100 relative overflow-hidden">
                    <img
                      src={tpl.preview}
                      alt={tpl.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    {active && (
                      <div className="absolute top-2 right-2 bg-pos-blue-500 text-white p-1 rounded-full">
                        <Check size={16} />
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-base mb-1">
                        {tpl.name}
                      </h3>
                      <p className="text-gray-500 text-xs leading-relaxed">
                        {tpl.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Brand Theme Customization */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 font-semibold text-gray-800 text-lg border-b pb-2">
            <Palette size={20} className="text-pos-blue-500" />
            <span>Tùy biến thương hiệu (Brand Colors & Logo)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">
                Màu sắc chủ đạo
              </label>
              <div className="flex items-center gap-3">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setPrimaryColor(c.value)}
                    style={{ backgroundColor: c.value }}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                      primaryColor === c.value
                        ? "border-gray-900 scale-110 shadow-sm"
                        : "border-transparent hover:scale-105"
                    }`}
                    title={c.name}
                  />
                ))}
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 cursor-pointer border rounded-md"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Đường dẫn Logo cửa hàng (Logo URL)"
                placeholder="https://example.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                radius="sm"
              />
              <Input
                label="Đường dẫn Banner trang chủ (Banner URL)"
                placeholder="https://example.com/banner.jpg"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                radius="sm"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-semibold text-gray-800 text-lg border-b pb-2">
            <Link2 size={20} className="text-pos-blue-500" />
            <span>Mạng xã hội & Kênh liên kết (Social Links)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Trang Facebook (Facebook URL)"
              placeholder="https://facebook.com/cuahangcuatoi"
              value={facebookLink}
              onChange={(e) => setFacebookLink(e.target.value)}
              radius="sm"
            />
            <Input
              label="Kênh TikTok (TikTok URL)"
              placeholder="https://tiktok.com/@cuahangcuatoi"
              value={tiktokLink}
              onChange={(e) => setTiktokLink(e.target.value)}
              radius="sm"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t">
          <Button
            type="submit"
            disabled={loading}
            title={loading ? <Loading /> : "Lưu thiết lập"}
            size="md"
            className="px-8"
          />
        </div>
      </form>
    </div>
  );
}
