import { BlogPost as Post } from "@prisma/client";

export interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number;
  originalPrice?: number;
  mainImage: string;
  thumbnailImages?: string[];
  categoryId: string;
  brandId: string;
  stock: number;
  featured: boolean;
  variants?: ProductVariant[];
  specifications: Record<string, string>;
  tags: string[];
  averageRating: number; // A calculated average of all linked reviews
  reviewCount: number; // A count of all linked reviews
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  name: string;
  type: string; // Dynamic variant type (not limited to predefined values)
  value: string;
  priceModifier: number;
  stock: number;
  sku?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  image?: string;
  children?: Category[];
  specifications: CategorySpecification[];
  isActive?: boolean;
}

export interface CategorySpecification {
  id: string;
  name: string;
  type: "TEXT" | "NUMBER" | "SELECT" | "BOOLEAN";
  required: boolean;
  options?: string[];
  unit?: string | null;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  isActive?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email: string;
  addresses?: CustomerAddress[];
  status: "active" | "inactive";
  joinDate: Date;
  totalSpent: number;
  orders?: Order[];
}

export interface CustomerAddress {
  id: string;
  customerId: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  phone?: string;
  isDefault: boolean;
  preferredCourier?: string;
}

export interface Review {
  id: string;
  customerId: string;
  productId: string;
  rating: number;
  title?: string;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  createdAt: Date;
}

export interface AdminStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  conversionRate: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  conversionGrowth: number;
  lowStockProducts: number;
  pageViews: number;
  bounceRate: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  status: "draft" | "published" | "archived";
  featuredImage?: string;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  featured: boolean;
  views: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type BlogPostWithAuthor = BlogPost & {
  author: User;
};

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  postCount: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "completed"
  | "refunded";

export interface OrderItem {
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  price: number;
  total: number;
  sku?: string;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderWithCustomer extends Order {
  customer?: Customer;
}

export interface CustomerWithOrders extends Customer {
  orders: Order[];
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  notes?: string;
  trackingNumber?: string;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
}

export type OrderStats = {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
} & {
  [K in OrderStatus as `${Lowercase<K>}Orders`]: number;
};

export interface NewInvoice {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceCustomer {
  id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type PaymentStatus =
  | "paid"
  | "pending"
  | "overdue"
  | "cancelled"
  | "refunded";

export interface Invoice {
  id: string;
  orderNumber: string;
  customer: InvoiceCustomer;
  invoiceDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  totalAmount: number; // For backward compatibility
  paymentStatus: PaymentStatus;
}

// Optional: For API responses where dates might be strings
export interface SerializedInvoice
  extends Omit<Invoice, "invoiceDate" | "dueDate"> {
  invoiceDate: string;
  dueDate: string;
}

export type MinimalProduct = Pick<
  Product,
  | "id"
  | "name"
  | "price"
  | "mainImage"
  | "slug"
  | "stock"
  | "variants"
  | "categoryId"
  | "specifications"
>;

export interface TopProducts {
  id: string;
  product: MinimalProduct;
  sales: number;
  revenue: number;
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  limit?: string | number;
  specifications?: Record<string, string>;
  averageRating?: string | number;
  sort?: string;
}

// For useActionState
export type FormState = {
  errors?: {
    [key: string]: string[];
  };
  message?: string;
  success?: boolean;
};

export interface ActionResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface Invoice {
  id: string;
  orderNumber: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  customer: InvoiceCustomer;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  notes?: string;
  paymentTerms?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  sku?: string;
}

export interface InvoiceFormData {
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  customerId: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  notes?: string;
  paymentTerms?: string;
  paymentStatus: "paid" | "pending" | "overdue";
}

export interface BlogActionState {
  success?: boolean;
  message: string;
  errors: Record<string, string[]>;
  data?: { slug: string };
}

export interface BlogSearchParams {
  query?: string;
  category?: string;
  status?: string;
  author?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "publishedAt" | "title" | "views";
  sortOrder?: "asc" | "desc";
}

export interface BlogSearchResult {
  posts: Post[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  categories: string[];
  authors: string[];
  allTags: string[];
}

export type OrderFilters = {
  customerId: string;
  search?: string;
  status?: Order["status"] | "all";
  paymentStatus?: Order["paymentStatus"] | "all";
  sortBy?: "orderNumber" | "createdAt" | "total" | "status";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
};

export type OrdersResponse = {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: OrderFilters;
  summary: {
    totalOrders: number;
    totalValue: number;
    averageOrderValue: number;
    statusCounts: Record<Order["status"], number>;
    paymentStatusCounts: Record<Order["paymentStatus"], number>;
  };
};

export interface CustomerAddress {
  id: string;
  customerId: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  phone?: string;
  isDefault: boolean;
  preferredCourier?: string;
}
