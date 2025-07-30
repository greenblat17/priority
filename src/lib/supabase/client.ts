import { createBrowserClient } from '@supabase/ssr'

// Create a singleton instance for client components
let client: ReturnType<typeof createBrowserClient> | null = null

export const createClient = () => {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return client
}