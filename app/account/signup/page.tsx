import { CustomerSignupForm } from "@/components/customer/signup";
export const dynamic = "force-dynamic";

export default async function SignupPage() {
  return (
    <section className="py-8 mx-auto">
      <CustomerSignupForm />
    </section>
  );
}
