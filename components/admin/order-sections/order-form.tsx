"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Trash2,
  AlertCircle,
  ArrowLeft,
  Package,
  User,
  CreditCard,
  Truck,
} from "lucide-react";
import { updateOrder, updateOrderStatus } from "@/lib/order-actions";
import { useToast } from "@/hooks/use-toast";
import { Order, OrderItem, ShippingAddress } from "@prisma/client";
interface OrderFormProps {
  order: Order;
}

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  COMPLETED: "bg-green-100 text-green-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

const paymentStatusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
  OVERDUE: "bg-red-100 text-red-800",
};

const statusTransitions = {
  PENDING: ["processing", "cancelled"],
  PROCESSING: ["shipped", "cancelled"],
  SHIPPED: ["delivered", "cancelled"],
  DELIVERED: ["completed", "refunded"],
  CANCELLED: [],
  COMPLETED: ["refunded"],
  REFUNDED: [],
};

export default function OrderForm({ order }: OrderFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [customerId, setCustomerId] = useState(order.customerId);
  const [customerName, setCustomerName] = useState(order.customerName);
  const [customerEmail, setCustomerEmail] = useState(order.customerEmail);
  const [status, setStatus] = useState(order.status);
  const [items, setItems] = useState<OrderItem[]>(order.items);
  const [tax, setTax] = useState(order.tax);
  const [shipping, setShipping] = useState(order.shipping);
  const [discount, setDiscount] = useState(order.discount);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(
    order.shippingAddress
  );
  const [paymentMethod, setPaymentMethod] = useState(order.paymentMethod);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [notes, setNotes] = useState(order.notes || "");
  const [trackingNumber, setTrackingNumber] = useState(
    order.trackingNumber || ""
  );
  const [cancelReason, setCancelReason] = useState(order.cancelReason || "");

  // Error state
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal + tax + shipping - discount;

  // Clear errors when user starts typing
  useEffect(() => {
    if (errors.customerName && customerName) {
      setErrors((prev) => ({ ...prev, customerName: [] }));
    }
  }, [customerName, errors.customerName]);

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Recalculate total for the item
    if (field === "quantity" || field === "price") {
      const item = updatedItems[index];
      updatedItems[index].total = item.quantity * item.price;
    }

    setItems(updatedItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const addItem = () => {
    const newItem: OrderItem = {
      productId: "",
      productName: "",
      variantId: null,
      variantName: null,
      sku: null,
      quantity: 1,
      price: 0,
      total: 0,
    };
    setItems([...items, newItem]);
  };

  const updateShippingAddress = (
    field: keyof ShippingAddress,
    value: string
  ) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
  };

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        // Clear previous errors
        setErrors({});

        // Prepare form data
        formData.set("customerId", customerId ?? "");
        formData.set("customerName", customerName);
        formData.set("customerEmail", customerEmail);
        formData.set("status", status);
        formData.set("items", JSON.stringify(items));
        formData.set("subtotal", subtotal.toString());
        formData.set("tax", tax.toString());
        formData.set("shipping", shipping.toString());
        formData.set("discount", discount.toString());
        formData.set("total", total.toString());
        formData.set("shippingAddress", JSON.stringify(shippingAddress));
        formData.set("paymentMethod", paymentMethod);
        formData.set("paymentStatus", paymentStatus);
        formData.set("notes", notes);
        formData.set("trackingNumber", trackingNumber);
        formData.set("cancelReason", cancelReason);

        const result = await updateOrder(order.id, formData);

        if (result.success) {
          toast({
            title: "Order updated",
            description: result.message,
          });
          router.push("/admin/orders");
          router.refresh();
        } else {
          if (result.errors) {
            console.log("Validation errors:", result.errors);
            setErrors(result.errors);
          }
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Form submission error:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    });
  }

  async function handleStatusChange(newStatus: string) {
    startTransition(async () => {
      try {
        const result = await updateOrderStatus(order.id, newStatus);
        if (result.success) {
          setStatus(newStatus as any);
          toast({
            title: "Status updated",
            description: result.message,
          });
        } else {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update status",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="h-8 px-2">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
      </div>

      {/* Order Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Order {order.orderNumber}
          </h1>
          <p className="text-muted-foreground mt-1">
            Created {order.createdAt.toLocaleDateString()} • Last updated{" "}
            {order.updatedAt.toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className={statusColors[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
          <Badge className={paymentStatusColors[paymentStatus]}>
            {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
          </Badge>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={status} disabled>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
              {statusTransitions[status]?.map((newStatus) => (
                <SelectItem key={newStatus} value={newStatus}>
                  Change to{" "}
                  {newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-8">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerId">
                  Customer ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="customerId"
                  value={customerId ?? ""}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className={errors.customerId ? "border-destructive" : ""}
                  required
                />
                {errors.customerId && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.customerId[0]}</AlertDescription>
                  </Alert>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerName">
                  Customer Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={errors.customerName ? "border-destructive" : ""}
                  required
                />
                {errors.customerName && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {errors.customerName[0]}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">
                  Customer Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className={errors.customerEmail ? "border-destructive" : ""}
                  required
                />
                {errors.customerEmail && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {errors.customerEmail[0]}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Items
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label>Product ID</Label>
                      <Input
                        value={item.productId}
                        onChange={(e) =>
                          updateItem(index, "productId", e.target.value)
                        }
                        placeholder="Enter product ID"
                      />
                    </div>
                    <div>
                      <Label>Product Name</Label>
                      <Input
                        value={item.productName}
                        onChange={(e) =>
                          updateItem(index, "productName", e.target.value)
                        }
                        placeholder="Enter product name"
                      />
                    </div>
                    <div>
                      <Label>SKU</Label>
                      <Input
                        value={item.sku || ""}
                        onChange={(e) =>
                          updateItem(index, "sku", e.target.value)
                        }
                        placeholder="Enter SKU"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label>Variant ID</Label>
                      <Input
                        value={item.variantId || ""}
                        onChange={(e) =>
                          updateItem(index, "variantId", e.target.value)
                        }
                        placeholder="Enter variant ID"
                      />
                    </div>
                    <div>
                      <Label>Variant Name</Label>
                      <Input
                        value={item.variantName || ""}
                        onChange={(e) =>
                          updateItem(index, "variantName", e.target.value)
                        }
                        placeholder="Enter variant name"
                      />
                    </div>
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "quantity",
                            Number.parseInt(e.target.value) || 1
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label>Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.price}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "price",
                            Number.parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Item Total: ${item.total.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            {errors.items && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.items[0]}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Pricing & Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Pricing & Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Input
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select
                  value={paymentStatus}
                  onValueChange={(value) =>
                    setPaymentStatus(value as typeof paymentStatus)
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="tax">Tax Amount</Label>
                <Input
                  id="tax"
                  type="number"
                  step="0.01"
                  min="0"
                  value={tax}
                  onChange={(e) =>
                    setTax(Number.parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <div>
                <Label htmlFor="shipping">Shipping Cost</Label>
                <Input
                  id="shipping"
                  type="number"
                  step="0.01"
                  min="0"
                  value={shipping}
                  onChange={(e) =>
                    setShipping(Number.parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <div>
                <Label htmlFor="discount">Discount</Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={discount}
                  onChange={(e) =>
                    setDiscount(Number.parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping:</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount:</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Shipping & Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={shippingAddress.fullName}
                  onChange={(e) =>
                    updateShippingAddress("fullName", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={shippingAddress.phone || ""}
                  onChange={(e) =>
                    updateShippingAddress("phone", e.target.value)
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="addressLine1">Address Line 1</Label>
              <Input
                id="addressLine1"
                value={shippingAddress.addressLine1}
                onChange={(e) =>
                  updateShippingAddress("addressLine1", e.target.value)
                }
              />
            </div>

            <div>
              <Label htmlFor="addressLine2">Address Line 2</Label>
              <Input
                id="addressLine2"
                value={shippingAddress.addressLine2 || ""}
                onChange={(e) =>
                  updateShippingAddress("addressLine2", e.target.value)
                }
              />
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={shippingAddress.city}
                  onChange={(e) =>
                    updateShippingAddress("city", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={shippingAddress.state}
                  onChange={(e) =>
                    updateShippingAddress("state", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={shippingAddress.postalCode}
                  onChange={(e) =>
                    updateShippingAddress("postalCode", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={shippingAddress.country}
                  onChange={(e) =>
                    updateShippingAddress("country", e.target.value)
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="trackingNumber">Tracking Number</Label>
              <Input
                id="trackingNumber"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notes & Cancel Reason */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="notes">Order Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this order..."
                rows={3}
              />
            </div>

            {(status === "CANCELLED" || order.cancelReason) && (
              <div>
                <Label htmlFor="cancelReason">Cancel Reason</Label>
                <Textarea
                  id="cancelReason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Reason for cancellation..."
                  rows={2}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Updating..." : "Update Order"}
          </Button>
        </div>
      </form>
    </div>
  );
}
