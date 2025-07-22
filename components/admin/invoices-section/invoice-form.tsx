"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, AlertCircle, CheckCircle2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Package } from "lucide-react";
import {
  createInvoiceAction,
  InvoiceActionState,
  updateInvoiceAction,
} from "@/lib/invoice-actions";
import { formatCurrency } from "@/lib/utils";
import { Customer, Invoice, InvoiceItem, Product } from "@prisma/client";

interface InvoiceFormProps {
  products: Product[];
  customers: Customer[];
  invoice?: Invoice;
  mode: "create" | "edit";
}

const initialState: InvoiceActionState = {
  success: undefined,
  message: "",
  errors: {},
};

export default function InvoiceForm({
  products,
  customers,
  invoice,
  mode,
}: InvoiceFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [taxRate, setTaxRate] = useState(0.16);
  const [shippingCost, setShippingCost] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<
    "PAID" | "PENDING" | "OVERDUE"
  >("PENDING");

  const [state, formAction, isPending] = useActionState(
    mode === "edit" && invoice
      ? updateInvoiceAction.bind(null, invoice.id)
      : createInvoiceAction,
    initialState
  );

  useEffect(() => {
    if (mode === "edit" && invoice) {
      setItems(invoice.items);
      setSelectedCustomer(invoice.customer.email);
      if (
        invoice.paymentStatus === "PAID" ||
        invoice.paymentStatus === "PENDING" ||
        invoice.paymentStatus === "OVERDUE"
      ) {
        setPaymentStatus(invoice.paymentStatus);
      } else {
        setPaymentStatus("PENDING");
      }
      setShippingCost(invoice.shipping);
      setDiscountAmount(invoice.discount);

      if (invoice.subtotal > 0) {
        setTaxRate(invoice.tax / invoice.subtotal);
      }
    }
  }, [invoice, mode]);

  useEffect(() => {
    if (state.success === true) {
      toast({
        title: "Success",
        description: state.message,
      });
      router.push("/admin/invoices");
    } else if (state.success === false && state.message) {
      toast({
        title: "Error",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state.success, state.message, toast, router]);

  const addItem = () => {
    const newItem: InvoiceItem = {
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
      sku: "",
    };
    setItems([...items, newItem]);
  };

  const updateItem = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Auto-calculate total when quantity or unit price changes
    if (field === "quantity" || field === "unitPrice") {
      updatedItems[index].total =
        updatedItems[index].quantity * updatedItems[index].unitPrice;
    }

    setItems(updatedItems);
  };

  const selectProduct = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      updateItem(index, "description", product.name);
      updateItem(index, "unitPrice", product.price);
      updateItem(index, "total", items[index].quantity * product.price);
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = (subtotal: number) => {
    return subtotal * taxRate;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    return subtotal + tax + shippingCost - discountAmount;
  };

  const generateInvoiceNumber = () => {
    return `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
  };

  const getDefaultDueDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split("T")[0];
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    formData.set("items", JSON.stringify(items));
    formData.set("subtotal", calculateSubtotal().toString());
    formData.set("tax", calculateTax(calculateSubtotal()).toString());
    formData.set("shipping", shippingCost.toString());
    formData.set("discount", discountAmount.toString());
    formData.set("total", calculateTotal().toString());
    formData.set("paymentStatus", paymentStatus);
    formData.set("paymentTerms", "Payment due within 30 days");

    // @ts-ignore
    formAction(formData);
  };

  return (
    <div className="space-y-6">
      {state.success === false && state.message && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {state.success === true && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {state.message}
          </AlertDescription>
        </Alert>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoiceNumber">
                  Invoice Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="invoiceNumber"
                  name="invoiceNumber"
                  required
                  placeholder="INV-001"
                  defaultValue={
                    mode === "edit" && invoice
                      ? invoice.invoiceNumber
                      : generateInvoiceNumber()
                  }
                  className={
                    state.errors?.invoiceNumber ? "border-red-500" : ""
                  }
                />
                {state.errors?.invoiceNumber && (
                  <p className="text-sm text-red-500 mt-1">
                    {state.errors.invoiceNumber[0]}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="invoiceDate">
                  Invoice Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="invoiceDate"
                  name="invoiceDate"
                  type="date"
                  required
                  defaultValue={
                    mode === "edit" && invoice
                      ? invoice.invoiceDate.toISOString().split("T")[0]
                      : new Date().toISOString().split("T")[0]
                  }
                  className={state.errors?.invoiceDate ? "border-red-500" : ""}
                />
                {state.errors?.invoiceDate && (
                  <p className="text-sm text-red-500 mt-1">
                    {state.errors.invoiceDate[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dueDate">
                  Due Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  required
                  defaultValue={
                    mode === "edit" && invoice
                      ? invoice.dueDate.toISOString().split("T")[0]
                      : getDefaultDueDate()
                  }
                  className={state.errors?.dueDate ? "border-red-500" : ""}
                />
                {state.errors?.dueDate && (
                  <p className="text-sm text-red-500 mt-1">
                    {state.errors.dueDate[0]}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="customerId">
                  Customer <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedCustomer}
                  onValueChange={setSelectedCustomer}
                  name="customerId"
                  required>
                  <SelectTrigger
                    className={
                      state.errors?.customerId ? "border-red-500" : ""
                    }>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{customer.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {customer.email}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {state.errors?.customerId && (
                  <p className="text-sm text-red-500 mt-1">
                    {state.errors.customerId[0]}
                  </p>
                )}
              </div>
            </div>

            {mode === "edit" && (
              <div>
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select
                  value={paymentStatus}
                  onValueChange={(value: any) => setPaymentStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      <Badge variant="secondary">Pending</Badge>
                    </SelectItem>
                    <SelectItem value="paid">
                      <Badge variant="default">Paid</Badge>
                    </SelectItem>
                    <SelectItem value="overdue">
                      <Badge variant="destructive">Overdue</Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Additional notes or terms..."
                rows={3}
                defaultValue={
                  mode === "edit" && invoice ? invoice.notes ?? "" : ""
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Invoice Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Invoice Items</CardTitle>
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
            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No items added yet</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  className="mt-2 bg-transparent">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Item
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 border rounded-lg bg-gray-50">
                    <div className="lg:col-span-4">
                      <Label className="text-xs font-medium">
                        Product/Description
                      </Label>
                      <div className="space-y-2">
                        <Select
                          onValueChange={(value) =>
                            selectProduct(index, value)
                          }>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select product..." />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="p-2">
                              <div className="flex items-center space-x-2 mb-2">
                                <Search className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  Select a product
                                </span>
                              </div>
                            </div>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {product.name}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {formatCurrency(product.price)}{" "}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Or enter custom description..."
                          value={item.description}
                          onChange={(e) =>
                            updateItem(index, "description", e.target.value)
                          }
                          className="h-9"
                        />
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <Label className="text-xs font-medium">Quantity</Label>
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
                        className="h-9"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <Label className="text-xs font-medium">Unit Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "unitPrice",
                            Number.parseFloat(e.target.value) || 0
                          )
                        }
                        className="h-9"
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <Label className="text-xs font-medium">SKU</Label>
                      <Input
                        placeholder="SKU"
                        value={item.sku || ""}
                        onChange={(e) =>
                          updateItem(index, "sku", e.target.value)
                        }
                        className="h-9"
                      />
                    </div>

                    <div className="lg:col-span-1">
                      <Label className="text-xs font-medium">Total</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.total}
                        disabled
                        className="h-9 bg-muted font-medium"
                      />
                    </div>

                    <div className="lg:col-span-1 flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeItem(index)}
                        className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Additional Costs</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="taxRate" className="text-sm">
                        Tax Rate (%)
                      </Label>
                      <Input
                        id="taxRate"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={taxRate * 100}
                        onChange={(e) =>
                          setTaxRate(
                            Number.parseFloat(e.target.value) / 100 || 0
                          )
                        }
                        className="h-9"
                      />
                    </div>

                    <div>
                      <Label htmlFor="shipping" className="text-sm">
                        Shipping ($)
                      </Label>
                      <Input
                        id="shipping"
                        type="number"
                        step="0.01"
                        min="0"
                        value={shippingCost}
                        onChange={(e) =>
                          setShippingCost(
                            Number.parseFloat(e.target.value) || 0
                          )
                        }
                        className="h-9"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="discount" className="text-sm">
                      Discount ($)
                    </Label>
                    <Input
                      id="discount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={discountAmount}
                      onChange={(e) =>
                        setDiscountAmount(
                          Number.parseFloat(e.target.value) || 0
                        )
                      }
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-medium">
                        {formatCurrency(calculateSubtotal())}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax ({(taxRate * 100).toFixed(1)}%):</span>
                      <span className="font-medium">
                        {formatCurrency(calculateTax(calculateSubtotal()))}
                      </span>
                    </div>
                    {shippingCost > 0 && (
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span className="font-medium">
                          {formatCurrency(shippingCost)}
                        </span>
                      </div>
                    )}
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span className="font-medium">
                          -{formatCurrency(discountAmount)}
                        </span>
                      </div>
                    )}
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>{formatCurrency(calculateTotal())}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending || items.length === 0}>
            {isPending
              ? mode === "edit"
                ? "Updating..."
                : "Creating..."
              : mode === "edit"
              ? "Update Invoice"
              : "Create Invoice"}
          </Button>
        </div>
      </form>
    </div>
  );
}
