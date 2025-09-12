import { CustomerSignupForm } from "@/components/customer/signup";
export const dynamic = "force-dynamic";

export default async function SignupPage() {
  return (
    <section className="mx-auto max-w-md py-8">
      <CustomerSignupForm />
    </section>
  );
}
