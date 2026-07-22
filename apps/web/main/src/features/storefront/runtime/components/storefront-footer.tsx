"use client";

import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import {
  ChevronDown,
  Clock3,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Music2,
  Phone,
  Youtube,
} from "lucide-react";
import type { StorefrontConfig } from "../../config";
import type { StorefrontStore } from "../types";

interface StorefrontFooterProps {
  store: StorefrontStore;
  config: StorefrontConfig;
  headingFont: string;
}

interface FooterLink {
  label: string;
  href: string;
}

function parseLinks(value: string): FooterLink[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, href] = line.split("|");
      return { label: (label || "").trim(), href: href?.trim() || "#" };
    });
}

function LinkList({ links }: { links: FooterLink[] }) {
  return (
    <ul className="grid gap-3 text-sm leading-6 text-[#687080]">
      {links.map((link, index) => (
        <li key={`${link.label}-${index}`} className="flex gap-3">
          <span className="mt-[0.65rem] size-1 shrink-0 rounded-full bg-[#596273]" />
          <a
            href={link.href}
            className="transition hover:text-[var(--sf-primary)]"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

function MobileSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <details className="group border-b border-[#eceef1]">
      <summary className="flex cursor-pointer list-none items-center justify-between py-5 text-sm font-bold uppercase marker:content-none">
        {title}
        <ChevronDown className="size-4 transition-transform duration-300 group-open:rotate-180" />
      </summary>
      <div className="pb-6">{children}</div>
    </details>
  );
}

export function StorefrontFooter({ store, config }: StorefrontFooterProps) {
  const [newsletterSent, setNewsletterSent] = useState(false);
  const companyTitle = config.footer.company_title.trim() || store.name;
  const aboutLinks = parseLinks(config.footer.about_links);
  const supportLinks = parseLinks(config.footer.support_links);
  const policyLinks = parseLinks(config.footer.policy_links);
  const address = [store.address, store.state, store.city]
    .filter(Boolean)
    .join(", ");

  const submitNewsletter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    setNewsletterSent(true);
  };

  const companyContent = (
    <div className="grid gap-3 text-sm leading-6 text-[#687080]">
      {store.description && <p>{store.description}</p>}
      {config.footer.show_contact && address && (
        <p className="flex items-start gap-2.5">
          <MapPin className="mt-1 size-4 shrink-0" />
          <span>{address}</span>
        </p>
      )}
      {config.footer.show_business_hours && (
        <p className="flex items-start gap-2.5">
          <Clock3 className="mt-1 size-4 shrink-0" />
          <span>{store.business_hour || "Giờ mở cửa đang cập nhật"}</span>
        </p>
      )}
      {config.footer.show_contact && store.phone_number && (
        <a
          href={`tel:${store.phone_number}`}
          className="flex items-center gap-2.5 transition hover:text-[var(--sf-primary)]"
        >
          <Phone className="size-4 shrink-0" /> {store.phone_number}
        </a>
      )}
      {config.footer.show_contact && config.footer.contact_email && (
        <a
          href={`mailto:${config.footer.contact_email}`}
          className="flex items-center gap-2.5 transition hover:text-[var(--sf-primary)]"
        >
          <Mail className="size-4 shrink-0" /> {config.footer.contact_email}
        </a>
      )}
    </div>
  );

  return (
    <footer className="border-t border-[#eceef1] bg-white text-[var(--sf-text)]">
      {config.footer.show_newsletter && (
        <div className="border-b border-[#eceef1]">
          <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-7 px-5 py-8 sm:px-8 lg:flex-row lg:px-12 lg:py-9">
            <form
              onSubmit={submitNewsletter}
              className="flex w-full max-w-2xl flex-col items-center gap-3 sm:flex-row lg:max-w-none lg:w-auto"
            >
              <label
                htmlFor="storefront-newsletter-email"
                className="shrink-0 text-base font-bold lg:mr-6"
              >
                {config.footer.newsletter_title}
              </label>
              <input
                id="storefront-newsletter-email"
                type="email"
                name="email"
                required
                disabled={newsletterSent}
                placeholder={config.footer.newsletter_placeholder}
                className="h-11 w-full border border-[#dfe2e7] bg-white px-4 text-sm outline-none transition placeholder:text-[#9ca1ac] focus:border-[var(--sf-primary)] sm:w-72"
                style={{ borderRadius: "var(--sf-radius)" }}
              />
              <button
                type="submit"
                disabled={newsletterSent}
                className="h-11 w-full shrink-0 bg-[var(--sf-primary)] px-6 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-70 sm:w-auto"
                style={{ borderRadius: "var(--sf-radius)" }}
              >
                {newsletterSent
                  ? "Đã gửi"
                  : config.footer.newsletter_button_label}
              </button>
            </form>

            <div className="hidden items-center gap-5 lg:flex">
              <strong className="text-base">Kết nối với chúng tôi</strong>
              <div className="flex items-center gap-4 text-[#505968]">
                {config.social.facebook_url && (
                  <a
                    href={config.social.facebook_url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    className="transition hover:text-[var(--sf-primary)]"
                  >
                    <Facebook className="size-5" />
                  </a>
                )}
                {config.social.instagram_url && (
                  <a
                    href={config.social.instagram_url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="transition hover:text-[var(--sf-primary)]"
                  >
                    <Instagram className="size-5" />
                  </a>
                )}
                {config.social.youtube_url && (
                  <a
                    href={config.social.youtube_url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="YouTube"
                    className="transition hover:text-[var(--sf-primary)]"
                  >
                    <Youtube className="size-5" />
                  </a>
                )}
                {config.social.tiktok_url && (
                  <a
                    href={config.social.tiktok_url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="TikTok"
                    className="transition hover:text-[var(--sf-primary)]"
                  >
                    <Music2 className="size-5" />
                  </a>
                )}
                {config.social.zalo_url && (
                  <a
                    href={config.social.zalo_url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Zalo"
                    className="text-sm font-black transition hover:text-[var(--sf-primary)]"
                  >
                    Z
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto hidden max-w-[1440px] grid-cols-[1.45fr_1fr_1fr_1fr] gap-14 px-5 py-14 sm:px-8 lg:grid lg:px-12 lg:py-16">
        <section>
          <h2 className="mb-5 text-base font-bold uppercase">{companyTitle}</h2>
          {companyContent}
        </section>
        <section>
          <h2 className="mb-5 text-base font-bold">
            {config.footer.about_title}
          </h2>
          <LinkList links={aboutLinks} />
        </section>
        <section>
          <h2 className="mb-5 text-base font-bold">
            {config.footer.support_title}
          </h2>
          <LinkList links={supportLinks} />
        </section>
        <section>
          <h2 className="mb-5 text-base font-bold">
            {config.footer.policy_title}
          </h2>
          <LinkList links={policyLinks} />
          {config.footer.policy_text && (
            <p className="mt-4 text-sm leading-6 text-[#687080]">
              {config.footer.policy_text}
            </p>
          )}
        </section>
      </div>

      <div className="px-5 sm:px-8 lg:hidden">
        <MobileSection title={companyTitle}>{companyContent}</MobileSection>
        <MobileSection title={config.footer.about_title}>
          <LinkList links={aboutLinks} />
        </MobileSection>
        <MobileSection title={config.footer.support_title}>
          <LinkList links={supportLinks} />
        </MobileSection>
        <MobileSection title={config.footer.policy_title}>
          <LinkList links={policyLinks} />
          {config.footer.policy_text && (
            <p className="mt-4 text-sm leading-6 text-[#687080]">
              {config.footer.policy_text}
            </p>
          )}
        </MobileSection>
      </div>

      <div className="border-t border-[#eceef1] bg-[#f5f7fa] px-5 py-5 text-center text-xs text-[#727b8b] lg:text-sm">
        {config.footer.copyright_text ||
          `Copyright © ${new Date().getFullYear()} ${store.name}.`}
        {config.footer.show_powered_by && (
          <span className="ml-1">Powered by NexPOS</span>
        )}
      </div>
    </footer>
  );
}
