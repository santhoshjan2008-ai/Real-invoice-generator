import { useState } from 'react';
import { Download, Printer, Check, Copy } from 'lucide-react';
import type { Invoice } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportInvoiceToPdf, printInvoice } from '../../utils/pdfExport';
import { useAuth } from '../../context/AuthContext';
import { useInvoices } from '../../context/InvoiceContext';

interface InvoicePreviewProps {
  formData: Partial<Invoice>;
  showActions?: boolean;
}

export default function InvoicePreview({ formData, showActions = true }: InvoicePreviewProps) {
  const { user } = useAuth();
  const { updateInvoice } = useInvoices();
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    businessDetails,
    clientDetails,
    invoiceNumber = '#1234',
    issueDate = new Date().toISOString(),
    dueDate = new Date(Date.now() + 30 * 86400000).toISOString(),
    lineItems = [],
    subtotal = 0,
    discount = 0,
    discountType = 'percentage',
    taxTotal = 0,
    grandTotal = 0,
    currency = 'USD',
    notes,
    terms,
    paymentTerms,
    status = 'paid',
  } = formData;

  const computedSubtotal = lineItems.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0
  );
  const computedTax = lineItems.reduce(
    (sum, item) =>
      sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0) * ((Number(item.taxRate) || 0) / 100),
    0
  );
  const displaySubtotal = subtotal || computedSubtotal;
  const displayTax = taxTotal || computedTax;

  const discountAmount =
    discountType === 'percentage'
      ? (displaySubtotal * (Number(discount) || 0)) / 100
      : Number(discount) || 0;

  const displayGrandTotal = Math.max(
    0,
    grandTotal || displaySubtotal + displayTax - discountAmount
  );

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    try {
      const cleanInvNum = (invoiceNumber || 'draft').replace(/[^a-zA-Z0-9_-]/g, '');
      const targetId = formData.id || `inv-${cleanInvNum || Date.now()}`;
      const pdfUrl = await exportInvoiceToPdf('printable-invoice-container', invoiceNumber, {
        userId: user?.id,
        invoiceId: targetId,
      });
      if (pdfUrl && formData.id) {
        await updateInvoice(formData.id, { pdfUrl });
      }
    } catch (err) {
      console.error('PDF export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    printInvoice('printable-invoice-container');
  };

  const handleCopySummary = () => {
    const summary = `Invoice ${invoiceNumber}\nClient: ${clientDetails?.name || 'N/A'}\nTotal: ${formatCurrency(displayGrandTotal, currency)}\nDue: ${formatDate(dueDate)}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Top Toolbar */}
      {showActions && (
        <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Live Preview
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySummary}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-xs flex items-center gap-1.5"
              title="Copy Summary"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-xs flex items-center gap-1.5"
              title="Print Invoice"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 text-white rounded-xl transition-all cursor-pointer text-xs font-medium flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Sheet Container */}
      <div
        id="printable-invoice-container"
        className="w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-[0_12px_40px_rgba(0,0,0,0.06)] text-slate-800"
      >
        {/* Header Section */}
        <div className="flex items-start justify-between pb-8 border-b border-slate-100 gap-4">
          <div className="flex flex-col gap-2">
            {businessDetails?.logo || formData.logoUrl ? (
              <img
                src={businessDetails?.logo || formData.logoUrl}
                alt={businessDetails?.name || 'Company Logo'}
                className="h-12 w-auto max-w-[180px] object-contain mb-1"
              />
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-300 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  {(businessDetails?.name || 'D')[0]}
                </div>
                <span className="font-bold text-xl text-slate-900 tracking-tight">
                  {businessDetails?.name || 'De Silva & Co.'}
                </span>
              </div>
            )}
            <div className="text-xs text-slate-500 flex flex-col gap-0.5 mt-1">
              {businessDetails?.address && <span>{businessDetails.address}</span>}
              {businessDetails?.email && <span>{businessDetails.email}</span>}
              {businessDetails?.phone && <span>{businessDetails.phone}</span>}
              {businessDetails?.taxId && <span>Tax ID: {businessDetails.taxId}</span>}
            </div>
          </div>

          <div className="text-right flex flex-col items-end">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              INVOICE
            </span>
            <span className="text-sm font-semibold text-emerald-600 mt-0.5">
              {invoiceNumber}
            </span>
            <div className="mt-2">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                  status === 'paid'
                    ? 'bg-emerald-100 text-emerald-700'
                    : status === 'overdue'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {status}
              </span>
            </div>
          </div>
        </div>

        {/* Bill To & Invoice Info */}
        <div className="grid grid-cols-2 gap-8 py-7 border-b border-slate-100 text-xs">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
              Billed To
            </span>
            <span className="font-bold text-slate-900 text-sm block">
              {clientDetails?.name || 'Acme Corp'}
            </span>
            <div className="text-slate-500 flex flex-col gap-0.5 mt-1">
              {clientDetails?.address && <span>{clientDetails.address}</span>}
              {clientDetails?.email && <span>{clientDetails.email}</span>}
              {clientDetails?.phone && <span>{clientDetails.phone}</span>}
              {clientDetails?.taxId && <span>Tax ID: {clientDetails.taxId}</span>}
            </div>
          </div>

          <div className="text-right flex flex-col gap-2">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Invoice Date
              </span>
              <span className="font-medium text-slate-700">
                {formatDate(issueDate)}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                Payment Due
              </span>
              <span className="font-semibold text-slate-900">
                {formatDate(dueDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="py-6">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-semibold">Description</th>
                <th className="pb-3 text-center font-semibold w-16">Qty</th>
                <th className="pb-3 text-right font-semibold w-24">Price</th>
                <th className="pb-3 text-center font-semibold w-20">Tax</th>
                <th className="pb-3 text-right font-semibold w-28">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lineItems.length > 0 ? (
                lineItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3.5 pr-2 font-medium text-slate-800">
                      {item.description || 'Service or Item'}
                    </td>
                    <td className="py-3.5 text-center text-slate-600">
                      {item.quantity}
                    </td>
                    <td className="py-3.5 text-right text-slate-600">
                      {formatCurrency(Number(item.unitPrice) || 0, currency)}
                    </td>
                    <td className="py-3.5 text-center text-slate-500">
                      {item.taxRate ? `${item.taxRate}%` : '—'}
                    </td>
                    <td className="py-3.5 text-right font-semibold text-slate-900">
                      {formatCurrency(
                        (Number(item.quantity) || 0) *
                          (Number(item.unitPrice) || 0) *
                          (1 + (Number(item.taxRate) || 0) / 100),
                        currency
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No items specified
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="flex justify-end pt-4 pb-6 border-t border-slate-100">
          <div className="w-64 flex flex-col gap-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="font-medium text-slate-800">
                {formatCurrency(displaySubtotal, currency)}
              </span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-rose-500">
                <span>Discount {discountType === 'percentage' ? `(${discount}%)` : ''}</span>
                <span className="font-medium">
                  -{formatCurrency(discountAmount, currency)}
                </span>
              </div>
            )}

            {displayTax > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Tax</span>
                <span className="font-medium text-slate-800">
                  {formatCurrency(displayTax, currency)}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900">Grand Total</span>
              <span className="text-lg font-extrabold text-slate-900">
                {formatCurrency(displayGrandTotal, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer: Terms, Notes & Payment Instructions */}
        {(notes || terms || paymentTerms) && (
          <div className="pt-6 border-t border-slate-100 text-xs text-slate-500 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {paymentTerms && (
              <div>
                <span className="font-semibold text-slate-700 block mb-0.5">Payment Instructions:</span>
                <p>{paymentTerms}</p>
              </div>
            )}
            {notes && (
              <div>
                <span className="font-semibold text-slate-700 block mb-0.5">Notes:</span>
                <p>{notes}</p>
              </div>
            )}
            {terms && (
              <div className="sm:col-span-2">
                <span className="font-semibold text-slate-700 block mb-0.5">Terms:</span>
                <p>{terms}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
