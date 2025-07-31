import { createClient } from '@/lib/supabase/route'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/tasks'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Get the user to check if they're new
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Check if this is a new user (no GTM manifest)
        const { data: manifest } = await supabase
          .from('gtm_manifests')
          .select('id')
          .eq('user_id', user.id)
          .single()
        
        // If new user and no specific next URL, redirect to onboarding
        if (!manifest && next === '/tasks') {
          return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
        }
      }
      
      // Otherwise redirect to the 'next' URL or tasks
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  // If there's an error or no code, redirect to login
  return NextResponse.redirect(new URL('/auth/login?error=auth_error', requestUrl.origin))
}