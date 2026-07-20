/* eslint-disable @next/next/no-img-element */
import {
  Facebook,
  Instagram,
  MapPin,
  Phone,
  Store as StoreIcon,
} from "lucide-react";
import type { StorefrontConfig } from "../../config";
import type { StorefrontStore } from "../types";

interface StorefrontFooterProps {
  store: StorefrontStore;
  config: StorefrontConfig;
  headingFont: string;
}

export function StorefrontFooter({
  store,
  config,
  headingFont,
}: StorefrontFooterProps) {
  return (
    <footer className="mt-14 border-t border-black/10 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr] lg:px-6">
        <div>
          <div className="flex items-center gap-3">
            <StoreIcon className="size-5 text-[var(--sf-primary)]" />
            <h2
              className="text-lg font-bold"
              style={{ fontFamily: headingFont }}
            >
              {store.name}
            </h2>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-6 text-black/50">
            {store.description ||
              "Cảm ơn bạn đã ghé thăm cửa hàng trực tuyến của chúng tôi."}
          </p>
          <div className="mt-5 flex gap-2">
            {config.social.facebook_url && (
              <a
                href={config.social.facebook_url}
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="grid size-10 place-items-center border border-black/12"
              >
                <Facebook className="size-4" />
              </a>
            )}
            {config.social.instagram_url && (
              <a
                href={config.social.instagram_url}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="grid size-10 place-items-center border border-black/12"
              >
                <Instagram className="size-4" />
              </a>
            )}
          </div>
        </div>
        {config.footer.show_contact && (
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-black/40">
              Liên hệ cửa hàng
            </p>
            <div className="mt-4 grid gap-3 text-sm text-black/58">
              {store.phone_number && (
                <a
                  href={`tel:${store.phone_number}`}
                  className="flex items-start gap-2"
                >
                  <Phone className="mt-0.5 size-4 shrink-0" />
                  {store.phone_number}
                </a>
              )}
              {store.address && (
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0" />
                  {store.address}
                </p>
              )}
            </div>
          </div>
        )}
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-black/40">
            Thông tin
          </p>
          <div className="mt-4 grid gap-3 text-sm text-black/58">
            {config.footer.show_business_hours && (
              <p>{store.business_hour || "Giờ mở cửa đang cập nhật"}</p>
            )}
            <p>{config.footer.policy_text}</p>
          </div>
        </div>
      </div>
      <div className="border-t border-black/8 px-4 py-4 text-center text-xs text-black/40">
        © {new Date().getFullYear()} {store.name}.
        {config.footer.show_powered_by && (
          <span className="ml-1 font-semibold text-[var(--sf-primary)]">
            Powered by NexPOS
          </span>
        )}
      </div>
    </footer>
  );
}
