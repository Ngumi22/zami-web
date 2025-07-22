"use client";

import { useActionState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { ActionState, updateCustomerAction } from "@/lib/customer-actions";
import { Customer } from "@prisma/client";

interface CustomerFormProps {
  customer: Customer;
}

const initialState: ActionState = {
  success: undefined,
  message: "",
  errors: {},
};

export default function CustomerForm({ customer }: CustomerFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [state, formAction, isPending] = useActionState(
    updateCustomerAction.bind(null, customer.id),
    initialState
  );

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
        action={formAction}
        className="space-y-6 bg-white rounded-lg p-6 shadow-sm">
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
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            {state.errors?.status && (
              <p className="text-sm text-red-500">{state.errors.status[0]}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            name="address"
            placeholder="Enter full address"
            rows={3}
            defaultValue={customer.address || ""}
            className={state.errors?.address ? "border-red-500" : ""}
          />
          {state.errors?.address && (
            <p className="text-sm text-red-500">{state.errors.address[0]}</p>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-4">
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
