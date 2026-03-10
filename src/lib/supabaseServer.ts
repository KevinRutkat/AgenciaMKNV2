import { createClient, SupabaseClient } from '@supabase/supabase-js'

type CreateSupabaseServerClientOptions = {
  useUserToken?: boolean
}

// Server-only Supabase client factory.
// - Uses SUPABASE_SERVICE_ROLE_KEY when available for server-side mutations.
// - Only forwards the user's JWT when explicitly requested, or when there is no service role key.
export function createSupabaseServerClient(
  token?: string,
  options: CreateSupabaseServerClientOptions = {},
): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const shouldUseUserToken = Boolean(token) && (options.useUserToken || !serviceKey)

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  }
  if (!serviceKey && !anonKey) {
    throw new Error('Missing SUPABASE keys. Provide SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  const client = createClient(supabaseUrl, serviceKey || (anonKey as string), {
    global: {
      headers: shouldUseUserToken
        ? { Authorization: `Bearer ${token}` }
        : undefined,
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
