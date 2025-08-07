import {
  useQuery,
  useQueries,
  keepPreviousData,
  useInfiniteQuery,
} from "@tanstack/react-query";
import {
  getAllProducts,
  getFeaturedProducts,
  getFrequentlyBoughtTogetherProducts,
  getProductById,
  getProductBySlug,
  getProductsByCategory,
  getRelatedProducts,
  newArrivals,
} from "@/data/product";
import { getBrandById } from "@/data/brands";
import { getAllCategories, getCategoryById } from "@/data/category";
import { Brand, Category, Product } from "@prisma/client";
import { getQueryClient } from "@/app/get-query-client";
import { cacheKeys } from "@/lib/cache-keys";
import {
  getProducts,
  GetProductsParams,
  ProductsResponse,
} from "@/data/product-page-product";
import {
  BrandWithProductCount,
  getAllBrands,
  getAllCategoriesWithSpecifications,
  getCategoryMaxPrice,
  OutputCategory,
} from "@/data/cat";

const queryClient = getQueryClient();

export const useCategoriesHook = () => {
  return useQuery({
    queryKey: cacheKeys.allCategoriesWithSpecifications(),
    queryFn: getAllCategoriesWithSpecifications,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

export const useCategoryMaxPrice = (categorySlug: string) => {
  return useQuery({
    queryKey: cacheKeys.maxPricePerMainCategory(categorySlug),
    queryFn: () => getCategoryMaxPrice(categorySlug),
    staleTime: 12 * 60 * 60 * 1000,
    enabled: !!categorySlug,
  });
};

export const useBrandsHook = () => {
  return useQuery({
    queryKey: cacheKeys.allBrands(),
    queryFn: getAllBrands,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

interface UseProductsInfiniteQueryOptions {
  initialParams: GetProductsParams;
  products: ProductsResponse["products"];
  totalCount: number;
  maxPrice: number;
  hasMore: boolean;
}

export function useProductsInfiniteQuery({
  initialParams,
  products,
  totalCount,
  maxPrice,
  hasMore,
}: UseProductsInfiniteQueryOptions) {
  return useInfiniteQuery<ProductsResponse>({
    queryKey: cacheKeys.filteredProducts(initialParams),
    queryFn: async ({ pageParam = 1 }) => {
      return getProducts({
        ...initialParams,
        page: pageParam as number,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.hasMore) {
        return pages.length + 1;
      }
      return undefined;
    },

    placeholderData: keepPreviousData,
    initialData: {
      pages: [
        {
          products,
          totalCount,
          maxPrice,
          hasMore,
        },
      ],
      pageParams: [1],
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 60 minutes
    refetchOnWindowFocus: false,
  });
}

export function useProductsPageData({
  initialCategories,
  initialBrands,
  initialMaxPrice,
  currentCategorySlug,
  productsQueryParams,
  initialProducts,
  initialTotalCount,
}: {
  initialCategories: OutputCategory[];
  initialBrands: BrandWithProductCount[];
  initialMaxPrice: number;
  currentCategorySlug: string;
  productsQueryParams: GetProductsParams;
  initialProducts: ProductsResponse["products"];
  initialTotalCount: number;
}) {
  const { data: maxPriceData } = useCategoryMaxPrice(currentCategorySlug);
  const categories = initialCategories;
  const brands = initialBrands;
  const maxPrice = maxPriceData ?? initialMaxPrice;

  const currentCategory =
    categories.find((cat) => cat.slug === currentCategorySlug) ||
    categories.find((cat) => cat.slug === "laptops") ||
    categories[0];

  const hasMore = initialProducts.length < initialTotalCount;

  const productsInfiniteQuery = useProductsInfiniteQuery({
    initialParams: productsQueryParams,
    products: initialProducts,
    totalCount: initialTotalCount,
    maxPrice,
    hasMore,
  });

  return {
    categories,
    brands,
    maxPrice,
    currentCategory,
    productsInfiniteQuery,
  };
}

export function useHomeData({
  initialProducts,
  initialFeatured,
  initialNewArrivals,
  initialCategories,
}: {
  initialProducts: Product[];
  initialFeatured: Product[];
  initialNewArrivals: Product[];
  initialCategories: Category[];
}) {
  const productsQuery = useQuery({
    queryKey: ["homepage", "products"],
    queryFn: () => getAllProducts(6),
    initialData: initialProducts,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 60 minutes
    refetchOnWindowFocus: false,
  });

  const featuredQuery = useQuery({
    queryKey: ["homepage", "featured"],
    queryFn: () => getFeaturedProducts(6),
    initialData: initialFeatured,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 60 minutes
    refetchOnWindowFocus: false,
  });

  const newArrivalsQuery = useQuery({
    queryKey: ["homepage", "new-arrivals"],
    queryFn: () => newArrivals(8),
    initialData: initialNewArrivals,
    staleTime: 1000 * 60 * 60, // 60 minutes
    gcTime: 1000 * 60 * 60 * 2, // 120 minutes
    refetchOnWindowFocus: false,
  });

  const categoriesQuery = useQuery({
    queryKey: ["homepage", "categories"],
    queryFn: getAllCategories,
    initialData: initialCategories,
    staleTime: 1000 * 60 * 60 * 6, // 6 hours
    gcTime: 1000 * 60 * 60 * 12, // 12 hours
    refetchOnWindowFocus: false,
  });

  return {
    products: productsQuery.data,
    featured: featuredQuery.data,
    newProducts: newArrivalsQuery.data,
    categories: categoriesQuery.data,
    queries: {
      productsQuery,
      featuredQuery,
      newArrivalsQuery,
      categoriesQuery,
    },
  };
}

export function useSingleProductData({
  slug,
  productId,
  initialProduct,
  initialRelated,
  initialSuggested,
}: {
  slug: string;
  productId?: string;
  initialProduct?: Product | null;
  initialRelated?: Product[];
  initialSuggested?: Product[];
}) {
  const productQuery = useQuery({
    queryKey: cacheKeys.productBySlug(slug),
    queryFn: () => getProductBySlug(slug),
    initialData: initialProduct,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    enabled: !!slug,
    refetchOnWindowFocus: false,
  });

  const relatedQuery = useQuery({
    queryKey: ["related-products", productId],
    queryFn: () => (productId ? getRelatedProducts(productId) : []),
    initialData: initialRelated,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
    enabled: !!productId,
    refetchOnWindowFocus: false,
  });

  const suggestedQuery = useQuery({
    queryKey: ["frequently-bought", productId],
    queryFn: () =>
      productId ? getFrequentlyBoughtTogetherProducts(productId) : [],
    initialData: initialSuggested,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
    enabled: !!productId,
    refetchOnWindowFocus: false,
  });

  return {
    product: productQuery.data,
    related: relatedQuery.data,
    suggested: suggestedQuery.data,
    queries: {
      productQuery,
      relatedQuery,
      suggestedQuery,
    },
  };
}

export function useProduct(productId: string) {
  return useQuery<Product | null>({
    queryKey: cacheKeys.product(productId),
    queryFn: () => getProductById(productId),
    enabled: !!productId,
    placeholderData: (previousData) =>
      previousData ??
      queryClient
        .getQueryData<Product[]>(cacheKeys.products())
        ?.find((p) => p.id === productId),
  });
}

export function useProducts(params: Record<string, any> = {}) {
  return useQuery<Product[]>({
    queryKey: cacheKeys.products(params),
    queryFn: () => getAllProducts(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (previousData) => previousData ?? [],
  });
}

export function useProductBySlug(slug: string, initialData?: Product | null) {
  return useQuery<Product | null>({
    queryKey: cacheKeys.productBySlug(slug),
    queryFn: () => getProductBySlug(slug),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    enabled: !!slug,
    initialData,
  });
}

export function useNewArrivals(limit: number = 10) {
  return useQuery<Product[]>({
    queryKey: cacheKeys.newArrivals(limit),
    queryFn: () => newArrivals(limit),
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 2,
    placeholderData: (previousData) =>
      previousData ??
      (queryClient
        .getQueryData<Product[]>(cacheKeys.products())
        ?.slice(0, limit) ||
        []),
  });
}

export function useFeaturedProducts(limit: number = 6) {
  return useQuery<Product[]>({
    queryKey: cacheKeys.featured(limit),
    queryFn: () => getFeaturedProducts(limit),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    placeholderData: (previousData) =>
      previousData ??
      (queryClient
        .getQueryData<Product[]>(cacheKeys.products())
        ?.filter((p: Product) => p.featured)
        .slice(0, limit) ||
        []),
  });
}

export function useBrands() {
  return useQuery<Brand[]>({
    queryKey: cacheKeys.brands(),
    queryFn: getAllBrands,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 48,
  });
}

export function useBrand(brandId: string) {
  return useQuery<Brand | null>({
    queryKey: cacheKeys.brand(brandId),
    queryFn: () => getBrandById(brandId),
    staleTime: 1000 * 60 * 60 * 12,
    gcTime: 1000 * 60 * 60 * 24,
    enabled: !!brandId,
    placeholderData: (previousData) =>
      previousData ??
      (queryClient.getQueryData<Brand[]>(cacheKeys.brands()) || []).find(
        (b: Brand) => b.id === brandId
      ) ??
      null,
  });
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: cacheKeys.categories(),
    queryFn: getAllCategories,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 48,
  });
}

export function useCategory(categoryId: string) {
  return useQuery<Category | null>({
    queryKey: cacheKeys.category(categoryId),
    queryFn: () => getCategoryById(categoryId),
    staleTime: 1000 * 60 * 60 * 12,
    gcTime: 1000 * 60 * 60 * 24,
    enabled: !!categoryId,
    placeholderData: (previousData) =>
      previousData ??
      (queryClient.getQueryData<Category[]>(cacheKeys.categories()) || []).find(
        (c: Category) => c.id === categoryId
      ) ??
      null,
  });
}

export function useProductsByCategory(categoryId: string, limit?: number) {
  return useQuery<Product[]>({
    queryKey: cacheKeys.productsByCategory(categoryId, limit),
    queryFn: () => getProductsByCategory(categoryId, limit),
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
    enabled: !!categoryId,
    placeholderData: (previousData) =>
      previousData ??
      (queryClient.getQueryData<Product[]>(cacheKeys.products()) || []).filter(
        (p: Product) => p.categoryId === categoryId
      ),
  });
}

export function useStoreInitialData() {
  return useQueries({
    queries: [
      {
        queryKey: cacheKeys.categories(),
        queryFn: getAllCategories,
        staleTime: 1000 * 60 * 60 * 24,
      },
      {
        queryKey: cacheKeys.products(),
        queryFn: () => getAllProducts(),
        staleTime: 1000 * 60 * 5,
      },
    ],
  });
}

export function useHomepageData() {
  return useQueries({
    queries: [
      {
        queryKey: cacheKeys.products(),
        queryFn: () => getAllProducts(6),
        staleTime: 1000 * 60 * 30,
      },
      {
        queryKey: cacheKeys.featured(6),
        queryFn: () => getFeaturedProducts(6),
        staleTime: 1000 * 60 * 30,
      },
      {
        queryKey: cacheKeys.newArrivals(8),
        queryFn: () => newArrivals(8),
        staleTime: 1000 * 60 * 60,
      },
      {
        queryKey: cacheKeys.categories(),
        queryFn: getAllCategories,
        staleTime: 1000 * 60 * 60 * 6,
      },
    ],
  });
}

export async function prefetchProduct(productId: string) {
  await queryClient.prefetchQuery({
    queryKey: cacheKeys.product(productId),
    queryFn: () => getProductById(productId),
  });
}

export async function prefetchCategoryProducts(categoryId: string) {
  await queryClient.prefetchQuery({
    queryKey: cacheKeys.productsByCategory(categoryId),
    queryFn: () => getProductsByCategory(categoryId),
  });
}
