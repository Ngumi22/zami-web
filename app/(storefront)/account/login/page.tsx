import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

const CustomerSignInForm = lazy(() =>
  import("@/components/customer/sign-in-form").then((m) => ({
    default: m.CustomerSignInForm,
  }))
);

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  return (
    <section className="mx-auto max-w-md py-8 max-h-screen">
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        }>
        <CustomerSignInForm />
      </Suspense>
    </section>
  );
}
