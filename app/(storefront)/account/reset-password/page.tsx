import ResetPassword from "@/components/customer/reset-password";
export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return (
    <section className="mx-auto max-w-md my-8 max-h-screen">
      <ResetPassword />
    </section>
  );
}
