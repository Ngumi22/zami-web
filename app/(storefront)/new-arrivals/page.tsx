import NewArrivals from "@/components/new-arrivals/new-arrivals-component";
import { newArrivals } from "@/data/fetch-all";

export default async function NewArrivalsPage() {
  const newProducts = await newArrivals();

  return <NewArrivals newArrivals={newProducts} />;
}
