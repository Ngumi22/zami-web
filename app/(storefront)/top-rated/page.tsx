import TopRatedComponent from "@/components/top-rated/top-rated-component";
import { getTopRatedProducts } from "@/data/product";

export default async function TopRatedPage() {
  const topRatedProducts = await getTopRatedProducts();

  return <TopRatedComponent topRated={topRatedProducts} />;
}
