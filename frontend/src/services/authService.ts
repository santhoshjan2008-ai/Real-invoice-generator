import { supabase } from './supabaseClient';
import type { UserProfile } from '../types';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

/**
 * Register a new user using Email and Password.
 * Sends full_name in user_metadata so the Supabase handle_new_user trigger can populate public.profiles.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
): Promise<{ user: SupabaseUser | null; session: Session | null; needsEmailVerification: boolean }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
    },
  });

  if (error) {
    throw error;
  }

  // If user is created but session is null, email confirmation is required
  const needsEmailVerification = !!(data.user && !data.session);

  // If session is returned immediately (email confirmation disabled in Supabase), ensure profile exists
  if (data.user && data.session) {
    await syncUserProfile(data.user, fullName);
  }

  return {
    user: data.user,
    session: data.session,
    needsEmailVerification,
  };
}

/**
 * Sign in an existing user with Email and Password.
 */
export async function signInWithEmail(email: string, password: string): Promise<Session> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  if (!data.session) {
    throw new Error('No session returned after login');
  }

  if (data.user) {
    await syncUserProfile(data.user);
  }

  return data.session;
}

/**
 * Sign in or Register using Google OAuth via Supabase Auth.
 * Redirects user to Google OAuth consent screen and returns back to the application.
 */
export async function signInWithGoogle(): Promise<void> {
  const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    throw error;
  }
}

/**
 * Request a Password Reset email.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/#reset-password` : undefined;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    throw error;
  }
}

/**
 * Update the authenticated user's password (used in the password reset flow).
 */
export async function updateUserPassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw error;
  }
}

/**
 * Sign out and clear active session.
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

/**
 * Retrieve user profile from public.profiles table, falling back to user_metadata.
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      fullName: data.full_name || '',
      email: data.email,
      avatarUrl: data.avatar_url || '',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch {
    return null;
  }
}

/**
 * Upsert user profile into public.profiles to guarantee existence.
 * Fails silently if the table has not yet been migrated, allowing frontend to work seamlessly.
 */
export async function syncUserProfile(user: SupabaseUser, explicitName?: string): Promise<void> {
  try {
    const fullName =
      explicitName ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'User';

    const avatarUrl =
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      '';

    await supabase.from('profiles').upsert(
      {
        id: user.id,
        full_name: fullName,
        email: user.email || '',
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
  } catch {
    // Ignore schema cache / table not yet migrated errors
  }
}


// Backwards-compatible aliases
export const login = signInWithEmail;
export const logout = signOut;
export async function getCurrentUser(): Promise<SupabaseUser | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
