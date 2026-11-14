import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { BusinessProfile, BusinessProfileFormData } from '../types';
import * as businessService from '../services/businessService';
import { useAuth } from './AuthContext';

interface BusinessContextType {
  businesses: BusinessProfile[];
  activeBusiness: BusinessProfile | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  loadBusinesses: () => Promise<void>;
  createBusiness: (data: BusinessProfileFormData) => Promise<BusinessProfile>;
  updateBusiness: (id: string, data: Partial<BusinessProfileFormData>) => Promise<BusinessProfile | null>;
  deleteBusiness: (id: string) => Promise<boolean>;
  setActiveBusinessId: (id: string) => Promise<void>;
  setDefaultBusinessId: (id: string) => Promise<void>;
  getBusinessById: (id: string) => BusinessProfile | undefined;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;

  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [activeBusiness, setActiveBusiness] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const resolveActiveBusiness = useCallback(
    (allBusinesses: BusinessProfile[], preferredId: string | null): BusinessProfile | null => {
      if (allBusinesses.length === 0) return null;

      if (preferredId) {
        const found = allBusinesses.find((b) => b.id === preferredId);
        if (found) return found;
      }

      // Fallback: check if there is a default business
      const defaultBiz = allBusinesses.find((b) => b.isDefault);
      if (defaultBiz) return defaultBiz;

      // Fallback to first business
      return allBusinesses[0] || null;
    },
    []
  );

  const loadBusinesses = useCallback(async () => {
    if (!userId) {
      setBusinesses([]);
      setActiveBusiness(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [fetchedBusinesses, prefId] = await Promise.all([
        businessService.getBusinesses(userId),
        businessService.getActiveBusinessPreference(userId),
      ]);

      setBusinesses(fetchedBusinesses);
      const chosen = resolveActiveBusiness(fetchedBusinesses, prefId);
      setActiveBusiness(chosen);
    } catch (err) {
      console.error('[BusinessContext] Error loading businesses:', err);
      setError(err instanceof Error ? err.message : 'Failed to load business profiles');
    } finally {
      setIsLoading(false);
    }
  }, [userId, resolveActiveBusiness]);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  // Synchronize active business across multiple browser tabs
  useEffect(() => {
    const handleActiveChanged = (e: Event) => {
      const customEvent = e as CustomEvent<{ userId: string; businessId: string }>;
      if (customEvent.detail && customEvent.detail.userId === userId) {
        const match = businesses.find((b) => b.id === customEvent.detail.businessId);
        if (match) {
          setActiveBusiness(match);
        }
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (userId && e.key === `real_invoice_generator_active_biz_${userId}` && e.newValue) {
        const match = businesses.find((b) => b.id === e.newValue);
        if (match) {
          setActiveBusiness(match);
        }
      }
    };

    window.addEventListener('active_business_changed', handleActiveChanged);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('active_business_changed', handleActiveChanged);
      window.removeEventListener('storage', handleStorage);
    };
  }, [userId, businesses]);

  const setActiveBusinessId = useCallback(
    async (id: string) => {
      const target = businesses.find((b) => b.id === id);
      if (!target) return;

      setActiveBusiness(target);

      if (userId) {
        await businessService.setActiveBusinessPreference(userId, id);
      }
    },
    [businesses, userId]
  );

  const createBusiness = useCallback(
    async (data: BusinessProfileFormData): Promise<BusinessProfile> => {
      if (!userId) throw new Error('User must be logged in to create a business profile');

      setIsSaving(true);
      setError(null);
      try {
        const created = await businessService.createBusiness(data, userId);
        const updatedList = await businessService.getBusinesses(userId);
        setBusinesses(updatedList);

        // If this is the only business or marked default, set it as active
        if (updatedList.length === 1 || data.isDefault || !activeBusiness) {
          setActiveBusiness(created);
          await businessService.setActiveBusinessPreference(userId, created.id);
        }

        return created;
      } catch (err) {
        console.error('[BusinessContext] Error creating business:', err);
        setError(err instanceof Error ? err.message : 'Failed to create business');
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [userId, activeBusiness]
  );

  const updateBusiness = useCallback(
    async (id: string, data: Partial<BusinessProfileFormData>): Promise<BusinessProfile | null> => {
      if (!userId) return null;

      setIsSaving(true);
      setError(null);
      try {
        const updated = await businessService.updateBusiness(id, data, userId);
        if (updated) {
          const updatedList = await businessService.getBusinesses(userId);
          setBusinesses(updatedList);

          // If the updated business was active, update activeBusiness in state
          if (activeBusiness?.id === id) {
            const fresh = updatedList.find((b) => b.id === id) || updated;
            setActiveBusiness(fresh);
          }
        }
        return updated;
      } catch (err) {
        console.error('[BusinessContext] Error updating business:', err);
        setError(err instanceof Error ? err.message : 'Failed to update business');
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [userId, activeBusiness]
  );

  const deleteBusiness = useCallback(
    async (id: string): Promise<boolean> => {
      if (!userId) return false;

      setIsSaving(true);
      setError(null);
      try {
        const success = await businessService.deleteBusiness(id, userId);
        if (success) {
          const remaining = businesses.filter((b) => b.id !== id);
          setBusinesses(remaining);

          // If active business was deleted, switch to another available business
          if (activeBusiness?.id === id) {
            const nextActive = resolveActiveBusiness(remaining, null);
            setActiveBusiness(nextActive);
            if (nextActive) {
              await businessService.setActiveBusinessPreference(userId, nextActive.id);
            }
          }
        }
        return success;
      } catch (err) {
        console.error('[BusinessContext] Error deleting business:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete business');
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [userId, businesses, activeBusiness, resolveActiveBusiness]
  );

  const setDefaultBusinessId = useCallback(
    async (id: string) => {
      if (!userId) return;

      setIsSaving(true);
      try {
        await businessService.setDefaultBusiness(userId, id);
        const updatedList = await businessService.getBusinesses(userId);
        setBusinesses(updatedList);
        const match = updatedList.find((b) => b.id === id);
        if (match && activeBusiness?.id === id) {
          setActiveBusiness(match);
        }
      } catch (err) {
        console.error('[BusinessContext] Error setting default business:', err);
      } finally {
        setIsSaving(false);
      }
    },
    [userId, activeBusiness]
  );

  const getBusinessById = useCallback(
    (id: string): BusinessProfile | undefined => {
      return businesses.find((b) => b.id === id);
    },
    [businesses]
  );

  return (
    <BusinessContext.Provider
      value={{
        businesses,
        activeBusiness,
        isLoading,
        isSaving,
        error,
        loadBusinesses,
        createBusiness,
        updateBusiness,
        deleteBusiness,
        setActiveBusinessId,
        setDefaultBusinessId,
        getBusinessById,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness(): BusinessContextType {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}
