"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { signUpUser } from "@/data/users";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  token: z.string().min(1),
  honeypot: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface SignupFormProps {
  email: string;
  token: string;
}

export function SignUpForm({ email, token }: SignupFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email,
      password: "",
      token,
      honeypot: "",
    },
  });

  useEffect(() => {
    if (!email || !token) {
      toast.error("Invalid or missing invite. Please check your invite link.");
      router.push("/unauthorized");
    }
  }, [email, token, router]);

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);

    const result = await signUpUser({
      email: values.email,
      password: values.password,
      name: values.username,
      inviteToken: values.token,
      honeypot: values.honeypot,
    });

    if (!result?.success) {
      toast.error(
        result?.message || "An unexpected error occurred. Please try again."
      );
    }

    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center m-auto">
      <Card className="max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome</CardTitle>
          <CardDescription>Create your admin account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <input
                type="text"
                style={{ display: "none" }}
                tabIndex={-1}
                autoComplete="off"
                {...form.register("honeypot")}
              />
              <input type="hidden" readOnly {...form.register("email")} />
              <input type="hidden" readOnly {...form.register("token")} />

              <div className="grid gap-3">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. zami" {...field} />
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
                        <Input
                          placeholder="********"
                          {...field}
                          type="password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Signing up...
                    </>
                  ) : (
                    "Signup"
                  )}
                </Button>
              </div>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link
                  href="/admin/login"
                  className="underline underline-offset-4">
                  Login
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
