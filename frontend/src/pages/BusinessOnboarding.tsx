import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Upload,
  Loader2,
  AlertCircle,
  MapPin,
  Landmark,
} from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { useAuth } from '../context/AuthContext';
import type {
  BusinessProfileFormData,
  BusinessType,
  TaxRegistrationType,
} from '../types';

interface BusinessOnboardingProps {
  onComplete: () => void;
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

export default function BusinessOnboarding({ onComplete }: BusinessOnboardingProps) {
  const { createBusiness, isSaving } = useBusiness();
  const { user, profile } = useAuth();

  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  const [formData, setFormData] = useState<BusinessProfileFormData>({
    businessName: '',
    businessType: 'Freelancer',
    businessDescription: '',
    logoUrl: '',
    email: user?.email || '',
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
    accountHolderName: profile?.fullName || '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    swiftCode: '',
    upiId: '',
    paymentInstructions: '',
    defaultCurrency: 'USD',
    defaultPaymentTerms: 'Payment due within 30 days via direct wire or transfer.',
    defaultInvoiceNotes: 'Thank you for your business. We look forward to our next collaboration!',
    defaultInvoiceFooter: 'All payments to be made in specified currency. Late payments subject to 1.5% fee.',
    defaultDuePeriod: 30,
    isDefault: true,
  });

  const [error, setError] = useState<string | null>(null);

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

  const handleSaveAndFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName.trim()) {
      setError('Please provide a Business Name to continue.');
      setActiveStep(1);
      return;
    }

    setError(null);
    try {
      await createBusiness({
        ...formData,
        isDefault: true,
      });
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save business profile');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8FAF9] flex flex-col items-center justify-center py-10 px-4 sm:px-6">
      {/* Ambient Glow */}
      <div className="absolute top-0 left-0 right-0 h-[480px] bg-[radial-gradient(ellipse_at_50%_-5%,#86efac_0%,#bbf7d0_28%,#dcfce7_55%,#f8faf9_88%)] pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-6">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center flex flex-col items-center gap-2 max-w-lg"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 shadow-sm mb-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Welcome Onboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Set Up Your Business Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Enter your business information once. It will automatically populate your invoice branding, payment details, and address on every document you generate.
          </p>
        </motion.div>

        {/* Feature Highlights Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full">
          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-sm text-left">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-800">1-Click Auto-Fill</span>
              <span className="text-[10px] text-slate-400">Zero repetitive data entry</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-sm text-left">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-800">Multi-Business</span>
              <span className="text-[10px] text-slate-400">Manage multiple brands</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-sm text-left">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-800">Secure Payments</span>
              <span className="text-[10px] text-slate-400">Encrypted bank & UPI details</span>
            </div>
          </div>
        </div>

        {/* Main Form Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full bg-white rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-slate-200/90 overflow-hidden"
        >
          {/* Step indicator */}
          <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              {[
                { step: 1, label: 'Identity', icon: Building2 },
                { step: 2, label: 'Address & Tax', icon: MapPin },
                { step: 3, label: 'Bank & Currency', icon: Landmark },
              ].map((s) => {
                const Icon = s.icon;
                const isCurrent = activeStep === s.step;
                const isPassed = activeStep > s.step;
                return (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setActiveStep(s.step as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-slate-900 text-white shadow-sm'
                        : isPassed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                );
              })}
            </div>
            <span className="text-xs text-slate-400 font-medium">Step {activeStep} of 3</span>
          </div>

          {error && (
            <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSaveAndFinish} className="p-6 space-y-4">
            {/* STEP 1: IDENTITY */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Business / Trade Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="e.g. Santhosh Digital Solutions"
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Business Type
                    </label>
                    <select
                      value={formData.businessType}
                      onChange={(e) =>
                        setFormData({ ...formData, businessType: e.target.value as BusinessType })
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      {businessTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Business Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="hello@yourbusiness.com"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Website (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="www.yourcompany.com"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">
                    Company Logo (Optional)
                  </label>
                  <div className="flex items-center gap-3.5 p-3 rounded-2xl border border-slate-200 bg-slate-50/50">
                    {formData.logoUrl ? (
                      <img
                        src={formData.logoUrl}
                        alt="Logo Preview"
                        className="w-14 h-14 rounded-xl object-contain bg-white border border-slate-200 p-1"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                        <Building2 className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer shadow-sm">
                        <Upload className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{formData.logoUrl ? 'Replace Logo' : 'Upload Logo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-slate-400 mt-1">
                        PNG or JPG. Can be updated anytime later.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: ADDRESS & TAX */}
            {activeStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={formData.streetAddress}
                    onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                    placeholder="e.g. 100 Innovation Way, Suite 200"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. San Francisco"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      State / Region
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="e.g. California"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">Country</label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="e.g. United States"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      ZIP / Postal Code
                    </label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      placeholder="e.g. 94103"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-800 block mb-2">
                    Tax Registration (Optional)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <select
                        value={formData.taxType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            taxType: e.target.value as TaxRegistrationType,
                          })
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      >
                        {taxTypes.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={formData.taxNumber}
                        onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                        placeholder="Tax ID / Registration number"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: BANK & PREFERENCES */}
            {activeStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Default Currency
                    </label>
                    <select
                      value={formData.defaultCurrency}
                      onChange={(e) =>
                        setFormData({ ...formData, defaultCurrency: e.target.value })
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="USD">USD ($) - US Dollar</option>
                      <option value="EUR">EUR (€) - Euro</option>
                      <option value="GBP">GBP (£) - British Pound</option>
                      <option value="INR">INR (₹) - Indian Rupee</option>
                      <option value="CAD">CAD ($) - Canadian Dollar</option>
                      <option value="AUD">AUD ($) - Australian Dollar</option>
                      <option value="SGD">SGD ($) - Singapore Dollar</option>
                      <option value="AED">AED (د.إ) - UAE Dirham</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Bank Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      placeholder="e.g. JPMorgan Chase"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      Account Number / IBAN (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      placeholder="1234567890"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1">
                      IFSC / Routing / Swift (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.ifscCode}
                      onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                      placeholder="e.g. 021000021"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center gap-2 text-xs text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>
                    You can add more businesses, edit these details, or add UPI IDs anytime in Settings.
                  </span>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              {activeStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => (prev - 1) as any)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Back
                </button>
              ) : (
                <div />
              )}

              {activeStep < 3 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activeStep === 1 && !formData.businessName.trim()) {
                      setError('Business Name is required');
                      return;
                    }
                    setError(null);
                    setActiveStep((prev) => (prev + 1) as any);
                  }}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Setup & Launch Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
