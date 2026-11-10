import * as invoiceService from '../services/invoiceService';
import * as authService from '../services/authService';
import { ENDPOINTS } from './endpoints';

interface ApiConfig {
  baseURL: string;
  headers: Record<string, string>;
}

const config: ApiConfig = {
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
};

async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: unknown,
): Promise<T> {
  if (url === ENDPOINTS.AUTH.LOGIN && method === 'POST') {
    const { email, password } = (data || {}) as { email: string; password: string };
    const res = await authService.login(email, password);
    return res as unknown as T;
  }

  if (url === ENDPOINTS.AUTH.LOGOUT && method === 'POST') {
    await authService.logout();
    return undefined as unknown as T;
  }

  if (url === ENDPOINTS.AUTH.ME && method === 'GET') {
    const res = await authService.getCurrentUser();
    return res as unknown as T;
  }

  if (url === ENDPOINTS.INVOICES.BASE && method === 'GET') {
    return invoiceService.getInvoices() as unknown as T;
  }

  if (url === ENDPOINTS.INVOICES.BASE && method === 'POST') {
    return invoiceService.createInvoice(data as Parameters<typeof invoiceService.createInvoice>[0]) as unknown as T;
  }

  const invoiceIdMatch = url.match(/^\/invoices\/(.+)$/);
  if (invoiceIdMatch && invoiceIdMatch[1]) {
    const id = invoiceIdMatch[1];

    if (method === 'GET') {
      return invoiceService.getInvoiceById(id) as unknown as T;
    }
    if (method === 'PUT') {
      return invoiceService.updateInvoice(id, (data || {}) as Parameters<typeof invoiceService.updateInvoice>[1]) as unknown as T;
    }
    if (method === 'DELETE') {
      return invoiceService.deleteInvoice(id) as unknown as T;
    }
  }

  throw new Error(`[apiClient] No mock handler for ${method} ${url}`);
}

export const apiClient = {
  config,
  get<T>(url: string): Promise<T> {
    return request<T>('GET', url);
  },
  post<T>(url: string, data?: unknown): Promise<T> {
    return request<T>('POST', url, data);
  },
  put<T>(url: string, data?: unknown): Promise<T> {
    return request<T>('PUT', url, data);
  },
  delete<T>(url: string): Promise<T> {
    return request<T>('DELETE', url);
  },
};

export default apiClient;
