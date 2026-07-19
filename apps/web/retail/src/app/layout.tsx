import "./global.css";
import { ThemeProvider, MantineProvider } from "@repo/design-system/providers";
import { Metadata, Viewport } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "NexPOS - Phần mềm quản lý bán hàng",
  description:
    "Phần mềm quản lý bán hàng giúp bạn quản lý khách hàng, hóa đơn, báo cáo, ...",
  generator: "NexPOS",
  applicationName: "NexPOS",
  keywords: [
    "NexPOS",
    "Phần mềm quản lý bán hàng",
    "Phần mềm quản lý bán hàng",
    "Phần mềm quản lý bán hàng",
  ],
  authors: [{ name: "NexPOS", url: "https://nexpos.vn" }],
  creator: "NexPOS",
  publisher: "NexPOS",
  openGraph: {
    title: "NexPOS - Phần mềm quản lý bán hàng",
    description:
      "Phần mềm quản lý bán hàng giúp bạn quản lý khách hàng, hóa đơn, báo cáo, ...",
    url: "https://nexpos.vn",
    siteName: "NexPOS",
    images: [{ url: "/images/og-image.png" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="scroll-smooth"
    >
      <body className="min-h-dvh font-sans antialiased">
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
        <MantineProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            disableTransitionOnChange
            forcedTheme={"light"}
          >
            {children}
          </ThemeProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
