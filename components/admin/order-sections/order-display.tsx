"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Edit,
  ArrowLeft,
  Package,
  User,
  Calendar,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { refundOrder } from "@/lib/order-actions";
import { RefundReasonModal } from "./refund-reason-modal";

interface OrderDisplayProps {
  order: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
    paymentMethod: string;
    paymentStatus: PaymentStatus;
    customerName: string;
    customerEmail: string;
    createdAt: Date;
    updatedAt: Date;
    shippingAddress: Record<string, any>;
    customer?: {
      id: string;
      name: string;
      email: string;
      addresses?: string[];
    };
    items: Array<{
      sku?: string;
      productId: string;
      productName: string;
      variantId?: string;
      variantName?: string;
      quantity: number;
      price: number;
      total: number;
    }>;
  };
}

export function OrderDisplay({ order }: OrderDisplayProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [loadingRefund, setLoadingRefund] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateSubtotal = () => {
    return order.items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0;
  };

  const handleRefundConfirm = async (reason: string) => {
    setLoadingRefund(true);
    try {
      await refundOrder(order.id, reason);
      router.refresh();
      setShowModal(false);
    } catch (error) {
      alert("Refund failed: " + (error as Error).message);
    } finally {
      setLoadingRefund(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Order {order.id}
            </h1>
            <p className="text-muted-foreground">Order Details and Status</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/orders/${order.id}/edit`}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Order
          </Link>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Order Status</CardTitle>
            <Package className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(order.status)}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Order Date</CardTitle>
            <Calendar className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {order.createdAt.toISOString().split("T")[0]}
            </div>
            <p className="text-xs text-muted-foreground">
              {order.createdAt.toISOString().split("T")[1].slice(0, 5)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <CreditCard className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(order.total)}
            </div>
            <p className="text-xs text-muted-foreground">
              Including tax and fees
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Info */}
      {order.customer && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-sm text-muted-foreground">
                  {order.customer.name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">
                  {order.customer.email}
                </p>
              </div>
            </div>
            {order.customer.addresses && (
              <div>
                <p className="text-sm font-medium">Address</p>
                <p className="text-sm text-muted-foreground">
                  {order.customer.addresses}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{item.productName}</h4>
                  {item.variantName && (
                    <p className="text-sm text-muted-foreground">
                      Variant: {item.variantName}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity} × {formatCurrency(item.price)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${item.total.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="space-y-2 max-w-sm ml-auto">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{formatCurrency(calculateSubtotal())}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax:</span>
              <span>{formatCurrency(calculateTax())}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Total:</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>

          {/* Refund Button */}
          {order.paymentStatus === "PAID" && (
            <div className="mt-6 text-right">
              <Button
                variant="destructive"
                onClick={() => setShowModal(true)}
                disabled={loadingRefund}>
                {loadingRefund ? "Processing..." : "Refund Order"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <RefundReasonModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleRefundConfirm}
        loading={loadingRefund}
      />
    </div>
  );
}
