/*
 * Supabase Client Configuration
 * 
 * IMPORTANT: Replace the following values with your actual Supabase project details:
 * 
 * 1. SUPABASE_URL: Your project URL from Supabase Dashboard > Settings > API
 *    Format: https://your-project-ref.supabase.co
 * 
 * 2. SUPABASE_ANON_KEY: Your anon/public key from Supabase Dashboard > Settings > API
 *    This is safe to use in client-side code
 * 
 * Example:
 * const supabaseUrl = 'https://abcdefghijklmnop.supabase.co'
 * const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 */

import { createClient } from '@supabase/supabase-js'

// TODO: Replace these with your actual Supabase project values
const supabaseUrl = 'https://ihjxpczwesemhygjxvpd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloanhwY3p3ZXNlbWh5Z2p4dnBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MzgzNTEsImV4cCI6MjA2NzAxNDM1MX0.fn04y4-u6ttFnXmuUMuUnVX2uaPC2yij_jli_6Hrl0M'

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Export default for convenience
export default supabase