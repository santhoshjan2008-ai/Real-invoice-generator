import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Building,
  MapPin,
  Landmark,
  FileText,
  Upload,
  Loader2,
  Check,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import type {
  BusinessProfile,
  BusinessProfileFormData,
  BusinessType,
  TaxRegistrationType,
} from '../../types';

interface BusinessFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BusinessProfileFormData) => Promise<void>;
  initialData?: BusinessProfile | null;
  isFirstBusiness?: boolean;
}

const businessTypes: BusinessType[] = [
  'Freelancer',
  'Consultant',
  'Sole Proprietorship',
  'Partnership',
  'Private Limited',
  'Agency',
  'Other',
];

const taxTypes: TaxRegistrationType[] = [
  'GSTIN',
  'VAT',
  'Tax ID',
  'Other',
  'Not Applicable',
];

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: '$', name: 'Australian Dollar' },
  { code: 'SGD', symbol: '$', name: 'Singapore Dollar' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
];

export default function BusinessFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isFirstBusiness = false,
}: BusinessFormModalProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'address' | 'tax_bank' | 'preferences'>('basic');
  const [formData, setFormData] = useState<BusinessProfileFormData>({
    businessName: '',
    businessType: 'Freelancer',
    businessDescription: '',
    logoUrl: '',
    email: '',
    phone: '',
    website: '',
    streetAddress: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    taxType: 'Not Applicable',
    taxNumber: '',
    defaultTaxRate: 0,
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    swiftCode: '',
    upiId: '',
    paymentInstructions: '',
    defaultCurrency: 'USD',
    defaultPaymentTerms: 'Payment due within 30 days via direct deposit or wire.',
    defaultInvoiceNotes: 'Thank you for your business. We look forward to our next collaboration!',
    defaultInvoiceFooter: 'All payments to be made in specified currency. Late payments subject to 1.5% monthly service charge.',
    defaultDuePeriod: 30,
    isDefault: isFirstBusiness,
  });

  const [errors, setErrors] = useState<{ businessName?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        businessName: initialData.businessName,
        businessType: initialData.businessType,
        businessDescription: initialData.businessDescription || '',
        logoUrl: initialData.logoUrl || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        website: initialData.website || '',
        streetAddress: initialData.streetAddress || '',
        city: initialData.city || '',
        state: initialData.state || '',
        country: initialData.country || '',
        postalCode: initialData.postalCode || '',
        taxType: initialData.taxType || 'Not Applicable',
        taxNumber: initialData.taxNumber || '',
        defaultTaxRate: initialData.defaultTaxRate ?? 0,
        accountHolderName: initialData.accountHolderName || '',
        bankName: initialData.bankName || '',
        accountNumber: initialData.accountNumber || '',
        ifscCode: initialData.ifscCode || '',
        swiftCode: initialData.swiftCode || '',
        upiId: initialData.upiId || '',
        paymentInstructions: initialData.paymentInstructions || '',
        defaultCurrency: initialData.defaultCurrency || 'USD',
        defaultPaymentTerms: initialData.defaultPaymentTerms || '',
        defaultInvoiceNotes: initialData.defaultInvoiceNotes || '',
        defaultInvoiceFooter: initialData.defaultInvoiceFooter || '',
        defaultDuePeriod: initialData.defaultDuePeriod ?? 30,
        isDefault: initialData.isDefault,
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        isDefault: isFirstBusiness,
      }));
    }
    setActiveTab('basic');
    setErrors({});
  }, [initialData, isFirstBusiness, isOpen]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        logoUrl: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({
      ...prev,
      logoUrl: '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName.trim()) {
      setErrors({ businessName: 'Business Name is required' });
      setActiveTab('basic');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error('[BusinessFormModal] Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-sm">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {initialData ? 'Edit Business Profile' : 'Add New Business'}
              </h2>
              <p className="text-xs text-slate-500">
                Configure your business details to auto-populate invoices
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-100 overflow-x-auto no-scrollbar bg-white">
          {[
            { id: 'basic', label: 'Basic Info', icon: Building },
            { id: 'address', label: 'Address', icon: MapPin },
            { id: 'tax_bank', label: 'Tax & Banking', icon: Landmark },
            { id: 'preferences', label: 'Invoice Defaults', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: BASIC INFO */}
          {activeTab === 'basic' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {/* Business Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Business Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => {
                    setFormData({ ...formData, businessName: e.target.value });
                    if (errors.businessName) setErrors({});
                  }}
                  placeholder="e.g. Acme Design Studio"
                  className={`w-full bg-white border rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                    errors.businessName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  }`}
                />
                {errors.businessName && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.businessName}</span>
                  </p>
                )}
              </div>

              {/* Business Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Business Type
                  </label>
                  <select
                    value={formData.businessType}
                    onChange={(e) =>
                      setFormData({ ...formData, businessType: e.target.value as BusinessType })
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {businessTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Business Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="billing@yourcompany.com"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Phone & Website */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Website (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="www.yourcompany.com"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Business Logo
                </label>
                <div className="flex items-center gap-4 p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50">
                  {formData.logoUrl ? (
                    <div className="relative group">
                      <img
                        src={formData.logoUrl}
                        alt="Logo Preview"
                        className="w-16 h-16 rounded-xl object-contain bg-white border border-slate-200 p-1"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-colors shadow"
                        title="Remove logo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                      <Building className="w-6 h-6" />
                    </div>
                  )}

                  <div className="flex-1">
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer shadow-sm transition-all">
                      <Upload className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{formData.logoUrl ? 'Change Logo' : 'Upload Logo'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-400 mt-1">
                      PNG, JPG, SVG or WEBP (Max 2MB).
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Business Description (Optional)
                </label>
                <textarea
                  value={formData.businessDescription}
                  onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                  rows={2}
                  placeholder="Short summary of what your business does..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </motion.div>
          )}

          {/* TAB 2: ADDRESS */}
          {activeTab === 'address' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.streetAddress}
                  onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                  placeholder="123 Business Boulevard, Suite 400"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="San Francisco"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    State / Province
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="California"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="United States"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ZIP / Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="94102"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: TAX & BANKING */}
          {activeTab === 'tax_bank' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="space-y-5"
            >
              {/* Tax Sub-section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Tax Information (Optional)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">
                      Tax Registration Type
                    </label>
                    <select
                      value={formData.taxType}
                      onChange={(e) =>
                        setFormData({ ...formData, taxType: e.target.value as TaxRegistrationType })
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      {taxTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">
                      Tax Number / ID
                    </label>
                    <input
                      type="text"
                      value={formData.taxNumber}
                      onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                      placeholder="e.g. 29AAAAA0000A1Z5"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">
                      Default Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.defaultTaxRate}
                      onChange={(e) =>
                        setFormData({ ...formData, defaultTaxRate: parseFloat(e.target.value) || 0 })
                      }
                      placeholder="0"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Banking Sub-section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Landmark className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Banking / Payment Information (Optional)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={formData.accountHolderName}
                      onChange={(e) =>
                        setFormData({ ...formData, accountHolderName: e.target.value })
                      }
                      placeholder="John Doe"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      placeholder="Silicon Valley Bank"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">
                      Account Number / IBAN
                    </label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      placeholder="987654321098"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">
                      IFSC / Routing Number
                    </label>
                    <input
                      type="text"
                      value={formData.ifscCode}
                      onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                      placeholder="e.g. SBIN0001234 / 021000021"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">
                      SWIFT / BIC Code (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.swiftCode}
                      onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
                      placeholder="e.g. CHASUS33"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">
                      UPI ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.upiId}
                      onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                      placeholder="username@okhdfcbank"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">
                    Custom Payment Instructions
                  </label>
                  <textarea
                    value={formData.paymentInstructions}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentInstructions: e.target.value })
                    }
                    rows={2}
                    placeholder="e.g. Please include invoice number in wire transfer description."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    Your payment information is encrypted and only attached to invoices when you specify.
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: INVOICE DEFAULTS */}
          {activeTab === 'preferences' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Default Currency
                  </label>
                  <select
                    value={formData.defaultCurrency}
                    onChange={(e) => setFormData({ ...formData, defaultCurrency: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {currencies.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.symbol}) — {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Default Due Period (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={formData.defaultDuePeriod}
                    onChange={(e) =>
                      setFormData({ ...formData, defaultDuePeriod: parseInt(e.target.value) || 30 })
                    }
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Default Payment Terms
                </label>
                <input
                  type="text"
                  value={formData.defaultPaymentTerms}
                  onChange={(e) => setFormData({ ...formData, defaultPaymentTerms: e.target.value })}
                  placeholder="e.g. Payment due within 30 days via direct wire"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Default Invoice Notes
                </label>
                <textarea
                  value={formData.defaultInvoiceNotes}
                  onChange={(e) => setFormData({ ...formData, defaultInvoiceNotes: e.target.value })}
                  rows={2}
                  placeholder="e.g. Thank you for your partnership!"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Default Terms & Conditions / Footer
                </label>
                <textarea
                  value={formData.defaultInvoiceFooter}
                  onChange={(e) => setFormData({ ...formData, defaultInvoiceFooter: e.target.value })}
                  rows={2}
                  placeholder="e.g. All payments in USD. Late payments subject to a 1.5% fee."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">
                      Set as Default Business
                    </span>
                    <span className="text-[11px] text-slate-400">
                      New sessions and invoices will select this business profile automatically.
                    </span>
                  </div>
                </label>
              </div>
            </motion.div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{initialData ? 'Save Changes' : 'Save Business'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
