import { AdminSidebar } from "@/components/admin/dashboard/admin-sidebar";
import { Navbar } from "@/components/admin/dashboard/admin-navbar";
import { requireAuth } from "@/lib/auth-action";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 grid grid-cols-1 md:grid-cols-[16rem_1fr]">
      <AdminSidebar user={user} />
      <div className="min-h-screen">
        <Navbar user={user} />
        <section className="mt-16 flex-1 p-2 text-sm">{children}</section>
      </div>
    </div>
  );
}
