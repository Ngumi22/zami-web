import type { Metadata } from "next";
import { Mail, MapPin, Phone, Clock, MessageCircle, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Contact Us | Zami Tech Solutions",
  description: "Get in touch with our customer support team.",
};

export default function ContactPage() {
  const contactInfo = [
    {
      icon: MapPin,
      title: "Visit Our Office",
      primary: "Revlon Plaza, Kimathi Street",
      secondary: "Nairobi, Kenya",
      accent: "text-red-500",
    },
    {
      icon: Mail,
      title: "Email Us",
      primary: "support@zamitechsolutions.co.ke",
      secondary: "sales@zamitechsolutions.co.ke",
      accent: "text-blue-500",
    },
    {
      icon: Phone,
      title: "Call Us",
      primary: "+254 (720) 123-456",
      secondary: "Monday-Friday, 8am-7pm EAT",
      accent: "text-green-500",
    },
    {
      icon: Clock,
      title: "Business Hours",
      primary: "Mon-Fri: 8:00 AM - 7:00 PM",
      secondary: "Sat-Sun: 9:00 AM - 6:00 PM",
      accent: "text-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container relative">
          <div className="mx-auto max-w-4xl text-center text-white">
            <Badge
              variant="secondary"
              className="mb-4 bg-white/20 text-white hover:bg-white/30">
              <MessageCircle className="mr-2 h-4 w-4" />
              We're Here to Help
            </Badge>
            <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl">
              Get in Touch
            </h1>
            <p className="text-xl text-blue-100">
              Have questions? We'd love to hear from you. Send us a message and
              we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {contactInfo.map((info, index) => (
                <Card
                  key={index}
                  className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center space-x-3">
                      <div
                        className={`rounded-full bg-slate-100 p-3 dark:bg-slate-800 group-hover:scale-110 transition-transform`}>
                        <info.icon className={`h-6 w-6 ${info.accent}`} />
                      </div>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
                      {info.title}
                    </h3>
                    <p className="mb-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                      {info.primary}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {info.secondary}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-8 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <div className="sticky top-8">
                  <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-slate-50">
                    Let's Start a Conversation
                  </h2>
                  <p className="mb-8 text-lg text-slate-600 dark:text-slate-300">
                    We're committed to providing exceptional customer service.
                    Whether you have a question about our products, need help
                    with an order, or just want to say hello, we're here for
                    you.
                  </p>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/20">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-50">
                          Quick Response Time
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          We typically respond within 2-4 hours during business
                          hours
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/20">
                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-50">
                          Expert Support
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Our team has extensive knowledge about all our
                          products
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3">
                <Card className="shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
                    <CardTitle className="flex items-center space-x-2">
                      <Send className="h-5 w-5 text-blue-600" />
                      <span>Send us a Message</span>
                    </CardTitle>
                    <CardDescription>
                      Fill out the form below and we'll get back to you as soon
                      as possible.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form className="space-y-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label
                            htmlFor="first-name"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            First name *
                          </label>
                          <Input
                            id="first-name"
                            placeholder="John"
                            className="transition-all focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="last-name"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Last name *
                          </label>
                          <Input
                            id="last-name"
                            placeholder="Doe"
                            className="transition-all focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="email"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Email address *
                        </label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john.doe@example.com"
                          className="transition-all focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="subject"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Subject *
                        </label>
                        <Input
                          id="subject"
                          placeholder="How can we help you?"
                          className="transition-all focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="message"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          Message *
                        </label>
                        <Textarea
                          id="message"
                          placeholder="Please provide as much detail as possible..."
                          className="min-h-[150px] transition-all focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                        size="lg">
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
