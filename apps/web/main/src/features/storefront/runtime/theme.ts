import type { StorefrontConfig } from "../config";
import type { CSSProperties } from "react";
import { FALLBACK_BANNER } from "./utils";
import type { StorefrontTheme } from "./types";

export function createStorefrontTheme(
  config: StorefrontConfig,
): StorefrontTheme {
  const radius =
    config.brand.radius === "sharp"
      ? "0px"
      : config.brand.radius === "rounded"
        ? "18px"
        : "8px";
  const headingFont =
    config.brand.font_pair === "editorial"
      ? '"Palatino Linotype", "Book Antiqua", Palatino, serif'
      : config.brand.font_pair === "friendly"
        ? '"Trebuchet MS", "Avenir Next", sans-serif'
        : '"Avenir Next", "Gill Sans", sans-serif';

  return {
    logo: config.brand.logo_url || "/logo.png",
    banner: config.brand.banner_url || FALLBACK_BANNER,
    radius,
    headingFont,
    style: {
      "--sf-primary": config.brand.primary_color,
      "--sf-accent": config.brand.accent_color,
      "--sf-bg": config.brand.background_color,
      "--sf-text": config.brand.text_color,
      "--sf-radius": radius,
      "--sf-heading": headingFont,
    } as CSSProperties,
  };
}
