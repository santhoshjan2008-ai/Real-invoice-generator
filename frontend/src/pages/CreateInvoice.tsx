import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import InvoiceForm from '../components/invoice/InvoiceForm';
import InvoicePreview from '../components/invoice/InvoicePreview';
import { useInvoices } from '../context/InvoiceContext';
import type { InvoiceFormData } from '../types';

interface CreateInvoiceProps {
  onBack: () => void;
  onSuccess: () => void;
}

const defaultFormData: InvoiceFormData = {
  invoiceNumber: `#${Math.floor(1000 + Math.random() * 9000)}`,
  status: 'paid',
  issueDate: new Date().toISOString().split('T')[0] || '2026-10-24',
  dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] || '2026-11-24',
  currency: 'USD',
  businessDetails: {
    name: 'De Silva & Co.',
    email: 'alex@company.com',
    phone: '+1 (555) 234-5678',
    address: '123 Business Boulevard, Suite 400, San Francisco, CA 94102',
    taxId: 'US-EIN-94-1234567',
  },
  clientDetails: {
    name: 'Acme Corp',
    email: 'billing@acmecorp.com',
    phone: '+1 (555) 100-2001',
    address: '742 Evergreen Terrace, Springfield, IL 62704',
    taxId: 'ACM-882910',
  },
  lineItems: [
    {
      id: 'item-1',
      description: 'Brand Identity & Web Application Design',
      quantity: 1,
      unitPrice: 1200,
      taxRate: 0,
      total: 1200,
    },
  ],
  discount: 0,
  discountType: 'percentage',
  paymentTerms: 'Payment due within 30 days via direct deposit or wire.',
  notes: 'Thank you for your business. We look forward to our next collaboration!',
  terms: 'All payments to be made in USD. Late payments subject to a 1.5% monthly service charge.',
};

export default function CreateInvoice({ onBack, onSuccess }: CreateInvoiceProps) {
  const { addInvoice, isSaving } = useInvoices();
  const [formData, setFormData] = useState<InvoiceFormData>(defaultFormData);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async () => {
    try {
      await addInvoice(formData);
      setSavedSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch {
      // error handled in context
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="w-full flex flex-col gap-6"
    >
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 shadow-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Interactive Generator</span>
          </span>
        </div>
      </div>

      {savedSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-semibold text-center shadow-sm"
        >
          ✓ Invoice {formData.invoiceNumber} saved successfully! Updating dashboard...
        </motion.div>
      )}

      {/* Main Form & Live Preview Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-7 w-full">
          <InvoiceForm
            formData={formData}
            onChange={setFormData}
            onSubmit={handleSubmit}
            onCancel={onBack}
          />
        </div>

        {/* Right Column: Sticky Live Preview & PDF Actions */}
        <div className="lg:col-span-5 w-full sticky top-6">
          <InvoicePreview formData={formData} showActions={true} />
        </div>
      </div>
    </motion.div>
  );
}

