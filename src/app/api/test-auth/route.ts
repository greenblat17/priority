import { NextRequest, NextResponse } from 'next/server'
import { verifyApiKeyAuth } from '@/lib/api-auth-middleware'
import { createClient } from '@/lib/supabase/route'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  // First, check if auth header is present
  if (!authHeader) {
    return NextResponse.json({
      status: 'error',
      message: 'No authorization header provided',
      debug: {
        headers: Object.fromEntries(request.headers.entries())
      }
    }, { status: 401 })
  }

  // Try API key authentication
  const { authorized, context, error } = await verifyApiKeyAuth(request)
  
  if (authorized && context) {
    const supabase = await createClient()
    const { data: user } = await supabase
      .from('users')
      .select('email')
      .eq('id', context.userId)
      .single()
    
    return NextResponse.json({
      status: 'success',
      message: 'API key is valid',
      user: {
        id: context.userId,
        email: user?.email
      },
      apiKeyId: context.apiKeyId
    })
  }

  // If not authorized, return error details
  return NextResponse.json({
    status: 'error',
    message: error || 'Authentication failed',
    debug: {
      authHeader: authHeader.substring(0, 30) + '...',
      authHeaderFormat: authHeader.startsWith('Bearer ') ? 'Bearer format' : 'Unknown format'
    }
  }, { status: 401 })
}