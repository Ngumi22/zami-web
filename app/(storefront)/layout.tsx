import type React from "react";
import type { Metadata } from "next";
import { Jost } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "../globals.css";
import { SiteFooter } from "@/components/layout/footer";
import Header from "@/components/layout/header-server";
import BottomNav from "@/components/layout/mobile/bottom-nav";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Providers } from "../providers";

const jost = Jost({ subsets: ["latin"] });

export const metadata: Metadata = {
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  title: {
    default: "Zami Tech Solutions - Premium Electronics",
    template: "%s | Zami Tech Solutions",
  },
  description: "Your one-stop shop for phones, laptops, printers, and software",
  keywords: "electronics, phones, laptops, printers, software, technology",
  authors: [{ name: "Zami Tech Solutions" }],
  creator: "Zami Tech Solutions",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.zami.co.ke",
    title: "Zami Tech Solutions - Premium Electronics",
    description:
      "Your one-stop shop for phones, laptops, printers, and software",
    siteName: "Zami Tech Solutions",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zami Tech Solutions - Premium Electronics",
    description:
      "Your one-stop shop for phones, laptops, printers, and software",
    creator: "@Zami_Tech",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jost.className}>
      <body className={`pb-16 md:pb-0`}>
        <NuqsAdapter>
          <Providers>
            <Header />
            {children}
            <Toaster />
            <SiteFooter />
            <BottomNav />
          </Providers>
        </NuqsAdapter>
      </body>
    </html>
  );
}
