import { notFound } from "next/navigation";
import type { StorefrontProduct } from "../../../../../features/storefront/runtime/types";
import StorefrontClient from "../../StorefrontClient";

interface ProductPageProps {
  params: Promise<{ subdomain: string; productId: string }>;
}

export default async function StorefrontProductPage({
  params,
}: ProductPageProps) {
  const { subdomain, productId } = await params;
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

  const [storeResponse, productResponse] = await Promise.all([
    fetch(`${apiUrl}/stores/subdomain/${subdomain}?page=1&limit=48`, {
      next: { revalidate: 5 },
    }),
    fetch(
      `${apiUrl}/stores/subdomain/${subdomain}/products/${encodeURIComponent(productId)}`,
      { next: { revalidate: 5 } },
    ),
  ]);

  if (!storeResponse.ok || !productResponse.ok) notFound();

  const [storeResult, productResult] = await Promise.all([
    storeResponse.json(),
    productResponse.json(),
  ]);
  if (!storeResult.success || !productResult.success) notFound();

  const selectedProduct = productResult.data as StorefrontProduct;
  const productMap = new Map<string, StorefrontProduct>([
    [selectedProduct.id, selectedProduct],
  ]);
  (storeResult.data.products as StorefrontProduct[]).forEach((product) =>
    productMap.set(product.id, product),
  );

  return (
    <StorefrontClient
      store={storeResult.data.store}
      products={Array.from(productMap.values())}
      initialPagination={storeResult.data.pagination}
      initialProductId={selectedProduct.id}
    />
  );
}
