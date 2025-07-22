import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaymentStatusBadge } from "@/components/payment-status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Clock,
  CreditCard,
  Package,
  Truck,
  Eye,
  Download,
  MoreHorizontal,
} from "lucide-react";
import OrderStatusBadge from "@/components/home/order-status-badge";
import { Order } from "@prisma/client";

interface MobileOrderCardProps {
  order: Order;
}

export function MobileOrderCard({ order }: MobileOrderCardProps) {
  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <Link
                href={`/admin/orders/${order.id}`}
                className="font-semibold text-base hover:underline">
                {order.orderNumber}
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{order.createdAt.toLocaleDateString()}</span>
                <span>
                  {order.createdAt.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/admin/orders/${order.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Package className="h-4 w-4 mr-2" />
                  Track Package
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.paymentStatus} size="sm" />
            <Badge variant="secondary" className="text-xs">
              {order.items.length} items
            </Badge>
          </div>

          {/* Items Preview */}
          <div className="space-y-1">
            <div className="text-sm font-medium">Items:</div>
            <div className="text-sm text-muted-foreground">
              {order.items.slice(0, 2).map((item, index) => (
                <div key={index}>
                  {item.quantity}x {item.productName}
                </div>
              ))}
              {order.items.length > 2 && (
                <div className="text-xs">
                  +{order.items.length - 2} more items
                </div>
              )}
            </div>
          </div>

          {/* Payment & Tracking */}
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <CreditCard className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Payment:</span>
              <span>{order.paymentMethod}</span>
            </div>
            {order.trackingNumber && (
              <div className="flex items-center gap-2">
                <Truck className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Tracking:</span>
                <span className="font-mono text-xs">
                  {order.trackingNumber}
                </span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="space-y-1">
              <div className="text-lg font-bold">${order.total.toFixed(2)}</div>
              {order.discount > 0 && (
                <div className="text-sm text-green-600">
                  -${order.discount.toFixed(2)} discount
                </div>
              )}
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div>Subtotal: ${order.subtotal.toFixed(2)}</div>
              {order.tax > 0 && <div>Tax: ${order.tax.toFixed(2)}</div>}
              {order.shipping > 0 && (
                <div>Shipping: ${order.shipping.toFixed(2)}</div>
              )}
            </div>
          </div>

          {/* Notes & Cancel Reason */}
          {order.notes && (
            <div className="text-sm text-muted-foreground italic bg-muted p-2 rounded">
              Note: {order.notes}
            </div>
          )}
          {order.cancelReason && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              Cancelled: {order.cancelReason}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
