import { Badge } from "@/components/ui/badge";
import { getPaymentStatusColor } from "@/data/customer";
import { Order } from "@prisma/client";

interface PaymentStatusBadgeProps {
  status: Order["paymentStatus"];
  size?: "sm" | "default";
}

export function PaymentStatusBadge({
  status,
  size = "default",
}: PaymentStatusBadgeProps) {
  const colorClass = getPaymentStatusColor(status);

  const statusIcons = {
    paid: "💳",
    pending: "⏳",
    refunded: "↩️",
    failed: "❌",
  };

  return (
    <Badge
      variant="outline"
      className={`${colorClass} ${size === "sm" ? "text-xs px-2 py-0.5" : ""}`}>
      <span className="mr-1">
        {statusIcons[status.toLowerCase() as keyof typeof statusIcons]}
      </span>
      {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
    </Badge>
  );
}
