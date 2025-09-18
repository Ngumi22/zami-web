import { CustomerSignUpForm } from "@/components/customer/sign-up-form";

export const dynamic = "force-dynamic";

export default function SignupPage() {
  return (
    <section className="mx-auto max-w-md my-8 max-h-screen">
      <CustomerSignUpForm />
    </section>
  );
}
