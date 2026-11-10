import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { Invoice, InvoiceFormData } from '../types';
import {
  getInvoices,
  createInvoice as createInvoiceService,
  updateInvoice as updateInvoiceService,
  deleteInvoice as deleteInvoiceService,
  getInvoiceById as getInvoiceByIdService,
} from '../services/invoiceService';
import { useAuth } from './AuthContext';

interface InvoiceContextType {
  invoices: Invoice[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  totalRevenue: number;
  outstandingAmount: number;
  outstandingCount: number;
  loadInvoices: () => Promise<void>;
  addInvoice: (data: InvoiceFormData) => Promise<Invoice>;
  updateInvoice: (id: string, data: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  getInvoiceById: (id: string) => Invoice | undefined;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export function InvoiceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInvoices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loaded = await getInvoices(userId);
      setInvoices(loaded);
    } catch (err) {
      console.error('[InvoiceContext] Error loading invoices:', err);
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const addInvoice = useCallback(
    async (data: InvoiceFormData): Promise<Invoice> => {
      setIsSaving(true);
      setError(null);
      try {
        const newInvoice = await createInvoiceService(data, userId);
        setInvoices((prev) => [newInvoice, ...prev.filter((i) => i.id !== newInvoice.id)]);
        return newInvoice;
      } catch (err) {
        console.error('[InvoiceContext] Error adding invoice:', err);
        setError(err instanceof Error ? err.message : 'Failed to save invoice');
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [userId]
  );

  const updateInvoice = useCallback(
    async (id: string, data: Partial<Invoice>) => {
      setIsSaving(true);
      setError(null);
      try {
        const updated = await updateInvoiceService(id, data, userId);
        if (updated) {
          setInvoices((prev) =>
            prev.map((inv) => (inv.id === id ? { ...inv, ...data, ...updated } : inv))
          );
        }
      } catch (err) {
        console.error('[InvoiceContext] Error updating invoice:', err);
        setError(err instanceof Error ? err.message : 'Failed to update invoice');
      } finally {
        setIsSaving(false);
      }
    },
    [userId]
  );

  const deleteInvoice = useCallback(
    async (id: string) => {
      setIsSaving(true);
      setError(null);
      try {
        await deleteInvoiceService(id, userId);
        setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      } catch (err) {
        console.error('[InvoiceContext] Error deleting invoice:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete invoice');
      } finally {
        setIsSaving(false);
      }
    },
    [userId]
  );

  const getInvoiceById = useCallback(
    (id: string): Invoice | undefined => {
      const found = invoices.find((inv) => inv.id === id);
      if (found) return found;
      return undefined;
    },
    [invoices]
  );

  const totalRevenue = useMemo(
    () =>
      invoices
        .filter((inv) => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.grandTotal, 0),
    [invoices]
  );

  const outstandingAmount = useMemo(
    () =>
      invoices
        .filter((inv) => inv.status === 'pending' || inv.status === 'overdue' || inv.status === 'sent')
        .reduce((sum, inv) => sum + inv.grandTotal, 0),
    [invoices]
  );

  const outstandingCount = useMemo(
    () =>
      invoices.filter(
        (inv) => inv.status === 'pending' || inv.status === 'overdue' || inv.status === 'sent'
      ).length,
    [invoices]
  );

  return (
    <InvoiceContext.Provider
      value={{
        invoices,
        isLoading,
        isSaving,
        error,
        totalRevenue,
        outstandingAmount,
        outstandingCount,
        loadInvoices,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        getInvoiceById,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoices(): InvoiceContextType {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error('useInvoices must be used within an InvoiceProvider');
  }
  return context;
}
