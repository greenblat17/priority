import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const GMAIL_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GMAIL_SCOPE = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://mail.google.com/'
].join(' ')

export async function GET() {
  const supabase = await createClient()
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Create state parameter with user ID for security
  const state = Buffer.from(JSON.stringify({
    userId: user.id,
    timestamp: Date.now()
  })).toString('base64')

  // Build OAuth URL
  const params = new URLSearchParams({
    client_id: process.env.GMAIL_CLIENT_ID!,
    redirect_uri: process.env.GMAIL_REDIRECT_URI!,
    response_type: 'code',
    scope: GMAIL_SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    state
  })

  const authUrl = `${GMAIL_AUTH_URL}?${params.toString()}`

  return NextResponse.redirect(authUrl)
}