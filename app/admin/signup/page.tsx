import { SignUpForm } from "@/components/account/sign-up-form";
import { validateInviteToken } from "@/data/users";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: { email: string; token: string };
}) {
  const { email, token } = await searchParams;

  if (!email || !token) {
    redirect("/unauthorized");
  }

  const invite = await validateInviteToken(email, token);

  if (!invite) {
    redirect("/unauthorized");
  }

  return (
    <section className="min-h-screen flex items-center justify-center">
      <SignUpForm email={email} token={token} />
    </section>
  );
}
