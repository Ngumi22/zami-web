import Deals from "@/components/deals/deals-component";
import { discountedProducts } from "@/data/product";

export default async function DealsPage() {
  const productDeals = await discountedProducts();

  return <Deals productDeals={productDeals} />;
}
