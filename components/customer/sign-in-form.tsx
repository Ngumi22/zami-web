"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login } from "@/lib/auth/actions";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/auth.client";
import { SignInFormValues, SignInSchema } from "@/lib/auth/schemas";

export function CustomerSignInForm() {
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();
  const [isPending, setPending] = useState(false);

  const handleSubmit = async (values: SignInFormValues) => {
    setPending(true);
    try {
      const result = await login(values.email, values.password);

      if (result.success) {
        toast.success(result.success);
        router.push(result.redirect || "/account");
      } else {
        toast.error(result.error || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setPending(false);
    }
  };

  const handleGoogleSignIn = () => {
    authClient.signIn.social({
      provider: "google",
      callbackURL: "/account",
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Welcome back! Sign in to your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage className="min-h-[20px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage className="min-h-[20px]" />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <a
                href="/account/forgot-password"
                className="text-sm text-primary underline hover:opacity-80">
                Forgot password?
              </a>
            </div>
            <Button
              type="submit"
              className={`w-full mt-6`}
              disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin" /> : "Continue"}
            </Button>
          </form>
        </Form>
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isPending}>
            Continue with Google
          </Button>
        </>
      </CardContent>
      <CardFooter className="flex justify-center">
        <span className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <a
            href="/account/signup"
            className="text-primary underline hover:opacity-80">
            Sign up
          </a>
        </span>
      </CardFooter>
    </Card>
  );
}
