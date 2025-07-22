import type { Metadata } from "next";
import {
  Shield,
  Eye,
  Lock,
  Users,
  FileCheck,
  Globe,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Privacy Policy | Zami Tech Solutions",
  description:
    "Learn about how we collect, use, and protect your personal information.",
};

export default function PrivacyPage() {
  const dataTypes = [
    {
      icon: Users,
      title: "Personal Information",
      description: "Name, email, address, phone, and payment details",
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/20",
    },
    {
      icon: Eye,
      title: "Usage Information",
      description: "How you interact with our website and products",
      color: "text-green-600 bg-green-100 dark:bg-green-900/20",
    },
    {
      icon: Globe,
      title: "Device Information",
      description: "Browser, IP address, device type, and OS",
      color: "text-purple-600 bg-purple-100 dark:bg-purple-900/20",
    },
    {
      icon: FileCheck,
      title: "Cookies & Analytics",
      description: "Usage patterns and preferences tracking",
      color: "text-orange-600 bg-orange-100 dark:bg-orange-900/20",
    },
  ];

  const rights = [
    { title: "Access", description: "View your personal data" },
    { title: "Update", description: "Correct inaccurate information" },
    { title: "Delete", description: "Request data removal" },
    { title: "Portability", description: "Export your data" },
    { title: "Opt-out", description: "Stop marketing communications" },
    { title: "Restrict", description: "Limit data processing" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
                <Shield className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="mb-4 text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50 md:text-6xl">
              Privacy
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Policy
              </span>
            </h1>
            <p className="mb-6 text-xl text-slate-600 dark:text-slate-300">
              Your privacy is important to us. Learn how we collect, use, and
              protect your information.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
              <Badge variant="outline" className="px-3 py-1">
                Last updated: June 18, 2025
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                GDPR Compliant
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Key Points */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-slate-50">
                What You Need to Know
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                A quick overview of our privacy practices
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {dataTypes.map((type, index) => (
                <Card
                  key={index}
                  className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div
                      className={`inline-flex rounded-lg p-3 ${type.color} group-hover:scale-110 transition-transform`}>
                      <type.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-50">
                      {type.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      {type.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="space-y-8">
              {/* Information Collection */}
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-0 h-auto hover:bg-transparent">
                    <Card className="w-full cursor-pointer transition-all hover:shadow-md">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/20">
                              <FileCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <CardTitle className="text-left text-xl">
                                1. Information We Collect
                              </CardTitle>
                              <CardDescription className="text-left">
                                Types of data we gather and how
                              </CardDescription>
                            </div>
                          </div>
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        </div>
                      </CardHeader>
                    </Card>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Card className="mt-4 bg-blue-50/50 dark:bg-blue-950/10">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <p className="text-slate-600 dark:text-slate-300">
                          We collect several types of information from and about
                          users of our website:
                        </p>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {[
                            "Personal identifiers (name, email, address)",
                            "Payment and billing information",
                            "Usage data and analytics",
                            "Device and browser information",
                            "Location data (if permitted)",
                            "Communication preferences",
                          ].map((item, index) => (
                            <div
                              key={index}
                              className="flex items-start space-x-3">
                              <div className="mt-1 h-2 w-2 rounded-full bg-blue-500"></div>
                              <span className="text-sm text-slate-600 dark:text-slate-300">
                                {item}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>

              {/* How We Use Information */}
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-0 h-auto hover:bg-transparent">
                    <Card className="w-full cursor-pointer transition-all hover:shadow-md">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/20">
                              <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <CardTitle className="text-left text-xl">
                                2. How We Use Your Information
                              </CardTitle>
                              <CardDescription className="text-left">
                                Our purposes for data processing
                              </CardDescription>
                            </div>
                          </div>
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        </div>
                      </CardHeader>
                    </Card>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Card className="mt-4 bg-green-50/50 dark:bg-green-950/10">
                    <CardContent className="p-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        {[
                          {
                            title: "Order Processing",
                            desc: "Fulfill purchases and manage accounts",
                          },
                          {
                            title: "Customer Support",
                            desc: "Provide help and resolve issues",
                          },
                          {
                            title: "Communication",
                            desc: "Send updates and notifications",
                          },
                          {
                            title: "Personalization",
                            desc: "Customize your experience",
                          },
                          { title: "Analytics", desc: "Improve our services" },
                          {
                            title: "Security",
                            desc: "Detect and prevent fraud",
                          },
                        ].map((use, index) => (
                          <div
                            key={index}
                            className="rounded-lg bg-white/60 p-4 dark:bg-slate-800/60">
                            <h4 className="font-medium text-slate-900 dark:text-slate-50">
                              {use.title}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                              {use.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>

              {/* Your Rights */}
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-0 h-auto hover:bg-transparent">
                    <Card className="w-full cursor-pointer transition-all hover:shadow-md">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/20">
                              <Lock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <CardTitle className="text-left text-xl">
                                5. Your Rights and Choices
                              </CardTitle>
                              <CardDescription className="text-left">
                                Control over your personal data
                              </CardDescription>
                            </div>
                          </div>
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        </div>
                      </CardHeader>
                    </Card>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Card className="mt-4 bg-purple-50/50 dark:bg-purple-950/10">
                    <CardContent className="p-6">
                      <p className="mb-6 text-slate-600 dark:text-slate-300">
                        You have the following rights regarding your personal
                        information:
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {rights.map((right, index) => (
                          <div
                            key={index}
                            className="rounded-lg border border-purple-200 bg-white p-4 dark:border-purple-800 dark:bg-slate-800">
                            <h4 className="font-semibold text-purple-700 dark:text-purple-300">
                              {right.title}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {right.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Contact Section */}
            <Card className="mt-12 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
              <CardContent className="p-8">
                <div className="text-center">
                  <HelpCircle className="mx-auto mb-4 h-12 w-12 text-blue-400" />
                  <h3 className="mb-4 text-2xl font-bold">
                    Questions About Your Privacy?
                  </h3>
                  <p className="mb-6 text-slate-300">
                    We're here to help. Contact our privacy team for any
                    questions or concerns.
                  </p>
                  <div className="space-y-2">
                    <p className="text-slate-300">
                      <span className="font-medium text-white">Email:</span>
                      privacy@zamitechsolutions.co.ke
                    </p>
                    <p className="text-slate-300">
                      <span className="font-medium text-white">Phone:</span>
                      +254 (720) 123-456
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
