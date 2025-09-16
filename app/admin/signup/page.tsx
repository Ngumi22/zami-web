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
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-1 items-center justify-center w-full max-w-xs">
          <SignUpForm email={email} token={token} />
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/placeholder.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
