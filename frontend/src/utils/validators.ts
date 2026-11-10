import { z } from 'zod';

export const lineItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be 0 or greater'),
  taxRate: z.number().min(0).max(100, 'Tax rate must be between 0 and 100'),
  total: z.number(),
});

export const invoiceFormSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  status: z.enum(['paid', 'pending', 'overdue', 'draft', 'sent']),
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  businessDetails: z.object({
    name: z.string().min(1, 'Business name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    address: z.string().min(1, 'Address is required'),
    logo: z.string().optional(),
  }),
  clientDetails: z.object({
    name: z.string().min(1, 'Client name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    address: z.string().min(1, 'Address is required'),
    taxId: z.string().optional(),
  }),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item is required'),
  discount: z.number().min(0, 'Discount must be 0 or greater'),
  discountType: z.enum(['percentage', 'fixed']),
  currency: z.string().min(1, 'Currency is required'),
  notes: z.string(),
  terms: z.string(),
  paymentTerms: z.string(),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters'),
});

export type LineItemFormValues = z.infer<typeof lineItemSchema>;
export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
