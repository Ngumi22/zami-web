import dynamic from "next/dynamic";

const HomePageClient = dynamic(
  () => import("@/components/products/homepage-client")
);

export default function HomePage() {
  return <HomePageClient />;
}
