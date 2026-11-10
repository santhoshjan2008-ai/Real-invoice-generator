import type { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

// Read backend environment variables for Supabase (do not hardcode)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

const supabaseServer = createClient(supabaseUrl, supabaseKey);

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

/**
 * Production-ready server-side authentication middleware.
 * Verifies the Supabase JWT token from the Authorization header.
 * Derives the authenticated user identity securely from Supabase Auth — never trusts client-supplied user IDs.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or malformed Authorization header' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'Authentication token not provided' });
      return;
    }

    // Verify token cryptographically through Supabase Auth
    const { data: { user }, error } = await supabaseServer.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: 'Invalid, expired, or revoked authentication token' });
      return;
    }

    // Attach validated user to the request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    res.status(500).json({
      error: 'Internal server authentication error',
      details: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}

