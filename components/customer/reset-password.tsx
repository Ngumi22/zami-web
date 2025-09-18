"use client";

import React, { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import CardWrapper from "./card-wrapper";
import { useAuthState } from "@/hooks/useAuthState";
import FormError from "./form-error";
import { FormSuccess } from "./form-success";
import { authClient } from "@/lib/auth/auth.client";
import { ResetPasswordSchema } from "@/lib/auth/schemas";

const ResetPassword = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    error,
    success,
    loading,
    setError,
    setLoading,
    setSuccess,
    resetState,
  } = useAuthState();

  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof ResetPasswordSchema>) => {
    if (!token) {
      setError("No reset token found in URL.");
      return;
    }

    try {
      await authClient.resetPassword(
        {
          newPassword: values.password,
          token: token,
        },
        {
          onResponse: () => {
            setLoading(false);
          },
          onRequest: () => {
            resetState();
            setLoading(true);
          },
          onSuccess: () => {
            setSuccess("New password has been created");
            router.replace("/account/signin");
          },
          onError: (ctx) => {
            setError(ctx.error.message);
          },
        }
      );
    } catch (error) {
      setError("Something went wrong");
    }
  };

  useEffect(() => {
    if (!token) {
      setError(
        "No reset token found in URL. Please request a new password reset link."
      );
    }
  }, [token, setError]);

  return (
    <CardWrapper
      cardTitle="Reset Password"
      cardDescription="create a new password"
      cardFooterLink="/account/signin"
      cardFooterDescription="Remember your password?"
      cardFooterLinkTitle="Signin">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    type="password"
                    placeholder="************"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    disabled={loading}
                    type="password"
                    placeholder="*************"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button
            type="submit"
            className="w-full "
            disabled={loading || !token}>
            Submit
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default ResetPassword;
