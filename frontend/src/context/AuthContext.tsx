import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import * as authService from '../services/authService';
import type { UserProfile, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  const loadProfile = useCallback(async (currentUser: SupabaseUser | null) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }

    const fetched = await authService.fetchUserProfile(currentUser.id);
    if (fetched) {
      setProfile(fetched);
    } else {
      // Fallback profile built from user_metadata
      const fullName =
        currentUser.user_metadata?.full_name ||
        currentUser.user_metadata?.name ||
        currentUser.email?.split('@')[0] ||
        'Alex De Silva';

      setProfile({
        id: currentUser.id,
        fullName,
        email: currentUser.email || '',
        avatarUrl: currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture || '',
      });
    }
  }, []);

  useEffect(() => {
    // Check initial active session
    supabase.auth.getSession().then(({ data: { session: initSession }, error }) => {
      if (!error && initSession) {
        setSession(initSession);
        setUser(initSession.user);
        loadProfile(initSession.user);
      }
      setIsLoading(false);
    });

    // Check if URL hash indicates password recovery
    if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
      setIsPasswordRecovery(true);
    }

    // Subscribe to live auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
        }

        if (newSession?.user) {
          await loadProfile(newSession.user);
        } else {
          setProfile(null);
        }

        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      const result = await authService.signUpWithEmail(email, password, fullName);
      if (result.user) {
        setUser(result.user);
        setSession(result.session);
        await loadProfile(result.user);
      }
      return { needsEmailVerification: result.needsEmailVerification };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string, rememberMe: boolean = true) => {
    setIsLoading(true);
    try {
      const newSession = await authService.signInWithEmail(email, password);
      setSession(newSession);
      setUser(newSession.user);
      await loadProfile(newSession.user);

      if (!rememberMe) {
        // If user unchecked Remember Me, session is not persisted beyond browser close
        sessionStorage.setItem('temp_session_active', 'true');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    await authService.signInWithGoogle();
  };

  const requestPasswordReset = async (email: string) => {
    await authService.requestPasswordReset(email);
  };

  const resetPassword = async (newPassword: string) => {
    setIsLoading(true);
    try {
      await authService.updateUserPassword(newPassword);
      setIsPasswordRecovery(false);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsPasswordRecovery(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isAuthenticated: !!user,
        isLoading,
        isPasswordRecovery,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        requestPasswordReset,
        resetPassword,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
