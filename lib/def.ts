export interface Product {
  id: string;
  name: string;
  sku?: string;
  price: number;
  image: string;
  categoryId: string;
  categoryName: string;
  mainCategoryId: string;
  mainCategoryName: string;
  brandId: string;
  brandName: string;
  specifications: Record<string, string | number>;
  rating: number;
  popularity: number;
  createdAt: string;
  isFavorite?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  specifications: CategorySpecification[];
}

export interface CategorySpecification {
  key: string;
  name: string;
  type: "checkbox" | "range";
  values?: string[];
  min?: number;
  max?: number;
  unit?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

export interface FilterState {
  category: string;
  subcategories: string[];
  brands: string[];
  priceMin: number;
  priceMax: number;
  sort: string;
  page: number;
  pageSize: number;
  specifications: Record<string, string[]>;
}

export interface ProductsPageProps {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  currentCategory: Category;
  totalProducts: number;
  maxPrice: number;
}
