import { supabase } from './supabaseClient';
import type { BusinessProfile, BusinessProfileFormData } from '../types';
import { uploadBusinessLogo } from './storageService';

const STORAGE_KEY_PREFIX = 'real_invoice_generator_businesses';
const ACTIVE_PREF_PREFIX = 'real_invoice_generator_active_biz';

function getStorageKey(userId?: string): string {
  return userId ? `${STORAGE_KEY_PREFIX}_${userId}` : STORAGE_KEY_PREFIX;
}

function getPrefStorageKey(userId?: string): string {
  return userId ? `${ACTIVE_PREF_PREFIX}_${userId}` : ACTIVE_PREF_PREFIX;
}

function getLocalBusinesses(userId?: string): BusinessProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    return JSON.parse(raw) as BusinessProfile[];
  } catch {
    return [];
  }
}

function saveLocalBusinesses(businesses: BusinessProfile[], userId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(businesses));
  } catch (err) {
    console.error('[businessService] Failed saving businesses to local storage:', err);
  }
}

// Convert Supabase DB snake_case record to camelCase BusinessProfile
export function mapFromDb(record: any): BusinessProfile {
  return {
    id: record.id,
    userId: record.user_id,
    businessName: record.business_name || '',
    businessType: record.business_type || 'Freelancer',
    businessDescription: record.business_description || '',
    logoUrl: record.logo_url || '',
    email: record.email || '',
    phone: record.phone || '',
    website: record.website || '',
    streetAddress: record.street_address || '',
    city: record.city || '',
    state: record.state || '',
    country: record.country || '',
    postalCode: record.postal_code || '',
    taxType: record.tax_type || 'Not Applicable',
    taxNumber: record.tax_number || '',
    defaultTaxRate: Number(record.default_tax_rate) || 0,
    accountHolderName: record.account_holder_name || '',
    bankName: record.bank_name || '',
    accountNumber: record.account_number || '',
    ifscCode: record.ifsc_code || '',
    swiftCode: record.swift_code || '',
    upiId: record.upi_id || '',
    paymentInstructions: record.payment_instructions || '',
    defaultCurrency: record.default_currency || 'USD',
    defaultPaymentTerms: record.default_payment_terms || 'Payment due within 30 days',
    defaultInvoiceNotes: record.default_invoice_notes || 'Thank you for your business!',
    defaultInvoiceFooter: record.default_invoice_footer || '',
    defaultDuePeriod: Number(record.default_due_period) || 30,
    isDefault: Boolean(record.is_default),
    createdAt: record.created_at || new Date().toISOString(),
    updatedAt: record.updated_at || new Date().toISOString(),
  };
}

// Convert frontend BusinessProfileFormData to Supabase DB snake_case
export function mapToDb(
  data: BusinessProfileFormData | Partial<BusinessProfile>,
  userId: string
): Record<string, any> {
  const result: Record<string, any> = {
    user_id: userId,
  };

  if (data.businessName !== undefined) result.business_name = data.businessName;
  if (data.businessType !== undefined) result.business_type = data.businessType;
  if (data.businessDescription !== undefined) result.business_description = data.businessDescription;
  if (data.logoUrl !== undefined) result.logo_url = data.logoUrl;
  if (data.email !== undefined) result.email = data.email;
  if (data.phone !== undefined) result.phone = data.phone;
  if (data.website !== undefined) result.website = data.website;

  if (data.streetAddress !== undefined) result.street_address = data.streetAddress;
  if (data.city !== undefined) result.city = data.city;
  if (data.state !== undefined) result.state = data.state;
  if (data.country !== undefined) result.country = data.country;
  if (data.postalCode !== undefined) result.postal_code = data.postalCode;

  if (data.taxType !== undefined) result.tax_type = data.taxType;
  if (data.taxNumber !== undefined) result.tax_number = data.taxNumber;
  if (data.defaultTaxRate !== undefined) result.default_tax_rate = data.defaultTaxRate;

  if (data.accountHolderName !== undefined) result.account_holder_name = data.accountHolderName;
  if (data.bankName !== undefined) result.bank_name = data.bankName;
  if (data.accountNumber !== undefined) result.account_number = data.accountNumber;
  if (data.ifscCode !== undefined) result.ifsc_code = data.ifscCode;
  if (data.swiftCode !== undefined) result.swift_code = data.swiftCode;
  if (data.upiId !== undefined) result.upi_id = data.upiId;
  if (data.paymentInstructions !== undefined) result.payment_instructions = data.paymentInstructions;

  if (data.defaultCurrency !== undefined) result.default_currency = data.defaultCurrency;
  if (data.defaultPaymentTerms !== undefined) result.default_payment_terms = data.defaultPaymentTerms;
  if (data.defaultInvoiceNotes !== undefined) result.default_invoice_notes = data.defaultInvoiceNotes;
  if (data.defaultInvoiceFooter !== undefined) result.default_invoice_footer = data.defaultInvoiceFooter;
  if (data.defaultDuePeriod !== undefined) result.default_due_period = data.defaultDuePeriod;
  if (data.isDefault !== undefined) result.is_default = data.isDefault;

  return result;
}

/**
 * Fetch all business profiles for the authenticated user
 */
export async function getBusinesses(userId?: string): Promise<BusinessProfile[]> {
  if (!userId) {
    return getLocalBusinesses();
  }

  try {
    const { data, error } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('[businessService] Supabase fetch error (using local cache):', error.message);
      return getLocalBusinesses(userId);
    }

    if (!data || data.length === 0) {
      return getLocalBusinesses(userId);
    }

    const mapped = data.map(mapFromDb);
    saveLocalBusinesses(mapped, userId);
    return mapped;
  } catch (err) {
    console.error('[businessService] Unexpected error getting businesses:', err);
    return getLocalBusinesses(userId);
  }
}

/**
 * Create a new business profile
 */
export async function createBusiness(
  data: BusinessProfileFormData,
  userId: string
): Promise<BusinessProfile> {
  const current = getLocalBusinesses(userId);
  const isFirst = current.length === 0;
  const isDefault = isFirst ? true : Boolean(data.isDefault);
  const newId = data.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `biz-${Date.now()}`);
  const now = new Date().toISOString();

  // If new business is marked as default, unset previous default locally
  let updatedCurrent = current;
  if (isDefault) {
    updatedCurrent = current.map((b) => ({ ...b, isDefault: false }));
  }

  // Handle logo upload if provided as dataUrl or blob
  let finalLogoUrl = data.logoUrl;
  if (data.logoUrl && !data.logoUrl.startsWith('https://')) {
    try {
      const res = await uploadBusinessLogo(userId, newId, data.logoUrl);
      if (res.url) {
        finalLogoUrl = res.url;
      }
    } catch (e) {
      console.warn('[businessService] Failed uploading business logo:', e);
    }
  }

  const newProfile: BusinessProfile = {
    ...data,
    id: newId,
    userId,
    logoUrl: finalLogoUrl,
    isDefault,
    createdAt: now,
    updatedAt: now,
  };

  saveLocalBusinesses([...updatedCurrent, newProfile], userId);

  // Sync to Supabase
  try {
    if (isDefault) {
      await supabase
        .from('business_profiles')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const dbPayload = mapToDb({ ...data, logoUrl: finalLogoUrl, isDefault }, userId);
    dbPayload.id = newId;

    const { data: inserted, error } = await supabase
      .from('business_profiles')
      .insert(dbPayload)
      .select()
      .single();

    if (error) {
      console.warn('[businessService] Supabase insert warning (persisted locally):', error.message);
    } else if (inserted) {
      const mapped = mapFromDb(inserted);
      // Ensure local cache has the db-verified profile
      saveLocalBusinesses([...updatedCurrent, mapped], userId);
      return mapped;
    }
  } catch (err) {
    console.error('[businessService] Supabase insert error:', err);
  }

  return newProfile;
}

/**
 * Update an existing business profile
 */
export async function updateBusiness(
  id: string,
  updates: Partial<BusinessProfileFormData>,
  userId: string
): Promise<BusinessProfile | null> {
  const current = getLocalBusinesses(userId);
  const index = current.findIndex((b) => b.id === id);
  if (index === -1) return null;

  const existing = current[index];
  if (!existing) return null;

  let finalLogoUrl = updates.logoUrl !== undefined ? updates.logoUrl : existing.logoUrl;
  if (updates.logoUrl && !updates.logoUrl.startsWith('https://')) {
    try {
      const res = await uploadBusinessLogo(userId, id, updates.logoUrl);
      if (res.url) {
        finalLogoUrl = res.url;
      }
    } catch (e) {
      console.warn('[businessService] Failed uploading updated logo:', e);
    }
  }

  const isDefault = updates.isDefault !== undefined ? updates.isDefault : existing.isDefault;

  // If setting this to default, unset other defaults
  let updatedList = current.map((b) => {
    if (isDefault && b.id !== id) {
      return { ...b, isDefault: false };
    }
    return b;
  });

  const merged: BusinessProfile = {
    ...existing,
    ...updates,
    logoUrl: finalLogoUrl,
    isDefault,
    updatedAt: new Date().toISOString(),
  };

  updatedList = updatedList.map((b) => (b.id === id ? merged : b));
  saveLocalBusinesses(updatedList, userId);

  try {
    if (isDefault) {
      await supabase
        .from('business_profiles')
        .update({ is_default: false })
        .eq('user_id', userId)
        .neq('id', id);
    }

    const dbPayload = mapToDb({ ...updates, logoUrl: finalLogoUrl, isDefault }, userId);
    delete dbPayload.id;
    delete dbPayload.user_id;

    const { data: updated, error } = await supabase
      .from('business_profiles')
      .update(dbPayload)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.warn('[businessService] Supabase update warning:', error.message);
    } else if (updated) {
      return mapFromDb(updated);
    }
  } catch (err) {
    console.error('[businessService] Supabase update error:', err);
  }

  return merged;
}

/**
 * Delete a business profile
 */
export async function deleteBusiness(id: string, userId: string): Promise<boolean> {
  const current = getLocalBusinesses(userId);
  const filtered = current.filter((b) => b.id !== id);

  // If the deleted business was default and other businesses remain, make the first one default
  const wasDefault = current.find((b) => b.id === id)?.isDefault;
  if (wasDefault && filtered.length > 0 && filtered[0]) {
    filtered[0].isDefault = true;
  }

  saveLocalBusinesses(filtered, userId);

  try {
    const { error } = await supabase
      .from('business_profiles')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.warn('[businessService] Supabase delete warning:', error.message);
    }

    // If new default was chosen, update in db
    if (wasDefault && filtered.length > 0 && filtered[0]) {
      await supabase
        .from('business_profiles')
        .update({ is_default: true })
        .eq('id', filtered[0].id)
        .eq('user_id', userId);
    }
  } catch (err) {
    console.error('[businessService] Supabase delete error:', err);
  }

  return true;
}

/**
 * Get active business preference for user
 */
export async function getActiveBusinessPreference(userId: string): Promise<string | null> {
  // 1. Check local storage first for instant response
  const localPref = typeof window !== 'undefined' ? localStorage.getItem(getPrefStorageKey(userId)) : null;

  try {
    const { data, error } = await supabase
      .from('user_business_preferences')
      .select('active_business_id')
      .eq('user_id', userId)
      .single();

    if (!error && data?.active_business_id) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(getPrefStorageKey(userId), data.active_business_id);
      }
      return data.active_business_id;
    }
  } catch {
    // fallback to local
  }

  return localPref;
}

/**
 * Set active business preference for user
 */
export async function setActiveBusinessPreference(userId: string, businessId: string): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.setItem(getPrefStorageKey(userId), businessId);
    // Broadcast for multi-tab synchronization
    window.dispatchEvent(
      new CustomEvent('active_business_changed', {
        detail: { userId, businessId },
      })
    );
  }

  try {
    await supabase.from('user_business_preferences').upsert({
      user_id: userId,
      active_business_id: businessId,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[businessService] Failed to persist active preference to Supabase:', err);
  }
}

/**
 * Set a business as the default business
 */
export async function setDefaultBusiness(userId: string, businessId: string): Promise<void> {
  const current = getLocalBusinesses(userId);
  const updated = current.map((b) => ({
    ...b,
    isDefault: b.id === businessId,
  }));
  saveLocalBusinesses(updated, userId);

  try {
    await supabase
      .from('business_profiles')
      .update({ is_default: false })
      .eq('user_id', userId);

    await supabase
      .from('business_profiles')
      .update({ is_default: true })
      .eq('id', businessId)
      .eq('user_id', userId);
  } catch (err) {
    console.warn('[businessService] Failed setting default business in Supabase:', err);
  }
}
