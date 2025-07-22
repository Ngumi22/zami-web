import { Badge } from "@/components/ui/badge";

interface OrderStatusBadgeProps {
  status: string;
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const statusMap: Record<
    string,
    {
      label: string;
      variant: "default" | "secondary" | "destructive" | "outline";
      size: "sm" | "lg" | "xl";
    }
  > = {
    PENDING: { label: "Pending", variant: "secondary", size: "sm" },
    PROCESSING: { label: "Processing", variant: "default", size: "sm" },
    SHIPPED: { label: "Shipped", variant: "default", size: "sm" },
    DELIVERED: { label: "Delivered", variant: "default", size: "sm" },
    CANCELLED: { label: "Cancelled", variant: "destructive", size: "sm" },
  };

  const { label, variant } = statusMap[status] || {
    label: status,
    variant: "outline",
  };

  return <Badge variant={variant}>{label}</Badge>;
}
