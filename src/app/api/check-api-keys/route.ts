import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase/service'

export async function GET(request: NextRequest) {
  try {
    // Check if service role key is configured
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    
    // Try to count API keys using service role
    const { count, error } = await supabaseService
      .from('api_keys')
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      return NextResponse.json({
        status: 'error',
        message: 'Failed to query api_keys table',
        error: error.message,
        hasServiceKey,
        suggestion: 'Check if SUPABASE_SERVICE_ROLE_KEY is set correctly in .env.local'
      })
    }
    
    // Get all API key previews (for debugging)
    const { data: keys, error: keysError } = await supabaseService
      .from('api_keys')
      .select('id, key_preview, created_at, user_id')
      .order('created_at', { ascending: false })
      .limit(10)
    
    return NextResponse.json({
      status: 'success',
      totalApiKeys: count || 0,
      hasServiceKey,
      recentKeys: keys || [],
      keysError: keysError?.message
    })
    
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Unexpected error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}