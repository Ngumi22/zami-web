"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
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

const formSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  token: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

interface SignupFormProps extends React.ComponentProps<"div"> {
  email: string;
  token: string;
}

export function SignupForm({ className, email, token }: SignupFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email,
      password: "",
      token,
    },
  });

  useEffect(() => {
    if (!email || !token) {
      toast.error("Invalid or missing invite. Please check your invite link.");
      router.push("/error");
    }
  }, [email, token, router]);

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    const { success, message } = await signUpUser({
      email: values.email,
      password: values.password,
      name: values.username,
      inviteToken: values.token,
    });

    if (success) {
      toast.success(`Signed Up Successfully`);
      router.push("/login");
    } else {
      toast.error(message as string);
    }

    setIsLoading(false);
  };

  return (
    <div className={cn("flex flex-col gap-6 w-1/2", className)}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome</CardTitle>
          <CardDescription>Signup with your Google account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                        <Input placeholder="e.g. shadcn" {...field} />
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

                <Link
                  href="/forgot-password"
                  className="ml-auto text-sm underline-offset-4 hover:underline">
                  Forgot your password?
                </Link>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Signup"
                  )}
                </Button>

                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link href="/login" className="underline underline-offset-4">
                    Login
                  </Link>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
