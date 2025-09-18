import { CustomerSignInForm } from "@/components/customer/sign-in-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  return (
    <section className="mx-auto max-w-md py-8 max-h-screen">
      <CustomerSignInForm />
    </section>
  );
}
