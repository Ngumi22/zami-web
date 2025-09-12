"use client";
import { Scale, Calendar, AlertCircle } from "lucide-react";
import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState(1);

  const termsSections = [
    {
      id: 1,
      title: "Introduction",
      content: (
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Welcome to{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-50">
              Zami Tech Solutions
            </span>
            . These Terms and Conditions govern your use of our website and the
            purchase of products through our platform. By accessing our website
            or placing an order, you agree to be bound by these Terms and
            Conditions.
          </p>
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <span className="font-medium">Legal Agreement:</span> These terms
              constitute a legally binding agreement between you and Zami Tech
              Solutions.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: "Definitions",
      content: (
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            The following terms have specific meanings when used in these Terms
            and Conditions:
          </p>
          <div className="space-y-3">
            <div className="flex">
              <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 w-24">
                "Company"
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Refers to Zami Tech Solutions
              </span>
            </div>
            <div className="flex">
              <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 w-24">
                "Website"
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Refers to zamitechsolutions.co.ke
              </span>
            </div>
            <div className="flex">
              <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 w-24">
                "User"
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Any person accessing our website
              </span>
            </div>
            <div className="flex">
              <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 w-24">
                "Product"
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Items offered for sale on the Website
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: "Account Registration",
      content: (
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-300">
            To access certain features of the Website, you may be required to
            register for an account. You agree to provide accurate, current, and
            complete information during the registration process.
          </p>
          <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-950/20">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <span className="font-medium">Important:</span> You are
              responsible for maintaining the confidentiality of your account
              and password.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: "Products and Pricing",
      content: (
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-300">
            We strive to provide accurate product descriptions and pricing
            information. However, we do not warrant that product descriptions or
            pricing information are accurate, complete, reliable, current, or
            error-free.
          </p>
          <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-2">
            <li>• All prices are subject to change without notice</li>
            <li>• We reserve the right to modify or discontinue any product</li>
            <li>• Product images are for illustration purposes only</li>
          </ul>
        </div>
      ),
    },
    {
      id: 5,
      title: "Orders and Payment",
      content: (
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-300">
            When you place an order, you offer to purchase the product at the
            price stated. We reserve the right to accept or decline your order
            for any reason.
          </p>
          <p className="text-slate-600 dark:text-slate-300">
            Payment must be made at the time of placing an order. We accept
            various payment methods as indicated on our Website.
          </p>
        </div>
      ),
    },
    {
      id: 6,
      title: "Shipping and Delivery",
      content: (
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-300">
            We offer various shipping options to meet your needs. Delivery times
            and costs vary based on your location and selected shipping method.
          </p>
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-50">
                Standard
              </p>
              <p className="text-slate-600 dark:text-slate-300">3-5 days</p>
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-50">
                Express
              </p>
              <p className="text-slate-600 dark:text-slate-300">1-2 days</p>
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-50">
                Same Day
              </p>
              <p className="text-slate-600 dark:text-slate-300">Nairobi only</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 7,
      title: "Returns and Refunds",
      content: (
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-300">
            We want you to be completely satisfied with your purchase. If you're
            not happy with your order, we offer a comprehensive returns and
            refunds policy.
          </p>
          <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-2">
            <li>• 30-day return window</li>
            <li>• Items must be unused and in original packaging</li>
            <li>• Refunds processed within 5-7 business days</li>
            <li>• Some items are non-returnable</li>
          </ul>
        </div>
      ),
    },
    {
      id: 8,
      title: "Intellectual Property",
      content: (
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-300">
            All content on this website, including but not limited to text,
            graphics, logos, images, and software, is the property of Zami Tech
            Solutions and is protected by intellectual property laws.
          </p>
          <div className="rounded-lg bg-red-50 p-4 dark:bg-red-950/20">
            <p className="text-sm text-red-800 dark:text-red-200">
              <span className="font-medium">Prohibited:</span> Copying,
              reproducing, or using our content without permission is strictly
              forbidden.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 9,
      title: "Limitation of Liability",
      content: (
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-300">
            To the fullest extent permitted by law, Zami Tech Solutions shall
            not be liable for any indirect, incidental, special, consequential,
            or punitive damages arising from your use of our website or
            services.
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Our total liability is limited to the amount you paid for the
            specific product or service.
          </p>
        </div>
      ),
    },
    {
      id: 10,
      title: "Changes to Terms",
      content: (
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-300">
            We reserve the right to modify these Terms and Conditions at any
            time. Changes will be effective immediately upon posting on our
            website.
          </p>
          <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-950/20">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Continued use of our website after changes are posted constitutes
              acceptance of the new terms.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 11,
      title: "Contact Information",
      content: (
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-300">
            If you have any questions about these Terms and Conditions, please
            contact us:
          </p>
          <div className="space-y-2 text-sm">
            <p className="text-slate-900 dark:text-slate-50">
              <span className="font-medium">Email:</span>{" "}
              legal@zamitechsolutions.co.ke
            </p>
            <p className="text-slate-900 dark:text-slate-50">
              <span className="font-medium">Phone:</span> +254 (720) 123-456
            </p>
            <p className="text-slate-900 dark:text-slate-50">
              <span className="font-medium">Hours:</span> Monday - Friday, 8:00
              AM - 6:00 PM
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header Section */}
      <section className="border-b bg-slate-50 py-8 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center space-x-4 mb-3">
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
                <Scale className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 md:text-5xl">
                  Terms & Conditions
                </h1>
                <div className="mt-2 flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Last updated: June 18, 2025</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Version 2.1
                  </Badge>
                </div>
              </div>
            </div>

            <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      Important Legal Information
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      Please read these terms and conditions carefully before
                      using our website and services.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="container py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Terms List - Left Side */}
            <div className="lg:col-span-4">
              <div className="sticky top-8">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4">
                      Terms & Conditions
                    </h3>
                    <nav className="space-y-1">
                      {termsSections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => setActiveSection(section.id)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            activeSection === section.id
                              ? "bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100"
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
                          }`}>
                          <span className="font-mono text-xs mr-3">
                            {section.id}.
                          </span>
                          {section.title}
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Content - Right Side */}
            <div className="lg:col-span-8">
              <Card className="min-h-[500px]">
                <CardContent className="p-8">
                  {termsSections.map((section) => (
                    <div
                      key={section.id}
                      className={
                        activeSection === section.id ? "block" : "hidden"
                      }>
                      <div className="mb-6 flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                          {section.id}
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                          {section.title}
                        </h2>
                      </div>
                      {section.content}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
