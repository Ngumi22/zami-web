import ResetPassword from "@/components/customer/reset-password";
export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return (
    <section className="mx-auto max-w-md py-8">
      <ResetPassword />
    </section>
  );
}
