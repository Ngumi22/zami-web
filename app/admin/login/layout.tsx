import { Jost } from "next/font/google";

import "@/app/globals.css";
import { Toaster } from "@/components/ui/sonner";

const jost = Jost({ subsets: ["latin"] });

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jost} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
