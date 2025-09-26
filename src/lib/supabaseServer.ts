import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Server-only Supabase client factory.
// - Uses SUPABASE_SERVICE_ROLE_KEY when available (server only) to bypass RLS for server tasks like Storage uploads.
// - Falls back to anon key but attaches the user's JWT to Authorization header so RLS policies evaluate as the user.
export function createSupabaseServerClient(token?: string): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  }
  if (!serviceKey && !anonKey) {
    throw new Error('Missing SUPABASE keys. Provide SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  const client = createClient(supabaseUrl, serviceKey || (anonKey as string), {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    },
    auth: {
      // Do not persist session/cookies on the server
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })

  return client
}
