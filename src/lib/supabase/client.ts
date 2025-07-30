import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

// Create a singleton instance for client components
let client: ReturnType<typeof createClientComponentClient<Database>> | null = null

export const createClient = () => {
  if (!client) {
    client = createClientComponentClient<Database>()
  }
  return client
}