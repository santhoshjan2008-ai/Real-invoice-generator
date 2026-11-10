import { supabase } from './supabaseClient';
import type { Invoice, InvoiceFormData } from '../types';
import { uploadLogo } from './storageService';
import { generateAndUploadPdfSilently } from '../utils/pdfExport';

const STORAGE_KEY = 'real_invoice_generator_invoices';

const defaultBusiness = {
  name: 'De Silva & Co.',
  email: 'alex@company.com',
  phone: '+1 (555) 234-5678',
  address: '123 Business Boulevard, Suite 400, San Francisco, CA 94102',
  taxId: 'US-EIN-94-1234567',
  website: 'www.desilva-design.com',
};

const initialMockInvoices: Invoice[] = [
  {
    id: 'inv-1234',
    invoiceNumber: '#1234',
    status: 'paid',
    issueDate: '2026-10-24',
    dueDate: '2026-11-24',
    businessDetails: { ...defaultBusiness },
    clientDetails: {
      name: 'Acme Corp',
      email: 'billing@acmecorp.com',
      phone: '+1 (555) 100-2001',
      address: '742 Evergreen Terrace, Springfield, IL 62704',
      taxId: 'ACM-882910',
    },
    lineItems: [
      { id: 'li-1', description: 'Product Brand Strategy & UI/UX Design', quantity: 1, unitPrice: 1200, taxRate: 0, total: 1200 },
    ],
    subtotal: 1200,
    taxTotal: 0,
    discount: 0,
    discountType: 'fixed',
    grandTotal: 1200,
    currency: 'USD',
    notes: 'Thank you for your partnership!',
    terms: 'Net 30 days',
    paymentTerms: 'Payment received in full.',
    createdAt: '2026-10-24T08:30:00Z',
    updatedAt: '2026-10-24T14:20:00Z',
  },
  {
    id: 'inv-1235',
    invoiceNumber: '#1235',
    status: 'sent',
    issueDate: '2026-10-23',
    dueDate: '2026-11-23',
    businessDetails: { ...defaultBusiness },
    clientDetails: {
      name: 'Globex Inc',
      email: 'accounts@globex.com',
      phone: '+1 (555) 200-3002',
      address: '100 Industrial Way, Shelbyville, IL 62565',
      taxId: 'GLX-99412',
    },
    lineItems: [
      { id: 'li-2', description: 'Enterprise Dashboard Development - Sprint 1', quantity: 1, unitPrice: 4500, taxRate: 0, total: 4500 },
    ],
    subtotal: 4500,
    taxTotal: 0,
    discount: 0,
    discountType: 'fixed',
    grandTotal: 4500,
    currency: 'USD',
    notes: 'Due upon receipt of deliverables.',
    terms: 'Net 30 days',
    paymentTerms: 'Pending client clearance.',
    createdAt: '2026-10-23T11:00:00Z',
    updatedAt: '2026-10-23T11:00:00Z',
  },
  {
    id: 'inv-1232',
    invoiceNumber: '#1232',
    status: 'paid',
    issueDate: '2026-10-22',
    dueDate: '2026-11-22',
    businessDetails: { ...defaultBusiness },
    clientDetails: {
      name: 'Stark Ind.',
      email: 'finance@starkindustries.com',
      phone: '+1 (555) 300-4003',
      address: '10880 Wilshire Blvd, Los Angeles, CA 90024',
    },
    lineItems: [
      { id: 'li-3', description: 'Mobile App Interaction Prototype', quantity: 1, unitPrice: 850, taxRate: 0, total: 850 },
    ],
    subtotal: 850,
    taxTotal: 0,
    discount: 0,
    discountType: 'fixed',
    grandTotal: 850,
    currency: 'USD',
    notes: 'Approved by Pepper Potts.',
    terms: 'Due on receipt',
    paymentTerms: 'Paid via Wire Transfer.',
    createdAt: '2026-10-22T09:15:00Z',
    updatedAt: '2026-10-22T16:45:00Z',
  },
  {
    id: 'inv-1228',
    invoiceNumber: '#1228',
    status: 'overdue',
    issueDate: '2026-10-20',
    dueDate: '2026-11-05',
    businessDetails: { ...defaultBusiness },
    clientDetails: {
      name: 'Wayne Enterprises',
      email: 'procurement@wayne.com',
      phone: '+1 (555) 400-5004',
      address: '1007 Mountain Drive, Gotham City, NJ 07001',
    },
    lineItems: [
      { id: 'li-4', description: 'Security Audit & Cloud Infrastructure Review', quantity: 1, unitPrice: 3200, taxRate: 0, total: 3200 },
    ],
    subtotal: 3200,
    taxTotal: 0,
    discount: 0,
    discountType: 'fixed',
    grandTotal: 3200,
    currency: 'USD',
    notes: 'Second reminder sent.',
    terms: 'Net 15 days',
    paymentTerms: 'Overdue by 5 days.',
    createdAt: '2026-10-20T10:00:00Z',
    updatedAt: '2026-11-06T09:00:00Z',
  },
];

function getStorageKey(userId?: string): string {
  return userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
}

function getLocalInvoices(userId?: string): Invoice[] {
  if (typeof window === 'undefined') return initialMockInvoices;
  try {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(initialMockInvoices));
      return initialMockInvoices;
    }
    return JSON.parse(raw) as Invoice[];
  } catch {
    return initialMockInvoices;
  }
}

function saveLocalInvoices(invoices: Invoice[], userId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const key = getStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(invoices));
  } catch (err) {
    console.error('Failed saving invoices to localStorage fallback', err);
  }
}

// Convert Supabase DB record (snake_case) to Frontend Invoice (camelCase)
export function mapFromDb(record: any): Invoice {
  return {
    id: record.id,
    invoiceNumber: record.invoice_number,
    status: record.status || 'draft',
    issueDate: record.issue_date,
    dueDate: record.due_date,
    currency: record.currency || 'USD',
    businessDetails: record.business_details || {},
    clientDetails: record.client_details || {},
    lineItems: record.line_items || [],
    subtotal: Number(record.subtotal) || 0,
    taxTotal: Number(record.tax_total) || 0,
    discount: Number(record.discount) || 0,
    discountType: record.discount_type || 'percentage',
    grandTotal: Number(record.grand_total) || 0,
    notes: record.notes || '',
    terms: record.terms || '',
    paymentTerms: record.payment_terms || '',
    bankDetails: record.bank_details || {},
    logoUrl: record.logo_url || record.business_details?.logo || undefined,
    signatureUrl: record.signature_url || undefined,
    pdfUrl: record.pdf_url || undefined,
    createdAt: record.created_at || new Date().toISOString(),
    updatedAt: record.updated_at || new Date().toISOString(),
  };
}

// Convert Frontend Invoice to Supabase DB record (snake_case)
export function mapToDb(invoice: InvoiceFormData | Invoice, userId: string): Record<string, any> {
  const calculatedSubtotal = invoice.lineItems.reduce((acc, item) => acc + item.total, 0);
  const taxSum = invoice.lineItems.reduce(
    (acc, item) => acc + (item.total * (item.taxRate || 0)) / 100,
    0
  );
  const discountVal =
    invoice.discountType === 'percentage'
      ? (calculatedSubtotal * (invoice.discount || 0)) / 100
      : invoice.discount || 0;
  const calculatedGrandTotal = Math.max(0, calculatedSubtotal + taxSum - discountVal);

  const cleanLogoUrl =
    (invoice.logoUrl && invoice.logoUrl.startsWith('https://'))
      ? invoice.logoUrl
      : (invoice.businessDetails?.logo && invoice.businessDetails.logo.startsWith('https://'))
        ? invoice.businessDetails.logo
        : null;

  return {
    id: invoice.id || `inv-${Date.now()}`,
    user_id: userId,
    invoice_number: invoice.invoiceNumber.startsWith('#')
      ? invoice.invoiceNumber
      : `#${invoice.invoiceNumber}`,
    status: invoice.status || 'draft',
    issue_date: invoice.issueDate,
    due_date: invoice.dueDate,
    currency: invoice.currency || 'USD',
    business_details: invoice.businessDetails || {},
    client_details: invoice.clientDetails || {},
    line_items: invoice.lineItems || [],
    subtotal: invoice.subtotal ?? calculatedSubtotal,
    tax_total: invoice.taxTotal ?? taxSum,
    discount: invoice.discount || 0,
    discount_type: invoice.discountType || 'percentage',
    grand_total: invoice.grandTotal ?? calculatedGrandTotal,
    notes: invoice.notes || null,
    terms: invoice.terms || null,
    payment_terms: invoice.paymentTerms || null,
    bank_details: invoice.bankDetails || {},
    logo_url: cleanLogoUrl,
    signature_url: invoice.signatureUrl || null,
    pdf_url: invoice.pdfUrl || null,
  };
}

/**
 * Fetch all invoices for the authenticated user from Supabase
 */
export async function getInvoices(userId?: string): Promise<Invoice[]> {
  if (!userId) {
    return getLocalInvoices();
  }

  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[invoiceService] Supabase fetch error (using local cache):', error.message);
      return getLocalInvoices(userId);
    }

    if (!data || data.length === 0) {
      // If user has no invoices yet in Supabase, check local cache or populate baseline
      const local = getLocalInvoices(userId);
      return local;
    }

    const mapped = data.map(mapFromDb);
    // Keep local cache synced
    saveLocalInvoices(mapped, userId);
    return mapped;
  } catch (err) {
    console.error('[invoiceService] Unexpected error getting invoices:', err);
    return getLocalInvoices(userId);
  }
}

/**
 * Create a new invoice in Supabase
 */
export async function createInvoice(data: InvoiceFormData, userId?: string): Promise<Invoice> {
  const calculatedSubtotal = data.lineItems.reduce((acc, item) => acc + item.total, 0);
  const taxSum = data.lineItems.reduce(
    (acc, item) => acc + (item.total * (item.taxRate || 0)) / 100,
    0
  );
  const discountVal =
    data.discountType === 'percentage'
      ? (calculatedSubtotal * (data.discount || 0)) / 100
      : data.discount || 0;
  const grandTotal = Math.max(0, calculatedSubtotal + taxSum - discountVal);

  const newInvoiceId = data.id || `inv-${Date.now()}`;
  const now = new Date().toISOString();

  // 1. Ensure logo is uploaded to Supabase Storage if present
  let finalLogoUrl = data.logoUrl;
  const rawLogo = data.businessDetails?.logo;
  if (userId && rawLogo && !rawLogo.startsWith('https://')) {
    try {
      const uploadRes = await uploadLogo(userId, newInvoiceId, rawLogo);
      if (uploadRes.url) {
        finalLogoUrl = uploadRes.url;
        data.businessDetails.logo = uploadRes.url;
      }
    } catch (e) {
      console.warn('[invoiceService] Logo auto-upload failed:', e);
    }
  }

  // 2. Ensure PDF is generated and uploaded if container is present
  let finalPdfUrl = data.pdfUrl;
  if (userId && !finalPdfUrl && typeof document !== 'undefined') {
    const previewEl = document.getElementById('printable-invoice-container');
    if (previewEl) {
      try {
        const uploadedPdfUrl = await generateAndUploadPdfSilently(
          'printable-invoice-container',
          data.invoiceNumber,
          userId,
          newInvoiceId
        );
        if (uploadedPdfUrl) {
          finalPdfUrl = uploadedPdfUrl;
        }
      } catch (e) {
        console.warn('[invoiceService] PDF auto-upload failed:', e);
      }
    }
  }

  const fullInvoice: Invoice = {
    ...data,
    id: newInvoiceId,
    invoiceNumber: data.invoiceNumber.startsWith('#') ? data.invoiceNumber : `#${data.invoiceNumber}`,
    logoUrl: finalLogoUrl,
    pdfUrl: finalPdfUrl,
    subtotal: calculatedSubtotal,
    taxTotal: taxSum,
    grandTotal: grandTotal,
    createdAt: now,
    updatedAt: now,
  };

  // Always update local cache first
  const current = getLocalInvoices(userId);
  saveLocalInvoices([fullInvoice, ...current], userId);

  if (userId) {
    try {
      const dbRecord = mapToDb(fullInvoice, userId);
      const { data: inserted, error } = await supabase
        .from('invoices')
        .insert(dbRecord)
        .select()
        .single();

      if (error) {
        console.warn('[invoiceService] Supabase insert failed (persisted locally):', error.message);
      } else if (inserted) {
        return mapFromDb(inserted);
      }
    } catch (err) {
      console.error('[invoiceService] Supabase insert error:', err);
    }
  }

  return fullInvoice;
}

/**
 * Update an existing invoice in Supabase
 */
export async function updateInvoice(
  id: string,
  updates: Partial<Invoice>,
  userId?: string
): Promise<Invoice | undefined> {
  // If updates contain a new logo that is not remote yet, upload it
  if (userId && updates.businessDetails?.logo && !updates.businessDetails.logo.startsWith('https://')) {
    try {
      const uploadRes = await uploadLogo(userId, id, updates.businessDetails.logo);
      if (uploadRes.url) {
        updates.logoUrl = uploadRes.url;
        updates.businessDetails.logo = uploadRes.url;
      }
    } catch (e) {
      console.warn('[invoiceService] Update logo auto-upload failed:', e);
    }
  }

  const current = getLocalInvoices(userId);
  const index = current.findIndex((i) => i.id === id);
  let merged: Invoice | undefined;

  if (index !== -1 && current[index]) {
    const existing = current[index];
    merged = {
      ...existing,
      ...updates,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };
    current[index] = merged;
    saveLocalInvoices(current, userId);
  }

  if (userId && merged) {
    try {
      const dbPayload = mapToDb(merged, userId);
      delete dbPayload.id; // don't overwrite PK
      delete dbPayload.user_id;

      const { data: updated, error } = await supabase
        .from('invoices')
        .update(dbPayload)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.warn('[invoiceService] Supabase update failed:', error.message);
      } else if (updated) {
        return mapFromDb(updated);
      }
    } catch (err) {
      console.error('[invoiceService] Supabase update error:', err);
    }
  }

  return merged;
}

/**
 * Delete an invoice in Supabase
 */
export async function deleteInvoice(id: string, userId?: string): Promise<boolean> {
  const current = getLocalInvoices(userId);
  const filtered = current.filter((i) => i.id !== id);
  saveLocalInvoices(filtered, userId);

  if (userId) {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.warn('[invoiceService] Supabase delete failed:', error.message);
      }
    } catch (err) {
      console.error('[invoiceService] Supabase delete error:', err);
    }
  }

  return true;
}

/**
 * Fetch a single invoice by ID
 */
export async function getInvoiceById(id: string, userId?: string): Promise<Invoice | undefined> {
  if (userId) {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        return mapFromDb(data);
      }
    } catch {
      // Fallback to local
    }
  }

  const current = getLocalInvoices(userId);
  return current.find((i) => i.id === id);
}

export const getMockInvoices = getInvoices;
