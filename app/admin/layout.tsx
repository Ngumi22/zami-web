import type React from "react";
import { AdminSidebar } from "@/components/admin/dashboard/admin-sidebar";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "../api/uploadthing/core";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/admin/dashboard/admin-navbar";

import "./dashboard.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 grid grid-cols-1 md:grid-cols-[16rem_1fr]">
        <AdminSidebar />
        <div className="min-h-screen flex">
          <Navbar />
          <section className="mt-16 flex-1 p-2 text-sm">{children}</section>
        </div>
      </div>
      <Toaster />
    </main>
  );
}
