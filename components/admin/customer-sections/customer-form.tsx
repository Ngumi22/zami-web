"use client";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle2, Plus, Trash2, MapPin } from "lucide-react";
import { type ActionState, updateCustomerAction } from "@/lib/customer-actions";
import type {
  Customer as PrismaCustomer,
  CustomerAddress,
  Order,
} from "@prisma/client";

export interface CustomerWithRelations extends PrismaCustomer {
  addresses?: CustomerAddress[];
  orders?: Order[];
}

interface CustomerFormProps {
  customer: CustomerWithRelations;
}

interface AddressFormData {
  id?: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
  preferredCourier?: string;
}

const initialState: ActionState = {
  success: undefined,
  message: "",
  errors: {},
};

const emptyAddress: AddressFormData = {
  fullName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  phone: "",
  isDefault: false,
  preferredCourier: "",
};

export default function CustomerForm({ customer }: CustomerFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [state, formAction, isPending] = useActionState(
    updateCustomerAction.bind(null, customer.id),
    initialState
  );

  // Initialize addresses state
  const [addresses, setAddresses] = useState<AddressFormData[]>(() => {
    if (customer.addresses && customer.addresses.length > 0) {
      return customer.addresses.map((addr) => ({
        id: addr.id,
        fullName: addr.fullName,
        addressLine1: addr.addressLine1,
        addressLine2: addr.addressLine2 || "",
        city: addr.city,
        state: addr.state,
        postalCode: addr.postalCode || "",
        country: addr.country,
        phone: addr.phone || "",
        isDefault: addr.isDefault,
        preferredCourier: addr.preferredCourier || "",
      }));
    }
    return [{ ...emptyAddress, fullName: customer.name, isDefault: true }];
  });

  // Handle successful updates
  useEffect(() => {
    if (state.success === true) {
      toast({
        title: "Success",
        description: state.message,
      });
      router.push(`/admin/customers/${customer.id}`);
    } else if (state.success === false && state.message) {
      toast({
        title: "Error",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state.success, state.message, toast, router, customer.id]);

  const addAddress = () => {
    setAddresses([...addresses, { ...emptyAddress, fullName: customer.name }]);
  };

  const removeAddress = (index: number) => {
    if (addresses.length > 1) {
      const newAddresses = addresses.filter((_, i) => i !== index);
      // If we removed the default address, make the first one default
      if (addresses[index].isDefault && newAddresses.length > 0) {
        newAddresses[0].isDefault = true;
      }
      setAddresses(newAddresses);
    }
  };

  const updateAddress = (
    index: number,
    field: keyof AddressFormData,
    value: string | boolean
  ) => {
    const newAddresses = [...addresses];

    // If setting this address as default, unset others
    if (field === "isDefault" && value === true) {
      newAddresses.forEach((addr, i) => {
        addr.isDefault = i === index;
      });
    } else {
      (newAddresses[index] as any)[field] = value;
    }

    setAddresses(newAddresses);
  };

  const handleSubmit = async (formData: FormData) => {
    // Add addresses data to form
    addresses.forEach((address, index) => {
      Object.entries(address).forEach(([key, value]) => {
        formData.append(`addresses[${index}][${key}]`, String(value));
      });
    });

    return formAction(formData);
  };

  return (
    <div className="space-y-6">
      {/* Global Error Message */}
      {state.success === false && state.message && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {state.success === true && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {state.message}
          </AlertDescription>
        </Alert>
      )}

      <form
        action={handleSubmit}
        className="space-y-8 bg-white rounded-lg p-6 shadow-sm">
        {/* Customer Basic Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Customer Information
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Enter full name"
                defaultValue={customer.name}
                className={state.errors?.name ? "border-red-500" : ""}
              />
              {state.errors?.name && (
                <p className="text-sm text-red-500">{state.errors.name[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Enter email address"
                defaultValue={customer.email}
                className={state.errors?.email ? "border-red-500" : ""}
              />
              {state.errors?.email && (
                <p className="text-sm text-red-500">{state.errors.email[0]}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter phone number"
                defaultValue={customer.phone || ""}
                className={state.errors?.phone ? "border-red-500" : ""}
              />
              {state.errors?.phone && (
                <p className="text-sm text-red-500">{state.errors.phone[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">
                Account Status <span className="text-red-500">*</span>
              </Label>
              <Select name="status" defaultValue={customer.status}>
                <SelectTrigger
                  className={state.errors?.status ? "border-red-500" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              {state.errors?.status && (
                <p className="text-sm text-red-500">{state.errors.status[0]}</p>
              )}
            </div>
          </div>
        </div>

        {/* Customer Addresses */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Addresses ({addresses.length})
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addAddress}
              className="flex items-center gap-2 bg-transparent">
              <Plus className="h-4 w-4" />
              Add Address
            </Button>
          </div>

          <div className="space-y-6">
            {addresses.map((address, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 space-y-4 relative bg-gray-50">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    Address {index + 1}
                    {address.isDefault && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </h4>
                  {addresses.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAddress(index)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`address-${index}-fullName`}>
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`address-${index}-fullName`}
                      value={address.fullName}
                      onChange={(e) =>
                        updateAddress(index, "fullName", e.target.value)
                      }
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`address-${index}-phone`}>
                      Phone Number
                    </Label>
                    <Input
                      id={`address-${index}-phone`}
                      value={address.phone}
                      onChange={(e) =>
                        updateAddress(index, "phone", e.target.value)
                      }
                      placeholder="Enter phone number"
                      type="tel"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`address-${index}-addressLine1`}>
                    Address Line 1 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`address-${index}-addressLine1`}
                    value={address.addressLine1}
                    onChange={(e) =>
                      updateAddress(index, "addressLine1", e.target.value)
                    }
                    placeholder="Enter street address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`address-${index}-addressLine2`}>
                    Address Line 2
                  </Label>
                  <Input
                    id={`address-${index}-addressLine2`}
                    value={address.addressLine2}
                    onChange={(e) =>
                      updateAddress(index, "addressLine2", e.target.value)
                    }
                    placeholder="Apartment, suite, etc. (optional)"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`address-${index}-city`}>
                      City <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`address-${index}-city`}
                      value={address.city}
                      onChange={(e) =>
                        updateAddress(index, "city", e.target.value)
                      }
                      placeholder="Enter city"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`address-${index}-state`}>
                      State/Province <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`address-${index}-state`}
                      value={address.state}
                      onChange={(e) =>
                        updateAddress(index, "state", e.target.value)
                      }
                      placeholder="Enter state/province"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`address-${index}-postalCode`}>
                      Postal Code <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`address-${index}-postalCode`}
                      value={address.postalCode}
                      onChange={(e) =>
                        updateAddress(index, "postalCode", e.target.value)
                      }
                      placeholder="Enter postal code"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`address-${index}-country`}>
                    Country <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={`address-${index}-country`}
                    value={address.country}
                    onChange={(e) =>
                      updateAddress(index, "country", e.target.value)
                    }
                    placeholder="Enter country"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`address-${index}-preferredCourier`}>
                      Preferred Courier
                    </Label>
                    <Select
                      value={address.preferredCourier}
                      onValueChange={(value) =>
                        updateAddress(index, "preferredCourier", value)
                      }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select preferred courier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No preference</SelectItem>
                        <SelectItem value="DHL Express">DHL Express</SelectItem>
                        <SelectItem value="FedEx">FedEx</SelectItem>
                        <SelectItem value="UPS">UPS</SelectItem>
                        <SelectItem value="G4S Courier">G4S Courier</SelectItem>
                        <SelectItem value="Posta Kenya">Posta Kenya</SelectItem>
                        <SelectItem value="Sendy">Sendy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id={`address-${index}-isDefault`}
                      checked={address.isDefault}
                      onChange={(e) =>
                        updateAddress(index, "isDefault", e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <Label
                      htmlFor={`address-${index}-isDefault`}
                      className="text-sm">
                      Set as default address
                    </Label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Updating..." : "Update Customer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
