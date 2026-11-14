import { supabase } from './supabaseClient';

export interface StorageUploadResult {
  url: string | null;
  path: string | null;
  error: Error | null;
}

/**
 * Convert a base64 Data URL to a Blob
 */
export function dataUrlToBlob(dataUrl: string): { blob: Blob; mimeType: string } | null {
  try {
    const arr = dataUrl.split(',');
    if (arr.length < 2 || !arr[0] || !arr[1]) return null;
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mimeType = (mimeMatch && mimeMatch[1]) ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return { blob: new Blob([u8arr], { type: mimeType }), mimeType };
  } catch (e) {
    console.error('[storageService] Failed converting dataUrl to blob', e);
    return null;
  }
}

/**
 * Upload business logo to Supabase Storage ('company-logos' bucket)
 * Accepts File, Blob, base64 data URL, or local blob: URL
 */
export async function uploadLogo(
  userId: string,
  invoiceId: string,
  fileOrUrl: File | Blob | string
): Promise<StorageUploadResult> {
  try {
    // If it's already an https Supabase or remote URL, no need to re-upload
    if (typeof fileOrUrl === 'string' && fileOrUrl.startsWith('https://')) {
      return { url: fileOrUrl, path: null, error: null };
    }

    let uploadBlob: Blob;
    let fileExt = 'png';
    let contentType = 'image/png';

    if (typeof fileOrUrl === 'string') {
      if (fileOrUrl.startsWith('data:')) {
        const converted = dataUrlToBlob(fileOrUrl);
        if (!converted) {
          return { url: null, path: null, error: new Error('Invalid data URI') };
        }
        uploadBlob = converted.blob;
        contentType = converted.mimeType;
        fileExt = converted.mimeType.split('/')[1] || 'png';
      } else if (fileOrUrl.startsWith('blob:')) {
        // Fetch local object URL to get real blob
        const res = await fetch(fileOrUrl);
        uploadBlob = await res.blob();
        contentType = uploadBlob.type || 'image/png';
        fileExt = contentType.split('/')[1] || 'png';
      } else {
        return { url: null, path: null, error: new Error('Unrecognized image format') };
      }
    } else {
      uploadBlob = fileOrUrl;
      contentType = fileOrUrl.type || 'image/png';
      if (fileOrUrl instanceof File) {
        fileExt = fileOrUrl.name.split('.').pop() || 'png';
      } else {
        fileExt = contentType.split('/')[1] || 'png';
      }
    }

    const cleanExt = fileExt.toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
    const timestamp = Date.now();
    const filePath = `${userId}/${invoiceId}/logo_${timestamp}.${cleanExt}`;

    const { error: uploadError } = await supabase.storage
      .from('company-logos')
      .upload(filePath, uploadBlob, {
        upsert: true,
        contentType,
      });

    if (uploadError) {
      console.error('[StorageService] Error uploading logo to company-logos:', uploadError);
      return { url: null, path: null, error: new Error(uploadError.message) };
    }

    const { data } = supabase.storage.from('company-logos').getPublicUrl(filePath);

    return {
      url: data.publicUrl,
      path: filePath,
      error: null,
    };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to upload logo');
    console.error('[StorageService] Unexpected error uploading logo:', error);
    return { url: null, path: null, error };
  }
}

/**
 * Upload business logo for a business profile
 */
export async function uploadBusinessLogo(
  userId: string,
  businessId: string,
  fileOrUrl: File | Blob | string
): Promise<StorageUploadResult> {
  return uploadLogo(userId, businessId, fileOrUrl);
}

/**
 * Upload generated PDF invoice to Supabase Storage ('invoice-pdfs' bucket)
 */
export async function uploadPdf(
  userId: string,
  invoiceId: string,
  pdfBlob: Blob,
  invoiceNumber: string
): Promise<StorageUploadResult> {
  try {
    const cleanNumber = invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, '') || 'invoice';
    const timestamp = Date.now();
    const filePath = `${userId}/${invoiceId}/Invoice_${cleanNumber}_${timestamp}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from('invoice-pdfs')
      .upload(filePath, pdfBlob, {
        upsert: true,
        contentType: 'application/pdf',
      });

    if (uploadError) {
      console.error('[StorageService] Error uploading PDF to invoice-pdfs:', uploadError);
      return { url: null, path: null, error: new Error(uploadError.message) };
    }

    const { data } = supabase.storage.from('invoice-pdfs').getPublicUrl(filePath);

    return {
      url: data.publicUrl,
      path: filePath,
      error: null,
    };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Failed to upload PDF');
    console.error('[StorageService] Unexpected error uploading PDF:', error);
    return { url: null, path: null, error };
  }
}

/**
 * Delete a file from a Supabase storage bucket
 */
export async function deleteStorageFile(bucket: string, path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      console.error(`[StorageService] Error deleting file from ${bucket}:`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[StorageService] Unexpected error deleting file from ${bucket}:`, err);
    return false;
  }
}
