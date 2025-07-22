import { getTopProductsWithRevenue } from "@/data/product";
import { formatCurrency } from "@/lib/utils";

export async function TopProducts() {
  const topProducts = await getTopProductsWithRevenue();
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Top Products</h3>
      <div className="space-y-4">
        {topProducts.map((topProduct, index) => (
          <div
            key={topProduct.id}
            className="flex items-center justify-between py-2 border-b">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <p className="font-medium">{topProduct.name}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">
                {formatCurrency(topProduct.totalRevenue)}
              </p>
              <p className="font-medium">{topProduct.totalUnitsSold}</p>
              <p className="text-sm text-gray-600">{topProduct.sales} sales</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
