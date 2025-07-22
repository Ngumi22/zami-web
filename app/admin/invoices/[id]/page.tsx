"use client";

import { useRef, useState, useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Eye, ArrowLeft, Printer, Mail, Share2 } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { InvoicePrintLayout } from "@/components/admin/invoices-section/invoice-print-layout";
import { getInvoice } from "@/data/invoices";
import { Invoice } from "@prisma/client";

interface InvoicePageProps {
  params: Promise<{ id: string }>;
}

export default function InvoicePage({ params }: InvoicePageProps) {
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    async function loadInvoice() {
      const resolvedParams = await params;
      const invoiceData = await getInvoice(resolvedParams.id);

      if (!invoiceData) {
        notFound();
      }

      setInvoice(invoiceData);
      setLoading(false);
    }

    loadInvoice();
  }, [params]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice-${invoice?.invoiceNumber}`,
    pageStyle: `
    @page {
      size: A4;
      margin: 0.5in;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
      }
      .print\\:hidden {
        display: none !important;
      }
      .print\\:block {
        display: block !important;
      }
      .print\\:text-xs {
        font-size: 0.75rem !important;
      }
      .print\\:text-sm {
        font-size: 0.875rem !important;
      }
      .print\\:text-base {
        font-size: 1rem !important;
      }
      .print\\:text-lg {
        font-size: 1.125rem !important;
      }
      .print\\:text-xl {
        font-size: 1.25rem !important;
      }
      .print\\:text-2xl {
        font-size: 1.5rem !important;
      }
      .print\\:p-0 {
        padding: 0 !important;
      }
      .print\\:px-2 {
        padding-left: 0.5rem !important;
        padding-right: 0.5rem !important;
      }
      .print\\:py-2 {
        padding-top: 0.5rem !important;
        padding-bottom: 0.5rem !important;
      }
      .print\\:pt-4 {
        padding-top: 1rem !important;
      }
      .print\\:mb-6 {
        margin-bottom: 1.5rem !important;
      }
      .print\\:mt-8 {
        margin-top: 2rem !important;
      }
      .print\\:max-w-none {
        max-width: none !important;
      }
      .print\\:shadow-none {
        box-shadow: none !important;
      }
      .print\\:bg-gray-100 {
        background-color: #f3f4f6 !important;
      }
      .print\\:bg-transparent {
        background-color: transparent !important;
      }
      .print\\:border-gray-300 {
        border-color: #d1d5db !important;
      }
      .print\\:border-gray-400 {
        border-color: #9ca3af !important;
      }
      .print\\:divide-gray-300 > :not([hidden]) ~ :not([hidden]) {
        border-color: #d1d5db !important;
      }
      .print\\:hover\\:bg-transparent:hover {
        background-color: transparent !important;
      }
    }
  `,
  });

  const handleDownloadPDF = () => {
    // In a real app, you would generate a PDF here
    console.log("Downloading PDF for invoice:", invoice?.invoiceNumber);
    // You could use libraries like jsPDF or Puppeteer for server-side PDF generation
  };

  const handleSendInvoice = () => {
    // In a real app, you would send the invoice via email
    console.log("Sending invoice:", invoice?.invoiceNumber);
  };

  const handleShare = () => {
    if (navigator.share && invoice) {
      navigator.share({
        title: `Invoice ${invoice.invoiceNumber}`,
        text: `Invoice for order ${invoice.orderNumber}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Action Bar - Hidden in print */}
      <div className="print:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Invoice {invoice.invoiceNumber}
                </h1>
                <p className="text-sm text-gray-500">
                  Order {invoice.orderNumber}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={isPreviewMode ? "bg-blue-50 border-blue-200" : ""}>
                <Eye className="w-4 h-4 mr-2" />
                {isPreviewMode ? "Exit Preview" : "Preview"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => handlePrint()}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button size="sm" onClick={handleSendInvoice}>
                <Mail className="w-4 h-4 mr-2" />
                Send Invoice
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div
        className={`${
          isPreviewMode ? "p-8 print:p-0" : "p-4 sm:p-6 lg:p-8 print:p-0"
        }`}>
        {isPreviewMode && (
          <div className="max-w-4xl mx-auto mb-6 print:hidden">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">
                      Preview Mode
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    This is how the invoice will appear when printed
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div
          className={
            isPreviewMode
              ? "shadow-lg rounded-lg overflow-hidden print:shadow-none print:rounded-none"
              : ""
          }>
          <InvoicePrintLayout invoice={invoice} ref={printRef} />
        </div>
      </div>
    </div>
  );
}
