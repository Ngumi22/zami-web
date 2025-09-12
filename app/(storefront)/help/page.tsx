"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  MessageCircle,
  Phone,
  Mail,
  HelpCircle,
  Package,
  Truck,
  RotateCcw,
} from "lucide-react";

const faqCategories = [
  {
    id: "orders",
    title: "Orders & Payment",
    icon: Package,
    faqs: [
      {
        question: "How do I place an order?",
        answer:
          "To place an order, browse our products, add items to your cart, and proceed to checkout. You'll need to provide shipping information and payment details to complete your purchase.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept credit/debit cards (Visa, Mastercard, American Express), M-Pesa, and bank transfers. All payments are processed securely.",
      },
      {
        question: "Can I modify or cancel my order?",
        answer:
          "You can modify or cancel your order within 2 hours of placing it. After that, please contact our customer service team for assistance.",
      },
      {
        question: "Do you offer installment payments?",
        answer:
          "Yes, we offer installment payment options for orders above KSh 50,000. Contact our sales team for more information about payment plans.",
      },
    ],
  },
  {
    id: "shipping",
    title: "Shipping & Delivery",
    icon: Truck,
    faqs: [
      {
        question: "What are your delivery areas?",
        answer:
          "We deliver nationwide across Kenya. Same-day delivery is available in Nairobi, while other areas receive delivery within 1-3 business days.",
      },
      {
        question: "How much does shipping cost?",
        answer:
          "Shipping is free for orders over KSh 2,000. For orders below this amount, a flat shipping fee of KSh 200 applies within Nairobi and KSh 500 for other areas.",
      },
      {
        question: "How can I track my order?",
        answer:
          "Once your order ships, you'll receive a tracking number via email and SMS. You can track your order on our website or contact customer service.",
      },
      {
        question: "What if I'm not available for delivery?",
        answer:
          "Our delivery team will attempt delivery twice. If unsuccessful, the package will be held at our local facility for pickup or rescheduled delivery.",
      },
    ],
  },
  {
    id: "returns",
    title: "Returns & Refunds",
    icon: RotateCcw,
    faqs: [
      {
        question: "What is your return policy?",
        answer:
          "We offer a 30-day return policy for most items. Products must be in original condition with tags attached. Electronics have a 14-day return window.",
      },
      {
        question: "How do I return an item?",
        answer:
          "Contact our customer service to initiate a return. We'll provide a return authorization number and instructions for sending the item back.",
      },
      {
        question: "When will I receive my refund?",
        answer:
          "Refunds are processed within 5-7 business days after we receive and inspect the returned item. The refund will be credited to your original payment method.",
      },
      {
        question: "Can I exchange an item instead of returning it?",
        answer:
          "Yes, we offer exchanges for different sizes or colors of the same product, subject to availability. Contact customer service to arrange an exchange.",
      },
    ],
  },
  {
    id: "account",
    title: "Account & Technical",
    icon: HelpCircle,
    faqs: [
      {
        question: "How do I create an account?",
        answer:
          "Click 'Sign Up' on our website and provide your email, name, and password. You'll receive a confirmation email to verify your account.",
      },
      {
        question: "I forgot my password. How do I reset it?",
        answer:
          "Click 'Forgot Password' on the login page and enter your email. We'll send you a link to reset your password.",
      },
      {
        question: "How do I update my account information?",
        answer:
          "Log into your account and go to 'Account Settings' to update your personal information, addresses, and preferences.",
      },
      {
        question: "Is my personal information secure?",
        answer:
          "Yes, we use industry-standard encryption and security measures to protect your personal and payment information. We never share your data with third parties without consent.",
      },
    ],
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("orders");

  const filteredFaqs = faqCategories
    .find((cat) => cat.id === selectedCategory)
    ?.faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Help Center</h1>
            <p className="text-xl md:text-2xl mb-8">
              Find answers to your questions and get the help you need
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="search"
                placeholder="Search for help topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg bg-white text-gray-900"
              />
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Category Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Help Topics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {faqCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Button
                        key={category.id}
                        variant={
                          selectedCategory === category.id ? "default" : "ghost"
                        }
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory(category.id)}>
                        <Icon className="h-4 w-4 mr-2" />
                        {category.title}
                      </Button>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Contact Support */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Still Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Live Chat
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Support
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Us
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* FAQ Content */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {
                      faqCategories.find((cat) => cat.id === selectedCategory)
                        ?.title
                    }{" "}
                    - Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredFaqs && filteredFaqs.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                      {filteredFaqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger className="text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-600">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <div className="text-center py-8">
                      <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        No results found
                      </h3>
                      <p className="text-gray-600">
                        Try adjusting your search or browse other categories
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-6 text-center">
                    <Package className="h-8 w-8 text-green-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-green-800 mb-2">
                      Track Your Order
                    </h3>
                    <p className="text-green-700 text-sm mb-4">
                      Get real-time updates on your order status
                    </p>
                    <Button
                      variant="outline"
                      className="border-green-300 text-green-700 hover:bg-green-100">
                      Track Order
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-6 text-center">
                    <RotateCcw className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="font-semibold text-blue-800 mb-2">
                      Return an Item
                    </h3>
                    <p className="text-blue-700 text-sm mb-4">
                      Start a return or exchange process
                    </p>
                    <Button
                      variant="outline"
                      className="border-blue-300 text-blue-700 hover:bg-blue-100">
                      Start Return
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
