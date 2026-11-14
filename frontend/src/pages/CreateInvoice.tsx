import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import InvoiceForm from '../components/invoice/InvoiceForm';
import InvoicePreview from '../components/invoice/InvoicePreview';
import { useInvoices } from '../context/InvoiceContext';
import { useBusiness } from '../context/BusinessContext';
import BusinessSwitcher from '../components/business/BusinessSwitcher';
import BusinessFormModal from '../components/business/BusinessFormModal';
import type { InvoiceFormData, BusinessProfile, BusinessProfileFormData } from '../types';

interface CreateInvoiceProps {
  onBack: () => void;
  onSuccess: () => void;
  onManageBusinesses?: () => void;
}

function buildInvoiceFromBusiness(business: BusinessProfile | null): Partial<InvoiceFormData> {
  if (!business) {
    return {
      businessDetails: {
        name: 'My Business',
        email: 'billing@example.com',
        phone: '+1 (555) 000-0000',
        address: '123 Business Way',
      },
      currency: 'USD',
    };
  }

  const address = [
    business.streetAddress,
    business.city,
    business.state,
    business.postalCode,
    business.country,
  ]
    .filter(Boolean)
    .join(', ');

  return {
    businessId: business.id,
    currency: business.defaultCurrency || 'USD',
    logoUrl: business.logoUrl || undefined,
    businessDetails: {
      name: business.businessName,
      email: business.email || '',
      phone: business.phone || '',
      address: address || business.streetAddress || '',
      taxId: business.taxNumber || undefined,
      logo: business.logoUrl || undefined,
      website: business.website || undefined,
    },
    bankDetails: {
      bankName: business.bankName || undefined,
      accountNumber: business.accountNumber || undefined,
      routingNumber: business.ifscCode || undefined,
      swiftCode: business.swiftCode || undefined,
    },
    paymentTerms:
      business.defaultPaymentTerms || 'Payment due within 30 days via direct deposit or wire.',
    notes:
      business.defaultInvoiceNotes ||
      'Thank you for your business. We look forward to our next collaboration!',
    terms:
      business.defaultInvoiceFooter ||
      'All payments to be made in specified currency. Late payments subject to a 1.5% monthly service charge.',
    dueDate: new Date(Date.now() + (business.defaultDuePeriod || 30) * 86400000)
      .toISOString()
      .split('T')[0],
  };
}

export default function CreateInvoice({
  onBack,
  onSuccess,
  onManageBusinesses,
}: CreateInvoiceProps) {
  const { addInvoice } = useInvoices();
  const { activeBusiness, createBusiness } = useBusiness();
  const [isNewBusinessModalOpen, setIsNewBusinessModalOpen] = useState(false);

  const [formData, setFormData] = useState<InvoiceFormData>(() => {
    const bizData = buildInvoiceFromBusiness(activeBusiness);
    return {
      invoiceNumber: `#${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'paid',
      issueDate: new Date().toISOString().split('T')[0] || '2026-10-24',
      dueDate:
        bizData.dueDate ||
        new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] ||
        '2026-11-24',
      currency: bizData.currency || 'USD',
      businessId: bizData.businessId,
      logoUrl: bizData.logoUrl,
      businessDetails: bizData.businessDetails || {
        name: 'My Business',
        email: 'billing@example.com',
        phone: '+1 (555) 000-0000',
        address: '123 Business Way',
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
          taxRate: activeBusiness?.defaultTaxRate ?? 0,
          total: 1200,
        },
      ],
      discount: 0,
      discountType: 'percentage',
      paymentTerms: bizData.paymentTerms,
      notes: bizData.notes,
      terms: bizData.terms,
      bankDetails: bizData.bankDetails,
    };
  });

  // Whenever active business changes, update sender information automatically
  useEffect(() => {
    if (activeBusiness) {
      const bizDefaults = buildInvoiceFromBusiness(activeBusiness);
      setFormData((prev) => ({
        ...prev,
        businessId: activeBusiness.id,
        logoUrl: bizDefaults.logoUrl,
        businessDetails: {
          ...prev.businessDetails,
          ...bizDefaults.businessDetails,
        },
        currency: bizDefaults.currency || prev.currency,
        bankDetails: bizDefaults.bankDetails,
        paymentTerms: bizDefaults.paymentTerms || prev.paymentTerms,
        notes: bizDefaults.notes || prev.notes,
        terms: bizDefaults.terms || prev.terms,
      }));
    }
  }, [activeBusiness]);

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

  const handleCreateNewBusiness = async (data: BusinessProfileFormData) => {
    await createBusiness(data);
    setIsNewBusinessModalOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="w-full flex flex-col gap-6"
    >
      {/* Top Navigation Bar with Business Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 shadow-sm transition-all cursor-pointer self-start"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        <div className="flex items-center gap-3">
          <BusinessSwitcher
            onAddNewBusiness={() => setIsNewBusinessModalOpen(true)}
            onManageBusinesses={onManageBusinesses || onBack}
          />

          <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
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
          ✓ Invoice {formData.invoiceNumber} saved successfully for{' '}
          <span className="font-bold">{activeBusiness?.businessName || 'your business'}</span>!
          Updating dashboard...
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

      {/* Add New Business Modal */}
      <BusinessFormModal
        isOpen={isNewBusinessModalOpen}
        onClose={() => setIsNewBusinessModalOpen(false)}
        onSubmit={handleCreateNewBusiness}
      />
    </motion.div>
  );
}
