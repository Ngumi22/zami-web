import { getFlashSaleData } from "@/data/collections/collectionsPage";
import { FlashSaleClient } from "./flash-sale-section-client";

export async function FlashSaleSection() {
  const flashSaleData = await getFlashSaleData();

  if (!flashSaleData) {
    return null;
  }

  return (
    <FlashSaleClient
      products={flashSaleData.products}
      saleEndDate={flashSaleData.saleEndDate}
      collectionName={flashSaleData.collectionName}
    />
  );
}
