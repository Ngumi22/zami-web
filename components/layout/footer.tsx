"use client";
import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) {
    return null;
  }
  return (
    <footer className="border-t bg-muted">
      <div className="container px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="text-xl font-bold">
              Zami Tech Solutions
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Your one-stop shop for all electronics needs. Quality products at
              competitive prices.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium">Shop</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/products?category=phones"
                  className="text-muted-foreground hover:text-foreground">
                  Phones
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=laptops"
                  className="text-muted-foreground hover:text-foreground">
                  Laptops
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=printers"
                  className="text-muted-foreground hover:text-foreground">
                  Printers
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=software"
                  className="text-muted-foreground hover:text-foreground">
                  Software
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium">Company</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium">Connect</h3>
            <div className="mt-4 flex space-x-4">
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
            <div className="mt-6">
              <h4 className="text-sm font-medium">
                Subscribe to our newsletter
              </h4>
              <div className="mt-2 flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
                <button className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Zami Tech Solutions. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
