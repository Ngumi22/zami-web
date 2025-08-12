"use client";

import Image from "next/image";
import { Edit, Trash2, Eye, Package, Tag, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Product } from "@prisma/client";
import { DataTable } from "../data-table";
import { formatCurrency } from "@/lib/utils";
import { deleteProduct } from "@/lib/product-actions";

type ProductWithCategory = Product & {
  category?: {
    name: string;
  };
};

interface ProductsTableProps {
  products: ProductWithCategory[];
}

export function ProductsTable({ products }: ProductsTableProps) {
  const router = useRouter();

  const getStockStatus = (stock: number | undefined) => {
    const stockValue = typeof stock === "number" ? stock : 0;

    if (stockValue > 10) {
      return {
        variant: "default" as const,
        className: "bg-green-100 text-green-800",
        text: `${stockValue} units`,
      };
    } else if (stockValue > 0) {
      return {
        variant: "secondary" as const,
        className: "bg-yellow-100 text-yellow-800",
        text: `${stockValue} units`,
      };
    } else {
      return {
        variant: "destructive" as const,
        className: "bg-red-100 text-red-800",
        text: "Out of stock",
      };
    }
  };

  // Column definitions
  const columns = [
    {
      key: "mainImage" as keyof Product,
      label: "Product",
      width: "300px",
      render: (value: string, product: Product) => (
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 flex-shrink-0">
            <Image
              src={value || "/placeholder.svg"}
              alt={product.name || "Product"}
              width={48}
              height={48}
              className="rounded-lg object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg?height=48&width=48";
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-gray-900 truncate">
                {product.name || "Unnamed Product"}
              </p>
              {product.variants && product.variants.length > 0 && (
                <Badge
                  variant="outline"
                  className="text-xs flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  {product.variants.length} variants
                </Badge>
              )}
            </div>

            {product.slug && (
              <p className="text-xs text-gray-400 truncate">/{product.slug}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "category" as keyof Product,
      label: "Category",
      sortable: false,
      hiddenOnBreakpoints: ["sm" as const],
      render: (_value: unknown, product: ProductWithCategory) => (
        <Badge variant="outline" className="text-xs">
          <Package className="w-3 h-3 mr-1" />
          {product.category?.name || "Uncategorized"}
        </Badge>
      ),
    },

    {
      key: "price" as keyof Product,
      label: "Price",
      sortable: true,
      render: (value: number, product: Product) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">
            {formatCurrency(value)}
          </span>
          {product.originalPrice && product.originalPrice > (value || 0) && (
            <span className="text-sm text-gray-500 line-through">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "stock" as keyof Product,
      label: "Stock",
      sortable: true,
      hiddenOnBreakpoints: ["sm" as const, "md" as const],
      render: (value: number) => {
        const stockStatus = getStockStatus(value);
        return (
          <Badge
            variant={stockStatus.variant}
            className={stockStatus.className}>
            {stockStatus.text}
          </Badge>
        );
      },
    },
    {
      key: "featured" as keyof Product,
      label: "Status",
      sortable: true,
      hiddenOnBreakpoints: ["sm" as const],
      render: (value: boolean) => (
        <Badge
          variant={value ? "default" : "secondary"}
          className={
            value ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
          }>
          {value ? "Featured" : "Regular"}
        </Badge>
      ),
    },
    {
      key: "tags" as keyof Product,
      label: "Tags",
      hiddenOnBreakpoints: ["sm" as const, "md" as const],
      searchable: true,
      render: (value: string[]) => (
        <div className="flex flex-wrap gap-1 max-w-32">
          {value && value.length > 0 ? (
            <>
              {value.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  <Tag className="w-2 h-2 mr-1" />
                  {tag}
                </Badge>
              ))}
              {value.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{value.length - 2}
                </Badge>
              )}
            </>
          ) : (
            <span className="text-xs text-gray-400">No tags</span>
          )}
        </div>
      ),
    },
  ];

  // Action definitions
  const actions = [
    {
      label: "View Product",
      onClick: (product: Product) => {
        router.push(`/admin/products/${product.slug}`);
      },
      icon: <Eye className="w-4 h-4" />,
    },

    {
      label: "Delete Product",
      onClick: async (product: Product) => {
        if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
          await deleteProduct(product.id);
        }
      },
      icon: <Trash2 className="w-4 h-4" />,
      variant: "destructive" as const,
    },
  ];

  const handleSelectionChange = (selectedProducts: Product[]) => {};

  const handleRowClick = (product: Product) => {
    router.push(`/admin/products/${product.slug}`);
  };

  return (
    <DataTable
      data={products}
      columns={columns}
      actions={actions}
      searchable={true}
      filterable={true}
      selectable={true}
      pageSize={10}
      pageSizeOptions={[5, 10, 20, 50]}
      onSelectionChange={handleSelectionChange}
      onRowClick={handleRowClick}
      emptyMessage="No products found. Create your first product to get started."
      className="bg-white"
    />
  );
}
