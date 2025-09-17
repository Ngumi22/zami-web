"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

import CardWrapper from "./card-wrapper";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import FormError from "./form-error";
import { Button } from "../ui/button";
import { FormSuccess } from "./form-success";

import { useAuthState } from "@/hooks/useAuthState";
import { authClient } from "@/lib/auth/auth.client";
import { requestOTP } from "@/lib/auth/request-otp";

export const twoFactorSchema = z.object({
  code: z
    .string({ message: "Code is required" })
    .min(6, { message: "It requires minimum 6 characters" })
    .max(6, { message: "Code should not exceed 6 characters" })
    .regex(/^\d{6}$/, { message: "Code must be exactly 6 numeric digits" }),
});

const TwoFactor: React.FC = () => {
  const router = useRouter();
  const {
    error,
    success,
    loading,
    setSuccess,
    setError,
    setLoading,
    resetState,
  } = useAuthState();

  const form = useForm<z.infer<typeof twoFactorSchema>>({
    mode: "onBlur",
    resolver: zodResolver(twoFactorSchema),
    defaultValues: { code: "" },
  });

  const handleResendOTP = async () => {
    resetState();
    setLoading(true);

    try {
      const response = await requestOTP();

      if (response?.data) {
        setSuccess("OTP has been sent to your email.");
      } else if (response?.error) {
        setError(response.error.message);
      }
    } catch (err) {
      console.error("Error requesting OTP:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: z.infer<typeof twoFactorSchema>) => {
    resetState();
    setLoading(true);

    try {
      await authClient.twoFactor.verifyOtp(
        { code: values.code },
        {
          onRequest: () => setLoading(true),
          onResponse: () => setLoading(false),
          onSuccess: () => {
            setSuccess("OTP validated successfully.");
            router.replace("/");
          },
          onError: (ctx) => setError(ctx.error.message),
        }
      );
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setError("Unable to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardWrapper
      cardTitle="Two-Factor Authentication"
      cardDescription="Verify your identity with a one-time password."
      cardFooterDescription="Entered the wrong email?"
      cardFooterLink="/login"
      cardFooterLinkTitle="Login">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>One-Time Password</FormLabel>
                <InputOTP
                  maxLength={6}
                  pattern={REGEXP_ONLY_DIGITS}
                  {...field}
                  disabled={loading}>
                  <InputOTPGroup>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            onClick={handleResendOTP}
            variant="link"
            className="text-xs underline ml-60"
            disabled={loading}>
            Resend OTP
          </Button>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button type="submit" disabled={loading} className="w-full mt-4">
            Verify
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default TwoFactor;
