"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCartStore } from "@/hooks/use-cart";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CreditCard,
  Truck,
  Package,
  ShieldCheck,
  Clock,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("information");

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 100000 ? 0 : 9.99; // Free shipping over ksh 100000
  const tax = subtotal * 0.16; // 16% vat
  const total = subtotal + shipping + tax;

  const [contactInfo, setContactInfo] = useState({
    email: "",
    phone: "",
  });
  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
  });
  const [billingAddress, setBillingAddress] = useState({
    sameAsShipping: true,
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
  });
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    nameOnCard: "",
    expiration: "",
    cvc: "",
  });
  const [shippingMethod, setShippingMethod] = useState("standard");

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContactInfo({
      ...contactInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value,
    });
  };

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBillingAddress({
      ...billingAddress,
      [e.target.name]: e.target.value,
    });
  };

  const handleBillingAddressSameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setBillingAddress({
      ...billingAddress,
      sameAsShipping: e.target.checked,
    });
  };

  const handleCardDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardDetails({
      ...cardDetails,
      [e.target.name]: e.target.value,
    });
  };

  // Handle tab navigation
  const handleContinueToShipping = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveTab("shipping");
  };

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveTab("payment");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Payment processing
    setTimeout(() => {
      clearCart();
      router.push(
        "/checkout/confirmation?order=ORD-" +
          Math.floor(100000 + Math.random() * 900000)
      );
    }, 1500);
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 container px-4 py-8 md:px-6 md:py-12">
          <div className="text-center py-12">
            <h2 className="text-xl font-medium mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add some products to your cart before checking out.
            </p>
            <Link href="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 container px-4 py-8 md:px-6 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-muted-foreground">Complete your purchase</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-7">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="information">Information</TabsTrigger>
                  <TabsTrigger value="shipping">Shipping</TabsTrigger>
                  <TabsTrigger value="payment">Payment</TabsTrigger>
                </TabsList>

                <TabsContent value="information" className="space-y-6">
                  <div>
                    <h2 className="text-lg font-medium mb-4">
                      Contact Information
                    </h2>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={contactInfo.email}
                          onChange={handleContactChange}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="phone">
                          Phone (for delivery questions)
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={contactInfo.phone}
                          onChange={handleContactChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h2 className="text-lg font-medium mb-4">
                      Shipping Address
                    </h2>
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={shippingAddress.firstName}
                            onChange={handleShippingChange}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            value={shippingAddress.lastName}
                            onChange={handleShippingChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          name="address"
                          value={shippingAddress.address}
                          onChange={handleShippingChange}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="apartment">
                          Apartment, suite, etc. (optional)
                        </Label>
                        <Input
                          id="apartment"
                          name="apartment"
                          value={shippingAddress.apartment}
                          onChange={handleShippingChange}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            name="city"
                            value={shippingAddress.city}
                            onChange={handleShippingChange}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="state">State / Province</Label>
                          <Input
                            id="state"
                            name="state"
                            value={shippingAddress.state}
                            onChange={handleShippingChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="zipCode">Zip / Postal Code</Label>
                          <Input
                            id="zipCode"
                            name="zipCode"
                            value={shippingAddress.zipCode}
                            onChange={handleShippingChange}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="country">Country</Label>
                          <select
                            id="country"
                            name="country"
                            value={shippingAddress.country}
                            onChange={(e) =>
                              setShippingAddress({
                                ...shippingAddress,
                                country: e.target.value,
                              })
                            }
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm h-10"
                            required>
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                            <option value="UK">United Kingdom</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button
                      type="button"
                      onClick={handleContinueToShipping}
                      className="flex items-center gap-2">
                      Continue to Shipping <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="shipping" className="space-y-6">
                  <div>
                    <h2 className="text-lg font-medium mb-4">
                      Shipping Method
                    </h2>
                    <RadioGroup
                      value={shippingMethod}
                      onValueChange={setShippingMethod}
                      className="space-y-4">
                      <div className="flex items-center space-x-2 border rounded-md p-4 hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="standard" id="standard" />
                        <Label
                          htmlFor="standard"
                          className="flex-1 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <Truck className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">Standard Shipping</p>
                                <p className="text-sm text-muted-foreground">
                                  3-5 business days
                                </p>
                              </div>
                            </div>
                            <div className="font-medium">
                              {subtotal > 100 ? "Free" : "$9.99"}
                            </div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-md p-4 hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="express" id="express" />
                        <Label
                          htmlFor="express"
                          className="flex-1 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <Package className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">Express Shipping</p>
                                <p className="text-sm text-muted-foreground">
                                  1-2 business days
                                </p>
                              </div>
                            </div>
                            <div className="font-medium">$19.99</div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  <div>
                    <h2 className="text-lg font-medium mb-4">
                      Delivery Notes (Optional)
                    </h2>
                    <textarea
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[100px]"
                      placeholder="Add any special instructions for delivery"></textarea>
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("information")}>
                      Back to Information
                    </Button>
                    <Button
                      type="button"
                      onClick={handleContinueToPayment}
                      className="flex items-center gap-2">
                      Continue to Payment <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="payment" className="space-y-6">
                  <div>
                    <h2 className="text-lg font-medium mb-4">Payment Method</h2>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                      className="space-y-4">
                      <div className="flex items-center space-x-2 border rounded-md p-4 hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="credit-card" id="credit-card" />
                        <Label
                          htmlFor="credit-card"
                          className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Credit / Debit Card</p>
                              <p className="text-sm text-muted-foreground">
                                Visa, Mastercard, American Express
                              </p>
                            </div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-md p-4 hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="paypal" id="paypal" />
                        <Label
                          htmlFor="paypal"
                          className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="font-bold text-blue-600">
                              Pay<span className="text-blue-800">Pal</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Pay with your PayPal account
                            </p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {paymentMethod === "credit-card" && (
                    <div className="space-y-4 mt-6">
                      <div className="grid gap-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          name="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={cardDetails.cardNumber}
                          onChange={handleCardDetailsChange}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="nameOnCard">Name on Card</Label>
                        <Input
                          id="nameOnCard"
                          name="nameOnCard"
                          placeholder="John Doe"
                          value={cardDetails.nameOnCard}
                          onChange={handleCardDetailsChange}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="expiration">Expiration (MM/YY)</Label>
                          <Input
                            id="expiration"
                            name="expiration"
                            placeholder="MM/YY"
                            value={cardDetails.expiration}
                            onChange={handleCardDetailsChange}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="cvc">CVC</Label>
                          <Input
                            id="cvc"
                            name="cvc"
                            placeholder="123"
                            value={cardDetails.cvc}
                            onChange={handleCardDetailsChange}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div>
                    <h2 className="text-lg font-medium mb-4">
                      Billing Address
                    </h2>
                    <div className="flex items-center space-x-2 mb-4">
                      <Checkbox
                        id="sameAsShipping"
                        checked={billingAddress.sameAsShipping}
                        onCheckedChange={(checked) =>
                          setBillingAddress({
                            ...billingAddress,
                            sameAsShipping: checked === true,
                          })
                        }
                      />
                      <Label htmlFor="sameAsShipping">
                        Same as shipping address
                      </Label>
                    </div>

                    {!billingAddress.sameAsShipping && (
                      <div className="grid gap-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="billingFirstName">First Name</Label>
                            <Input
                              id="billingFirstName"
                              name="firstName"
                              value={billingAddress.firstName}
                              onChange={handleBillingChange}
                              required={!billingAddress.sameAsShipping}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="billingLastName">Last Name</Label>
                            <Input
                              id="billingLastName"
                              name="lastName"
                              value={billingAddress.lastName}
                              onChange={handleBillingChange}
                              required={!billingAddress.sameAsShipping}
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="billingAddress">Address</Label>
                          <Input
                            id="billingAddress"
                            name="address"
                            value={billingAddress.address}
                            onChange={handleBillingChange}
                            required={!billingAddress.sameAsShipping}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="billingApartment">
                            Apartment, suite, etc. (optional)
                          </Label>
                          <Input
                            id="billingApartment"
                            name="apartment"
                            value={billingAddress.apartment}
                            onChange={handleBillingChange}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="billingCity">City</Label>
                            <Input
                              id="billingCity"
                              name="city"
                              value={billingAddress.city}
                              onChange={handleBillingChange}
                              required={!billingAddress.sameAsShipping}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="billingState">
                              State / Province
                            </Label>
                            <Input
                              id="billingState"
                              name="state"
                              value={billingAddress.state}
                              onChange={handleBillingChange}
                              required={!billingAddress.sameAsShipping}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="billingZipCode">
                              Zip / Postal Code
                            </Label>
                            <Input
                              id="billingZipCode"
                              name="zipCode"
                              value={billingAddress.zipCode}
                              onChange={handleBillingChange}
                              required={!billingAddress.sameAsShipping}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="billingCountry">Country</Label>
                            <select
                              id="billingCountry"
                              name="country"
                              value={billingAddress.country}
                              onChange={(e) =>
                                setBillingAddress({
                                  ...billingAddress,
                                  country: e.target.value,
                                })
                              }
                              className="w-full rounded-md border bg-background px-3 py-2 text-sm h-10"
                              required={!billingAddress.sameAsShipping}>
                              <option value="US">United States</option>
                              <option value="CA">Canada</option>
                              <option value="UK">United Kingdom</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("shipping")}>
                      Back to Shipping
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>Complete Order</>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="md:col-span-5">
              <div className="bg-muted/50 rounded-lg p-6 sticky top-6">
                <h2 className="text-lg font-medium mb-4">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.key} className="flex gap-4">
                      <div className="relative h-16 w-16 overflow-hidden rounded-md border bg-muted">
                        {item.mainImage && (
                          <Image
                            src={item.mainImage || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col justify-center">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <p>Qty: {item.quantity}</p>
                          {/* {item.color && (
                            <>
                              <span className="mx-1">•</span>
                              <p>Color: {item.color}</p>
                            </>
                          )}
                          {item.size && (
                            <>
                              <span className="mx-1">•</span>
                              <p>Size: {item.size}</p>
                            </>
                          )} */}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Subtotal</p>
                    <p>${subtotal.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Shipping</p>
                    <p>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Tax</p>
                    <p>${tax.toFixed(2)}</p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between font-medium text-lg">
                  <p>Total</p>
                  <p>${total.toFixed(2)}</p>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="h-5 w-5 text-green-600" />
                    <p>Secure checkout with SSL encryption</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <p>Orders ship within 1-2 business days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
