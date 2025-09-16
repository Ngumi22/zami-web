import { FlashSaleAdmin } from "@/components/admin/flash-sale/flash-sale-admin";
import { getFlashSaleCollections } from "@/data/collections/collectionsPage";
import { getAllProducts } from "@/data/product";

export default async function FlashSaleAdminPage() {
  const [products, collections] = await Promise.all([
    getAllProducts(),
    getFlashSaleCollections(),
  ]);

  return <FlashSaleAdmin products={products} collections={collections} />;
}
