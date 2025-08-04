import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/route'
import { createBrowserClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  try {
    // Test 1: Check environment variables
    const envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...'
    }
    
    // Test 2: Try to access a simple table with regular client
    const regularClient = await createClient()
    let regularClientWorks = false
    let regularClientError = null
    
    try {
      const { data, error } = await regularClient
        .from('profiles')
        .select('id')
        .limit(1)
      
      if (error) {
        regularClientError = error.message
      } else {
        regularClientWorks = true
      }
    } catch (e) {
      regularClientError = e instanceof Error ? e.message : 'Unknown error'
    }
    
    // Test 3: Create a direct client with service role
    let serviceClientWorks = false
    let serviceClientError = null
    let apiKeysCount = 0
    
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const serviceClient = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false
            }
          }
        )
        
        // Try to count api_keys
        const { count, error } = await serviceClient
          .from('api_keys')
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          serviceClientError = error.message
        } else {
          serviceClientWorks = true
          apiKeysCount = count || 0
        }
      } catch (e) {
        serviceClientError = e instanceof Error ? e.message : 'Unknown error'
      }
    }
    
    return NextResponse.json({
      status: 'debug_complete',
      environment: envCheck,
      regularClient: {
        works: regularClientWorks,
        error: regularClientError
      },
      serviceClient: {
        works: serviceClientWorks,
        error: serviceClientError,
        apiKeysCount
      },
      suggestion: !serviceClientWorks ? 
        'Check that SUPABASE_SERVICE_ROLE_KEY in .env.local matches your Supabase project service role key' :
        'Service role is working correctly'
    })
    
  } catch (error) {
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}