export default function ProductsTableSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Product
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Category
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Price
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Stock
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Status
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Tags
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-b">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-48 animate-pulse"></div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                </td>
                <td className="py-4 px-4">
                  <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                </td>
                <td className="py-4 px-4">
                  <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex gap-1">
                    <div className="h-5 bg-gray-200 rounded w-12 animate-pulse"></div>
                    <div className="h-5 bg-gray-200 rounded w-12 animate-pulse"></div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
