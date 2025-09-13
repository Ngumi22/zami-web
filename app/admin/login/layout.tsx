import type React from "react";
import { Jost } from "next/font/google";

import "../dashboard.css";

const jost = Jost({ subsets: ["latin"] });

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jost.className}>
      <body className={`pb-16 md:pb-0`}>{children}</body>
    </html>
  );
}
