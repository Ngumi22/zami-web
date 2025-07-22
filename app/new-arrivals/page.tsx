import NewArrivals from "@/components/new-arrivals/new-arrivals-component";
import { newArrivals } from "@/data/product";

export default async function NewArrivalsPage() {
  const newProducts = await newArrivals();

  return <NewArrivals newArrivals={newProducts} />;
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};
