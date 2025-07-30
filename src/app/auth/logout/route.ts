import { createClient } from '@/lib/supabase/route'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const supabase = createClient()

  // Sign out the user
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error signing out:', error)
  }

  // Redirect to home page after logout
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}