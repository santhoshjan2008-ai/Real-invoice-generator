export type BusinessType =
  | 'Freelancer'
  | 'Consultant'
  | 'Sole Proprietorship'
  | 'Partnership'
  | 'Private Limited'
  | 'Agency'
  | 'Other';

export type TaxRegistrationType =
  | 'GSTIN'
  | 'VAT'
  | 'Tax ID'
  | 'Other'
  | 'Not Applicable';

export interface BusinessProfile {
  id: string;
  userId: string;
  businessName: string;
  businessType: BusinessType;
  businessDescription?: string;
  logoUrl?: string;
  email?: string;
  phone?: string;
  website?: string;

  // Business Address
  streetAddress?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;

  // Tax Information
  taxType?: TaxRegistrationType;
  taxNumber?: string;
  defaultTaxRate?: number;

  // Banking / Payment Information
  accountHolderName?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  swiftCode?: string;
  upiId?: string;
  paymentInstructions?: string;

  // Default Invoice Preferences
  defaultCurrency: string;
  defaultPaymentTerms?: string;
  defaultInvoiceNotes?: string;
  defaultInvoiceFooter?: string;
  defaultDuePeriod: number;

  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BusinessProfileFormData = Omit<
  BusinessProfile,
  'id' | 'userId' | 'createdAt' | 'updatedAt' | 'isDefault'
> & {
  id?: string;
  isDefault?: boolean;
};
