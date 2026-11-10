import { useState } from 'react';
import {
  Plus,
  Trash2,
  Upload,
  Calendar,
  Building,
  User,
  CreditCard,
  FileText,
  DollarSign,
  Percent,
  Loader2,
  X,
} from 'lucide-react';
import type { InvoiceFormData, LineItem } from '../../types';
import { uploadLogo } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';

interface InvoiceFormProps {
  formData: InvoiceFormData;
  onChange: (updated: InvoiceFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function InvoiceForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
}: InvoiceFormProps) {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<'details' | 'items' | 'payment'>('details');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const updateBusiness = (field: string, value: string) => {
    onChange({
      ...formData,
      businessDetails: {
        ...formData.businessDetails,
        [field]: value,
      },
    });
  };

  const updateClient = (field: string, value: string) => {
    onChange({
      ...formData,
      clientDetails: {
        ...formData.clientDetails,
        [field]: value,
      },
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;

      // Immediate visual update with persistent dataUrl
      onChange({
        ...formData,
        businessDetails: {
          ...formData.businessDetails,
          logo: dataUrl,
        },
      });

      if (user?.id) {
        setIsUploadingLogo(true);
        try {
          const result = await uploadLogo(user.id, formData.id || `inv-${Date.now()}`, file);
          if (result.url) {
            onChange({
              ...formData,
              logoUrl: result.url,
              businessDetails: {
                ...formData.businessDetails,
                logo: result.url,
              },
            });
          }
        } catch (err) {
          console.warn('Failed uploading logo to Supabase Storage:', err);
        } finally {
          setIsUploadingLogo(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    onChange({
      ...formData,
      logoUrl: undefined,
      businessDetails: {
        ...formData.businessDetails,
        logo: '',
      },
    });
  };

  const handleAddItem = () => {
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 0,
      total: 0,
    };
    onChange({
      ...formData,
      lineItems: [...formData.lineItems, newItem],
    });
  };

  const handleUpdateItem = (id: string, field: keyof LineItem, value: string | number) => {
    const updatedItems = formData.lineItems.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        const qty = Number(updated.quantity) || 0;
        const price = Number(updated.unitPrice) || 0;
        const tax = Number(updated.taxRate) || 0;
        updated.total = qty * price * (1 + tax / 100);
        return updated;
      }
      return item;
    });

    onChange({
      ...formData,
      lineItems: updatedItems,
    });
  };

  const handleRemoveItem = (id: string) => {
    onChange({
      ...formData,
      lineItems: formData.lineItems.filter((item) => item.id !== id),
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col gap-6">
      {/* Form Navigation Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-full text-xs font-semibold max-w-md mx-auto w-full">
        <button
          type="button"
          onClick={() => setActiveSection('details')}
          className={`flex-1 py-2 rounded-full transition-all cursor-pointer ${
            activeSection === 'details'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          1. General & Parties
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('items')}
          className={`flex-1 py-2 rounded-full transition-all cursor-pointer ${
            activeSection === 'items'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          2. Line Items ({formData.lineItems.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('payment')}
          className={`flex-1 py-2 rounded-full transition-all cursor-pointer ${
            activeSection === 'payment'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          3. Terms & Notes
        </button>
      </div>

      {/* SECTION 1: GENERAL & PARTIES */}
      {activeSection === 'details' && (
        <div className="flex flex-col gap-6">
          {/* Invoice Meta */}
          <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Invoice Number</label>
              <input
                type="text"
                value={formData.invoiceNumber}
                onChange={(e) => onChange({ ...formData, invoiceNumber: e.target.value })}
                placeholder="#1237"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Issue Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => onChange({ ...formData, issueDate: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Due Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => onChange({ ...formData, dueDate: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => onChange({ ...formData, currency: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => onChange({ ...formData, status: e.target.value as any })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="sent">Sent</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* Sender & Business Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm">
                  <Building className="w-4 h-4 text-emerald-600" />
                  <span>Sender Details (Your Company)</span>
                </div>
                <label className="cursor-pointer text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-medium">
                  {isUploadingLogo ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>{formData.businessDetails.logo ? 'Change Logo' : 'Upload Logo'}</span>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={isUploadingLogo} className="hidden" />
                </label>
              </div>

              {formData.businessDetails.logo && (
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <img src={formData.businessDetails.logo} alt="Logo" className="h-8 max-w-[120px] object-contain rounded" />
                    <span className="text-xs text-slate-500 font-medium">
                      {isUploadingLogo ? 'Uploading to cloud...' : 'Logo saved'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                    title="Remove Logo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div>
                <label className="text-xs text-slate-500 block mb-0.5">Business Name</label>
                <input
                  type="text"
                  value={formData.businessDetails.name}
                  onChange={(e) => updateBusiness('name', e.target.value)}
                  placeholder="Acme Studios"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-500 block mb-0.5">Email</label>
                  <input
                    type="email"
                    value={formData.businessDetails.email}
                    onChange={(e) => updateBusiness('email', e.target.value)}
                    placeholder="contact@company.com"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-0.5">Phone</label>
                  <input
                    type="text"
                    value={formData.businessDetails.phone}
                    onChange={(e) => updateBusiness('phone', e.target.value)}
                    placeholder="+1 555-0199"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-0.5">Physical Address</label>
                <input
                  type="text"
                  value={formData.businessDetails.address}
                  onChange={(e) => updateBusiness('address', e.target.value)}
                  placeholder="123 Innovation Way, Suite 200, San Francisco, CA"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-0.5">Tax ID / VAT / GSTIN</label>
                <input
                  type="text"
                  value={formData.businessDetails.taxId || ''}
                  onChange={(e) => updateBusiness('taxId', e.target.value)}
                  placeholder="US-EIN-12345678"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Client Info */}
            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm border-b border-slate-200/80 pb-2.5">
                <User className="w-4 h-4 text-emerald-600" />
                <span>Client Details (Bill To)</span>
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-0.5">Client or Company Name</label>
                <input
                  type="text"
                  value={formData.clientDetails.name}
                  onChange={(e) => updateClient('name', e.target.value)}
                  placeholder="Acme Corp / John Smith"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-500 block mb-0.5">Email</label>
                  <input
                    type="email"
                    value={formData.clientDetails.email}
                    onChange={(e) => updateClient('email', e.target.value)}
                    placeholder="billing@client.com"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-0.5">Phone</label>
                  <input
                    type="text"
                    value={formData.clientDetails.phone}
                    onChange={(e) => updateClient('phone', e.target.value)}
                    placeholder="+1 555-0288"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-0.5">Billing Address</label>
                <input
                  type="text"
                  value={formData.clientDetails.address}
                  onChange={(e) => updateClient('address', e.target.value)}
                  placeholder="742 Evergreen Terrace, Springfield, IL"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-0.5">Client Tax / Business ID</label>
                <input
                  type="text"
                  value={formData.clientDetails.taxId || ''}
                  onChange={(e) => updateClient('taxId', e.target.value)}
                  placeholder="ACM-882910"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: LINE ITEMS */}
      {activeSection === 'items' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-800">Invoice Items</span>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-full text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {formData.lineItems.map((item, idx) => (
              <div
                key={item.id}
                className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 grid grid-cols-12 gap-3 items-center"
              >
                <div className="col-span-12 sm:col-span-5">
                  <label className="text-[11px] text-slate-400 block mb-0.5">Item Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                    placeholder="e.g. Design Consulting, Software License"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <label className="text-[11px] text-slate-400 block mb-0.5">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-center"
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <label className="text-[11px] text-slate-400 block mb-0.5">Price ({formData.currency})</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-right"
                  />
                </div>
                <div className="col-span-3 sm:col-span-2">
                  <label className="text-[11px] text-slate-400 block mb-0.5">Tax %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={item.taxRate || 0}
                    onChange={(e) => handleUpdateItem(item.id, 'taxRate', parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-center"
                  />
                </div>
                <div className="col-span-1 text-right flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {formData.lineItems.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">
                No items added yet. Click &quot;Add Item&quot; to begin.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: TERMS & NOTES */}
      {activeSection === 'payment' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100 flex flex-col gap-3">
              <span className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Percent className="w-4 h-4 text-emerald-600" />
                <span>Discounts & Adjustments</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-500 block mb-0.5">Discount Amount</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.discount || 0}
                    onChange={(e) => onChange({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-0.5">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => onChange({ ...formData, discountType: e.target.value as any })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Currency ({formData.currency})</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100 flex flex-col gap-3">
              <span className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Payment & Bank Details</span>
              </span>
              <div>
                <label className="text-xs text-slate-500 block mb-0.5">Payment Instructions</label>
                <input
                  type="text"
                  value={formData.paymentTerms || ''}
                  onChange={(e) => onChange({ ...formData, paymentTerms: e.target.value })}
                  placeholder="e.g. Bank Wire / Stripe / PayPal / UPI"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Notes to Client</label>
              <textarea
                rows={3}
                value={formData.notes || ''}
                onChange={(e) => onChange({ ...formData, notes: e.target.value })}
                placeholder="Thank you for your business! It was a pleasure working with you."
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Terms & Conditions</label>
              <textarea
                rows={3}
                value={formData.terms || ''}
                onChange={(e) => onChange({ ...formData, terms: e.target.value })}
                placeholder="Payment is due within 30 days. Late fees apply after 15 days."
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Form Action Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-full text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          Cancel
        </button>

        <div className="flex items-center gap-3">
          {activeSection !== 'payment' && (
            <button
              type="button"
              onClick={() => setActiveSection(activeSection === 'details' ? 'items' : 'payment')}
              className="px-5 py-2.5 rounded-full text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
            >
              Next Step →
            </button>
          )}

          <button
            type="button"
            onClick={onSubmit}
            className="px-6 py-2.5 rounded-full text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all cursor-pointer"
          >
            Save & Update Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

