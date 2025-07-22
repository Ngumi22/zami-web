import { getBrandById } from "@/data/brands";

export default async function BrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const brand = await getBrandById(id);
  return <div>{brand?.name}</div>;
}
