import type { InvoiceStatus, LineItem } from '../types';

/**
 * Returns a Tailwind text color class for the given invoice status.
 */
export function getStatusColor(status: InvoiceStatus): string {
  const colors: Record<InvoiceStatus, string> = {
    paid: 'text-green-600',
    pending: 'text-yellow-600',
    overdue: 'text-red-600',
    draft: 'text-gray-500',
    sent: 'text-blue-600',
  };
  return colors[status];
}

/**
 * Returns a Tailwind background color class for the given invoice status.
 */
export function getStatusBgColor(status: InvoiceStatus): string {
  const colors: Record<InvoiceStatus, string> = {
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    overdue: 'bg-red-100 text-red-700',
    draft: 'bg-gray-100 text-gray-600',
    sent: 'bg-blue-100 text-blue-700',
  };
  return colors[status];
}

/**
 * Returns a Lucide icon name string for the given invoice status.
 */
export function getStatusIcon(status: InvoiceStatus): string {
  const icons: Record<InvoiceStatus, string> = {
    paid: 'CheckCircle',
    pending: 'Clock',
    overdue: 'AlertTriangle',
    draft: 'FileEdit',
    sent: 'Send',
  };
  return icons[status];
}

/**
 * Calculate the total for a single line item (quantity * unitPrice + tax).
 */
export function calculateLineItemTotal(item: LineItem): number {
  const base = item.quantity * item.unitPrice;
  const tax = base * ((item.taxRate || 0) / 100);
  return base + tax;
}

/**
 * Calculate invoice totals from line items, discount amount, and discount type.
 */
export function calculateInvoiceTotals(
  items: LineItem[],
  discount: number,
  discountType: 'percentage' | 'fixed'
): { subtotal: number; taxTotal: number; grandTotal: number } {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxTotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice * ((item.taxRate || 0) / 100),
    0
  );

  const discountAmount =
    discountType === 'percentage' ? (subtotal * discount) / 100 : discount;

  const grandTotal = subtotal + taxTotal - discountAmount;

  return {
    subtotal,
    taxTotal,
    grandTotal: Math.max(grandTotal, 0),
  };
}

/**
 * Generate a unique invoice number with prefix "INV-" and timestamp-based digits.
 */
export function generateInvoiceNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `INV-${timestamp}${random}`;
}

/**
 * Merge class names, filtering out falsy values.
 */
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
