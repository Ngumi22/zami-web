import { LoginForm } from "@/components/account/sign-in-form";
import { redirect } from "next/navigation";
export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const { token } = searchParams;

  if (!token) {
    redirect("/");
  }

  return <LoginForm />;
}
