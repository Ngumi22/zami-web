import type { Metadata } from "next";
import { Users, Award, Globe, Heart, Lightbulb, Shield } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "About Us | Zami Tech Solutions",
  description: "Learn more about our company, mission, and values.",
};

export default function AboutPage() {
  const values = [
    {
      icon: Award,
      title: "Quality",
      description:
        "We carefully select each product to ensure it meets our high standards for excellence and durability.",
      color: "text-black",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      icon: Shield,
      title: "Integrity",
      description:
        "We operate with honesty and transparency in all our business practices and customer relationships.",
      color: "text-black",
      bgColor: "bg-green-50 dark:bg-green-950/20",
    },
    {
      icon: Heart,
      title: "Customer Focus",
      description:
        "Your satisfaction is our top priority in everything we do, from product selection to support.",
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/20",
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description:
        "We continuously seek ways to improve our products, services, and customer experience.",
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
    },
    {
      icon: Globe,
      title: "Sustainability",
      description:
        "We're committed to environmentally responsible practices and sustainable business operations.",
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative py-10 md:py-20">
        <div className="container px-4 sm:px-4">
          <div className="mx-auto max-w-4xl text-center">
            <Badge
              variant="outline"
              className="mb-3 px-4 py-2 text-sm font-semibold tracking-wide">
              Est. 2020
            </Badge>
            <h1 className="mb-3 text-3xl font-bold tracking-tight text-black lg:text-4xl">
              About <span className="bg-clip-text text-black">Our Story</span>
            </h1>
            <p className="mx-auto max-w-3xl text-xl leading-8 text-black md:text-2xl md:leading-9">
              We're dedicated to providing quality products and exceptional
              service to customers worldwide through innovation and integrity.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-8 md:py-12">
        <div className="container px-4 sm:px-4">
          <div className="mx-auto max-w-6xl">
            <Card className="border border-black">
              <CardContent className="p-8 lg:p-16">
                <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                  <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-black  md:text-4xl">
                      Our Journey
                    </h2>
                    <div className="space-y-4 text-black">
                      <p className="text-lg leading-8 md:text-xl md:leading-9">
                        Founded in{" "}
                        <span className="font-semibold text-black">2020</span>,
                        our shop began with a simple mission: to deliver
                        high-quality products directly to consumers at fair
                        prices.
                      </p>
                      <p className="text-lg leading-8 md:text-xl md:leading-9">
                        What started as a small operation has grown into a
                        trusted online destination for{" "}
                        <span className="font-semibold text-black ">
                          thousands of customers
                        </span>{" "}
                        in the region.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="rounded-2xl bg-white/80 p-8 text-center shadow-sm">
                        <div className="text-4xl font-bold text-black mb-2">
                          50K+
                        </div>
                        <div className="text-sm font-medium text-black">
                          Happy Customers
                        </div>
                      </div>
                      <div className="rounded-2xl bg-white/80 p-8 text-center shadow-sm">
                        <div className="text-4xl font-bold text-black mb-2">
                          5K+
                        </div>
                        <div className="text-sm font-medium text-black">
                          Products
                        </div>
                      </div>
                      <div className="rounded-2xl bg-white/80 p-8 text-center shadow-sm">
                        <div className="text-4xl font-bold text-black mb-2">
                          99%
                        </div>
                        <div className="text-sm font-medium text-black">
                          Satisfaction
                        </div>
                      </div>
                      <div className="rounded-2xl bg-white/80 p-8 text-center shadow-sm">
                        <div className="text-4xl font-bold text-black mb-2">
                          24/7
                        </div>
                        <div className="text-sm font-medium text-black">
                          Support
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container px-4 sm:px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-12 text-4xl font-bold text-black  md:text-5xl">
              Our Mission
            </h2>
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-px w-full"></div>
              </div>
              <div className="relative bg-white px-12 py-8">
                <blockquote className="text-2xl font-medium italic text-slate-700 md:text-3xl leading-relaxed">
                  "To make quality products accessible to everyone while
                  maintaining the highest standards of customer service and
                  ethical business practices."
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container px-4 sm:px-4">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-3 text-4xl font-bold text-black  md:text-5xl">
                Our Values
              </h2>
              <p className="text-xl text-black md:text-2xl">
                The principles that guide everything we do
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {values.map((value, index) => (
                <Card
                  key={index}
                  className="group transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ">
                  <CardContent className="p-8">
                    <div className="mb-3 flex items-center space-x-4">
                      <div className={`rounded-2xl p-4`}>
                        <value.icon className={`h-8 w-8 `} />
                      </div>
                      <h3 className="text-xl font-bold text-black  md:text-2xl">
                        {value.title}
                      </h3>
                    </div>
                    <p className="text-base leading-7 text-black md:text-lg md:leading-8">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-4 md:py-8">
        <div className="container px-4 sm:px-4">
          <div className="mx-auto max-w-5xl">
            <Card className=" shadow-2xl">
              <CardContent className="p-12 md:p-16 lg:p-20">
                <div className="text-center">
                  <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full">
                    <Users className="h-10 w-10" />
                  </div>
                  <h2 className="mb-8 text-3xl font-bold md:text-4xl">
                    Our Team
                  </h2>
                  <p className="text-lg leading-8 md:text-xl md:leading-9">
                    Behind our store is a dedicated team of professionals
                    passionate about delivering excellence. From product
                    curation to customer support, each team member plays a vital
                    role in ensuring your shopping experience exceeds
                    expectations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
