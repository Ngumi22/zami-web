import type React from "react";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "../api/uploadthing/core";
import { Toaster } from "@/components/ui/toaster";
import "./dashboard.css";

import { Jost } from "next/font/google";
const jost = Jost({ subsets: ["latin"] });

export default async function BaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jost.className}>
      <body className={`pb-16 md:pb-0`}>
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
