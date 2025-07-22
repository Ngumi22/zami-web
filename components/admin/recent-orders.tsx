import { getOrdersWithCustomers } from "@/data/customer";

export async function RecentOrders() {
  const orders = await getOrdersWithCustomers();
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="font-medium">{order.id}</p>
              <p className="text-sm text-gray-600">{order.customer?.name}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">${order.total}</p>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  order.status === "DELIVERED"
                    ? "bg-green-100 text-green-800"
                    : order.status === "SHIPPED"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                {order.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
