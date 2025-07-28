"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/unauthorized")
  ) {
    return null;
  }

  return (
    <footer className="border-t bg-gray-100 text-gray-800">
      <div className="container px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="text-xl font-bold text-gray-900">
              Zami Tech Solutions
            </Link>
            <p className="mt-4 text-sm">
              Your one-stop shop for all electronics needs. Quality products at
              competitive prices.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Shop</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {["phones", "laptops", "printers", "software"].map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/products?category=${cat}`}
                    className="hover:underline hover:text-primary">
                    {cat[0].toUpperCase() + cat.slice(1)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Company</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                { label: "About", href: "/about" },
                { label: "Contact", href: "/contact" },
                { label: "Terms & Conditions", href: "/terms" },
                { label: "Privacy Policy", href: "/privacy" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:underline hover:text-primary">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Connect</h3>
            <div className="mt-4 flex space-x-4">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <Link key={i} href="#" className="hover:text-primary">
                  <Icon className="h-5 w-5" />
                  <span className="sr-only">{Icon.name}</span>
                </Link>
              ))}
            </div>
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900">
                Subscribe to our newsletter
              </h4>
              <div className="mt-2 flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                />
                <button className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-white">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-6 text-center text-sm text-gray-600">
          <p>
            © {new Date().getFullYear()} Zami Tech Solutions. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
