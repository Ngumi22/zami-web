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
import { toast } from "sonner";
import { authClient } from "@/lib/auth/auth.client";
import { signup } from "@/lib/auth/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SignUpFormValues, SignUpSchema } from "@/lib/auth/schemas";

export function CustomerSignUpForm() {
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "Password123.",
      confirmPassword: "Password123.",
    },
  });

  const router = useRouter();

  const [isPending, setPending] = useState(false);

  const handleSubmit = async (values: SignUpFormValues) => {
    setPending(true);

    try {
      const result = await signup(values.email, values.name, values.password);

      if (result.success) {
        toast.success(result.success);
        router.push("/account");
      } else {
        toast.error(result.error || "An unknown error occurred.");
      }
    } catch (error) {
      console.error("Signup error:", error);
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
        <CardTitle>Sign up</CardTitle>
        <CardDescription>Create a new account to get started</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4">
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>User Name</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} disabled={isPending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="size-4">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            Continue with Google
          </Button>
        </>
      </CardContent>
      <CardFooter className="flex justify-center">
        <span className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <a
            href="/account/sign-in"
            className="text-primary underline hover:opacity-80">
            Sign in
          </a>
        </span>
      </CardFooter>
    </Card>
  );
}
