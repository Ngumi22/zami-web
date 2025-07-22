"use client";

import { forwardRef } from "react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Invoice } from "@prisma/client";

interface InvoicePrintLayoutProps {
  invoice: Invoice;
}

export const InvoicePrintLayout = forwardRef<
  HTMLDivElement,
  InvoicePrintLayoutProps
>(({ invoice }, ref) => {
  return (
    <div
      ref={ref}
      className="bg-white p-8 max-w-4xl mx-auto print:p-0 print:max-w-none print:shadow-none">
      {/* Company Header */}
      <div className="flex justify-between items-start mb-8 print:mb-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 print:text-2xl">
            Zami Tech Solutions
          </h1>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Revlon Plaza</p>
            <p>Biashara Street</p>
            <p>Phone: (+254) 723-456789</p>
            <p>Email: billing@zamitechsolutions.co.ke</p>
            <p>Website: www.zami.co.ke</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 print:text-xl">
            INVOICE
          </h2>
          <div className="space-y-1 text-sm">
            <p className="font-semibold">Invoice #: {invoice.invoiceNumber}</p>
            <p>Order #: {invoice.orderNumber}</p>
            <p>Date: {invoice.invoiceDate.toLocaleDateString()}</p>
            <p>Due Date: {invoice.dueDate.toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Bill To Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 print:mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 print:text-base">
            Bill To:
          </h3>
          <div className="space-y-1 text-sm">
            <p className="font-semibold">{invoice.customer.name}</p>
            <p>{invoice.customer.email}</p>
            {invoice.customer.phone && <p>{invoice.customer.phone}</p>}
            <div className="mt-2">
              <p className="whitespace-pre-line">{invoice.customer.address}</p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 print:text-base">
            Payment Status:
          </h3>
          <div className="space-y-2">
            <Badge
              variant={
                invoice.paymentStatus === "PAID"
                  ? "default"
                  : invoice.paymentStatus === "PENDING"
                  ? "secondary"
                  : "destructive"
              }
              className="text-sm px-3 py-1">
              {invoice.paymentStatus.charAt(0).toUpperCase() +
                invoice.paymentStatus.slice(1)}
            </Badge>
            {invoice.paymentTerms && (
              <p className="text-sm text-gray-600 mt-2">
                {invoice.paymentTerms}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8 print:mb-6">
        <div className="overflow-hidden border border-gray-200 rounded-lg print:border-gray-400">
          <table className="w-full">
            <thead className="bg-gray-50 print:bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 print:px-2 print:py-2">
                  Description
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 w-20 print:px-2 print:py-2">
                  Qty
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 w-24 print:px-2 print:py-2">
                  Unit Price
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 w-24 print:px-2 print:py-2">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 print:divide-gray-300">
              {invoice.items.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 print:hover:bg-transparent">
                  <td className="px-4 py-3 print:px-2 print:py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.description}
                      </p>
                      {item.sku && (
                        <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-900 print:px-2 print:py-2">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900 print:px-2 print:py-2">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 print:px-2 print:py-2">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end mb-8 print:mb-6">
        <div className="w-full max-w-sm">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">
                {formatCurrency(invoice.subtotal)}
              </span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount:</span>
                <span className="font-medium text-green-600">
                  -{formatCurrency(invoice.discount)}
                </span>
              </div>
            )}
            {invoice.shipping > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-medium">
                  {formatCurrency(invoice.shipping)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax:</span>
              <span className="font-medium">{formatCurrency(invoice.tax)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 print:border-gray-400">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-gray-900">
                  Total:
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(invoice.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      {invoice.notes && (
        <div className="mb-8 print:mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 print:text-base">
            Notes:
          </h3>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg print:bg-transparent print:p-0">
            {invoice.notes}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-200 pt-6 print:border-gray-400 print:pt-4">
        <div className="text-center text-sm text-gray-500 space-y-1">
          <p>Thank you for your business!</p>
          <p>
            For questions about this invoice, please contact us at
            billing@zamitechsolutions.coke or (+254) 723-456789
          </p>
        </div>
      </div>

      {/* Print-only footer */}
      <div className="hidden print:block mt-8 text-center text-xs text-gray-400">
        <p>This is a computer-generated invoice. No signature required.</p>
      </div>
    </div>
  );
});

InvoicePrintLayout.displayName = "InvoicePrintLayout";
