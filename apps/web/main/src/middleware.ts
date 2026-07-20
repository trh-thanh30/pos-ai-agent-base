import { NextRequest, NextResponse } from "next/server";

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "api",
  "admin",
  "main",
  "auth",
  "pos",
  "assets",
  "retail",
  "dashboard",
]);

function getHostname(req: NextRequest) {
  const forwardedHost = req.headers.get("x-forwarded-host");
  const host = forwardedHost || req.headers.get("host") || "";
  return host.split(":")[0].toLowerCase();
}

function getBaseDomain(hostname: string) {
  const baseDomain = (
    process.env.NEXT_PUBLIC_STORE_BASE_DOMAIN ||
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
    (hostname.endsWith("localhost") ? "localhost" : "")
  ).toLowerCase();

  return baseDomain.split(":")[0];
}

function extractSubdomain(hostname: string) {
  const baseDomain = getBaseDomain(hostname);
  if (!baseDomain) return "";

  if (baseDomain === "localhost") {
    const parts = hostname.split(".");
    return parts.length > 1 && hostname.endsWith("localhost") ? parts[0] : "";
  }

  if (hostname === baseDomain || !hostname.endsWith(`.${baseDomain}`)) {
    return "";
  }

  const subdomain = hostname.slice(0, -(baseDomain.length + 1));
  return subdomain.includes(".") ? "" : subdomain;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hostname = getHostname(req);

  // Exclude system assets, API, and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/sites")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const subdomain = extractSubdomain(hostname);

  // Rewrite URL sang site con dựa trên subdomain
  if (subdomain && !RESERVED_SUBDOMAINS.has(subdomain)) {
    const cleanPathname = pathname === "/" ? "" : pathname;
    return NextResponse.rewrite(
      new URL(`/sites/${subdomain}${cleanPathname}`, req.url),
    );
  }

  const refreshToken = req.cookies.get("refresh_token")?.value;
  const providerId = req.cookies.get("provider_id")?.value;

  const isCreateStoreOauth = pathname.startsWith("/oauth/create-store");
  const isSelectStoreOauth = pathname.startsWith("/oauth/select-store");
  const isOauthProtectedRoute = isCreateStoreOauth || isSelectStoreOauth;
  if (!refreshToken && !providerId && isOauthProtectedRoute) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
