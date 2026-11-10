import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { uploadPdf } from '../services/storageService';

export interface ExportPdfOptions {
  userId?: string;
  invoiceId?: string;
}

/**
 * Generate a PDF Blob from an HTML element
 */
export async function generatePdfBlob(elementId: string): Promise<{ blob: Blob; pdf: jsPDF } | null> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.warn(`[pdfExport] Element with id "${elementId}" not found`);
    return null;
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  const blob = pdf.output('blob');

  return { blob, pdf };
}

/**
 * Export invoice to local download and optionally upload to Supabase Storage
 */
export async function exportInvoiceToPdf(
  elementId: string,
  invoiceNumber: string = 'invoice',
  options?: ExportPdfOptions
): Promise<string | null> {
  const result = await generatePdfBlob(elementId);
  if (!result) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  const { blob, pdf } = result;

  // Trigger local client download
  const cleanNumber = invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, '') || 'invoice';
  pdf.save(`Invoice-${cleanNumber}.pdf`);

  // If user is authenticated, upload PDF blob to Supabase Storage
  if (options?.userId) {
    try {
      const targetInvoiceId = options.invoiceId || `inv-${cleanNumber}`;
      const uploadResult = await uploadPdf(
        options.userId,
        targetInvoiceId,
        blob,
        cleanNumber
      );
      return uploadResult.url;
    } catch (err) {
      console.warn('[pdfExport] Could not upload PDF to Supabase Storage:', err);
    }
  }

  return null;
}

/**
 * Silent generation and upload of PDF to Supabase Storage (no browser download triggered)
 */
export async function generateAndUploadPdfSilently(
  elementId: string,
  invoiceNumber: string,
  userId: string,
  invoiceId: string
): Promise<string | null> {
  try {
    const result = await generatePdfBlob(elementId);
    if (!result) return null;

    const cleanNumber = invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, '') || 'invoice';
    const uploadResult = await uploadPdf(userId, invoiceId, result.blob, cleanNumber);
    return uploadResult.url;
  } catch (err) {
    console.warn('[pdfExport] Silent PDF upload failed:', err);
    return null;
  }
}

export function printInvoice(elementId: string): void {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Invoice</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 20px; }
          * { box-sizing: border-box; }
        </style>
      </head>
      <body>
        ${element.outerHTML}
        <script>
          window.onload = function() {
            window.print();
            window.close();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
