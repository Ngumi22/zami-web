"use client";

import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Brand } from "@/lib/types";
import { Plus, Edit, Trash2, Eye, Folder } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { deleteBrand } from "@/lib/brand-actions";

export default function BrandsTable({ brands }: { brands: any[] }) {
  const router = useRouter();
  const columns = [
    {
      key: "name" as const,
      label: "Name",
      sortable: true,
    },
    {
      key: "logo" as keyof Brand,
      label: "Image",
      width: "80px",
      render: (value: string, brand: Brand) => (
        <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
          {value ? (
            <Image
              src={value || "/placeholder.svg"}
              alt={brand.name}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <Folder className="w-6 h-6 text-gray-400" />
          )}
        </div>
      ),
    },
    {
      key: "slug" as const,
      label: "Slug",
      sortable: true,
    },
    {
      key: "description" as const,
      label: "Description",
      render: (value: string) => (
        <span className="text-sm text-gray-600 truncate max-w-xs block">
          {value || "No description"}
        </span>
      ),
    },
  ];

  const actions = [
    {
      label: "View Details",
      onClick: (brand: Brand) => {
        router.push(`/admin/brands/${brand.id}`);
      },
      icon: <Eye className="w-4 h-4" />,
    },
    {
      label: "Edit brand",
      onClick: (brand: Brand) => {
        router.push(`/admin/brands/${brand.id}/edit`);
      },
      icon: <Edit className="w-4 h-4" />,
    },
    {
      label: "Delete brand",
      onClick: async (brand: Brand) => {
        if (confirm(`Are you sure you want to delete "${brand.name}"?`)) {
          await deleteBrand(brand.id);
        }
      },
      icon: <Trash2 className="w-4 h-4" />,
      variant: "destructive" as const,
    },
  ];

  const handleSelectionChange = (selectedBrands: Brand[]) => {
    console.log("Selected brands:", selectedBrands);
    // Implement bulk actions here
  };

  const handleRowClick = (brand: Brand) => {
    router.push(`/admin/brands/${brand.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Brands</h1>
          <p className="text-gray-600">Manage product brands</p>
        </div>
        <Link href="/admin/brands/new">
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Brand
          </Button>
        </Link>
      </div>

      <DataTable
        data={brands}
        columns={columns}
        actions={actions}
        searchable={true}
        filterable={true}
        selectable={true}
        pageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
        onSelectionChange={handleSelectionChange}
        onRowClick={handleRowClick}
        emptyMessage={
          "No brands found. Create your first brand to get started."
        }
        className="bg-white"
      />
    </div>
  );
}
