import { notFound, redirect } from "next/navigation";
import { extractSpecifications } from "@/components/layout/products-page/new/search.params";
import {
  getCachedCategories,
  getProducts,
  getFilterData,
} from "@/data/productspage/getProducts";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import ProductsPageClient from "./ProductsPageClient";
import { SearchParams } from "nuqs/server";
import { getQueryClient } from "@/app/get-query-client";

type PageProps = {
  searchParams: SearchParams;
};

export default async function Home({ searchParams }: PageProps) {
  const params = (await searchParams) || {};

  const getSingleParam = (
    param: string | string[] | undefined
  ): string | undefined => {
    if (Array.isArray(param)) {
      return param[0] ?? undefined;
    }
    return param ?? undefined;
  };

  const specifications = extractSpecifications(params);
  const categories = await getCachedCategories();

  if (categories.length === 0) {
    return <div className="container py-24">No categories found.</div>;
  }

  const categorySlug = getSingleParam(params.category) || categories[0].slug!;
  if (!params.category) {
    redirect(`/products?category=${categorySlug}`);
  }

  const categoryExists = categories.some((c: any) => c.slug === categorySlug);
  if (!categoryExists) {
    redirect(`/products?category=${categories[0].slug!}`);
  }

  const sidebarData = await getFilterData(categorySlug);

  const productsParams = {
    category: categorySlug,
    search: getSingleParam(params.search),
    perPage: getSingleParam(params.perPage)
      ? parseInt(getSingleParam(params.perPage) as string, 10)
      : undefined,
    offset: getSingleParam(params.offset)
      ? parseInt(getSingleParam(params.offset) as string, 10)
      : undefined,
    priceMax: getSingleParam(params.priceMax)
      ? parseInt(getSingleParam(params.priceMax) as string, 10)
      : undefined,
    priceMin: getSingleParam(params.priceMin)
      ? parseInt(getSingleParam(params.priceMin) as string, 10)
      : undefined,
    subcategories: Array.isArray(params.subcategories)
      ? params.subcategories
      : params.subcategories
      ? [params.subcategories]
      : undefined,
    brands: Array.isArray(params.brands)
      ? params.brands
      : params.brands
      ? [params.brands]
      : undefined,
    specifications,
  };

  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["products", productsParams],
    queryFn: () => getProducts(productsParams),
  });

  const dehydratedState = dehydrate(queryClient);

  const initialData = {
    productsData: await getProducts(productsParams),
    categories,
    activeCategorySlug: categorySlug,
    params: productsParams,
    sidebarData,
  };

  return (
    <HydrationBoundary state={dehydratedState}>
      <ProductsPageClient initialData={initialData} />
    </HydrationBoundary>
  );
}
