import { Metadata } from "next";
import StorefrontClient from "./StorefrontClient";

interface PageProps {
  params: Promise<{ subdomain: string }>;
}

function getStorefrontUrl(subdomain: string) {
  const baseDomain =
    process.env.NEXT_PUBLIC_STORE_BASE_DOMAIN ||
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ||
    "localhost:3001";
  const protocol = baseDomain.includes("localhost") ? "http" : "https";
  return `${protocol}://${subdomain}.${baseDomain}`;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { subdomain } = await params;
  const storefrontUrl = getStorefrontUrl(subdomain);
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
    const res = await fetch(`${apiUrl}/stores/subdomain/${subdomain}?limit=1`, {
      next: { revalidate: 30 },
    });
    const result = await res.json();
    if (result.success && result.data?.store) {
      const store = result.data.store;
      const config = store.retail_config || {};
      const seo = config.seo || {};
      const logoUrl = config.brand?.logo_url || config.logo_url;
      const title = seo.title || `${store.name} - Cửa hàng Online`;
      const description =
        seo.description ||
        store.description ||
        `Chào mừng bạn đến với ${store.name}! Mua sắm sản phẩm và đặt hàng online tiện lợi.`;
      return {
        title,
        description,
        alternates: {
          canonical: storefrontUrl,
        },
        openGraph: {
          title,
          description,
          url: storefrontUrl,
          images: logoUrl ? [{ url: logoUrl }] : [],
        },
      };
    }
  } catch {
    // Ignore
  }
  return {
    title: "Cửa hàng trực tuyến",
    description: "Mua sắm trực tuyến tiện lợi và nhanh chóng.",
    alternates: {
      canonical: storefrontUrl,
    },
  };
}

export default async function SubdomainPage({ params }: PageProps) {
  const { subdomain } = await params;
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

  let storeData = null;
  let errorMsg = "";

  try {
    const res = await fetch(
      `${apiUrl}/stores/subdomain/${subdomain}?page=1&limit=48`,
      {
        next: { revalidate: 5 },
      },
    );
    const result = await res.json();
    if (result.success) {
      storeData = result.data;
    } else {
      errorMsg = result.message || "Không tìm thấy cửa hàng.";
    }
  } catch {
    errorMsg = "Lỗi kết nối máy chủ.";
  }

  if (!storeData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-center">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-md w-full">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-rose-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            Cửa hàng chưa được kích hoạt
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            {errorMsg ||
              "Subdomain này chưa được cấu hình. Vui lòng kiểm tra lại thiết lập trong trang quản trị."}
          </p>
          <a
            href={process.env.NEXT_PUBLIC_MAIN_URL || "http://localhost:3001"}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-pos-blue-600 hover:bg-pos-blue-700 text-white font-medium text-sm rounded-lg transition-colors"
          >
            Quay lại NexPOS
          </a>
        </div>
      </div>
    );
  }

  return (
    <StorefrontClient store={storeData.store} products={storeData.products} />
  );
}
