export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'draft' | 'sent';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  discountRate?: number;
  total: number;
}

export interface BusinessDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  taxId?: string;
  logo?: string;
  website?: string;
}

export interface ClientDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  taxId?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  businessDetails: BusinessDetails;
  clientDetails: ClientDetails;
  lineItems: LineItem[];
  subtotal: number;
  taxTotal: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  grandTotal: number;
  currency: string;
  notes?: string;
  terms?: string;
  paymentTerms?: string;
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    routingNumber?: string;
    swiftCode?: string;
  };
  signature?: string;
  logoUrl?: string;
  signatureUrl?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type InvoiceFormData = Omit<
  Invoice,
  'id' | 'createdAt' | 'updatedAt' | 'subtotal' | 'taxTotal' | 'grandTotal'
> & {
  id?: string;
  subtotal?: number;
  taxTotal?: number;
  grandTotal?: number;
};
