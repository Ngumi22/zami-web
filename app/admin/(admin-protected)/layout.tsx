import type React from "react";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { Toaster } from "@/components/ui/toaster";
import "../dashboard.css";

import { Jost } from "next/font/google";
import { AdminSidebar } from "@/components/admin/dashboard/admin-sidebar";
import { Navbar } from "@/components/admin/dashboard/admin-navbar";
import { ourFileRouter } from "@/app/api/uploadthing/core";
const jost = Jost({ subsets: ["latin"] });

export default async function BaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${jost} antialiased`}>
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 grid grid-cols-1 md:grid-cols-[16rem_1fr]">
          <AdminSidebar />
          <div className="min-h-screen">
            <Navbar />
            <section className="mt-16 flex-1 p-2 text-sm">{children}</section>
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
