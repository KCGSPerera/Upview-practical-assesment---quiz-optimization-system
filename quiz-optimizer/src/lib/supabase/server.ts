/**
 * Supabase Client for Server-Side Usage
 * 
 * Use this in API routes, serverless functions, and backend operations.
 * Does not store session state - suitable for stateless API operations.
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/**
 * Creates a new Supabase client instance for server-side operations
 * 
 * Each API route should create its own instance to avoid shared state.
 * This is safe because Next.js API routes are stateless.
 * 
 * @returns A configured Supabase client for server-side use
 */
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
    );
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Singleton instance for simple server-side queries
 * Use createServerSupabaseClient() for API routes to avoid shared state
 */
export const supabaseServer = createServerSupabaseClient();
