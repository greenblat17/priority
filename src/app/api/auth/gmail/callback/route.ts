import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const GMAIL_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GMAIL_USER_INFO_URL = 'https://www.googleapis.com/gmail/v1/users/me/profile'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=${error}`
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=missing_params`
    )
  }

  try {
    // Decode and validate state
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString())
    const { userId } = stateData

    // Exchange code for tokens
    const tokenResponse = await fetch(GMAIL_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GMAIL_CLIENT_ID!,
        client_secret: process.env.GMAIL_CLIENT_SECRET!,
        redirect_uri: process.env.GMAIL_REDIRECT_URI!,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens')
    }

    const tokens = await tokenResponse.json()

    // Get user's email address
    const profileResponse = await fetch(GMAIL_USER_INFO_URL, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })

    if (!profileResponse.ok) {
      throw new Error('Failed to fetch user profile')
    }

    const profile = await profileResponse.json()

    // Save to database
    const supabase = await createClient()
    
    // Verify the user matches
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user || user.id !== userId) {
      throw new Error('User mismatch')
    }

    // Calculate token expiry
    const tokenExpiry = new Date()
    tokenExpiry.setSeconds(tokenExpiry.getSeconds() + tokens.expires_in)

    // Check if integration already exists
    const { data: existingIntegration } = await supabase
      .from('gmail_integrations')
      .select('id')
      .eq('user_id', userId)
      .single()

    let dbError
    
    if (existingIntegration) {
      // Update existing integration
      const { error } = await supabase
        .from('gmail_integrations')
        .update({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expiry: tokenExpiry.toISOString(),
          email_address: profile.emailAddress,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
      
      dbError = error
    } else {
      // Create new integration
      const { error } = await supabase
        .from('gmail_integrations')
        .insert({
          user_id: userId,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          token_expiry: tokenExpiry.toISOString(),
          email_address: profile.emailAddress,
          is_active: true,
          updated_at: new Date().toISOString()
        })
      
      dbError = error
    }

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to save integration')
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/integrations?success=true`
    )
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/integrations?error=auth_failed`
    )
  }
}