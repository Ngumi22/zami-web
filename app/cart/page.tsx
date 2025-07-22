import { CartItems } from "@/components/cart/cart-items";
import { CartSummary } from "@/components/cart/cart-summary";

export default function CartPage() {
  return (
    <div className="flex-1 container mx-auto px-4 py-8 min-h-screen">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CartItems />
        </div>
        <div>
          <CartSummary />
        </div>
      </div>
    </div>
  );
}
