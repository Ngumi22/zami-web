import { CustomerSignInForm } from "@/components/customer/sign-in-form";

export default async function LoginPage() {
  return (
    <section className="mx-auto max-w-md py-8">
      <CustomerSignInForm />
    </section>
  );
}
