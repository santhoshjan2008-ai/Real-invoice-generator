import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn(
    '[Supabase] Warning: Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY environment variables in .env'
  );
}

export const supabase = createClient(
  supabaseUrl || '',
  supabasePublishableKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Helper to verify that the frontend can successfully communicate with the Supabase project.
 */
export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
}> {
  try {
    if (!supabaseUrl || !supabasePublishableKey) {
      return {
        connected: false,
        message: 'Missing environment variables in frontend/.env',
      };
    }

    // Ping the Supabase auth service to verify project reachability and key validity
    const { error } = await supabase.auth.getSession();
    if (error) {
      return {
        connected: false,
        message: error.message,
      };
    }

    return {
      connected: true,
      message: 'Successfully connected to Supabase!',
    };
  } catch (err) {
    return {
      connected: false,
      message: err instanceof Error ? err.message : 'Unknown connection error',
    };
  }
}

export default supabase;

