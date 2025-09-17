import type React from "react";
import { Jost } from "next/font/google";

import "@/app/globals.css";
import { Toaster } from "@/components/ui/sonner";

const jost = Jost({ subsets: ["latin"] });

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${jost.className} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
