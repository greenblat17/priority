import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/route'
import { supabaseService } from '@/lib/supabase/service'
import { parseApiKeyFromHeader, verifyApiKey } from '@/lib/api-keys'

export interface ApiAuthContext {
  userId: string
  apiKeyId: string
}

export async function verifyApiKeyAuth(
  request: NextRequest
): Promise<{ authorized: boolean; context?: ApiAuthContext; error?: string }> {
  try {
    // Get API key from Authorization header
    const authHeader = request.headers.get('authorization')
    const apiKey = parseApiKeyFromHeader(authHeader)

    if (!apiKey) {
      return { authorized: false, error: 'No API key provided' }
    }

    // Validate API key format
    if (!apiKey.startsWith('tp_live_')) {
      return { authorized: false, error: 'Invalid API key format' }
    }

    // Use service role client to bypass RLS when checking API keys
    // This is necessary because we need to check all API keys in the system
    const { data: apiKeys, error } = await supabaseService
      .from('api_keys')
      .select('id, user_id, key_hash, expires_at')
      .is('expires_at', null) // Only get non-expired keys
      .order('created_at', { ascending: false })
      .not('key_hash', 'is', null) // Make sure we have a hash to compare

    if (error || !apiKeys) {
      console.error('Error fetching API keys:', error)
      return { authorized: false, error: 'Authentication failed' }
    }

    // Check API key against all hashes
    for (const keyRecord of apiKeys) {
      if (!keyRecord.key_hash) {
        continue
      }
      
      const isValid = await verifyApiKey(apiKey, keyRecord.key_hash)
      
      if (isValid) {
        // Update last_used_at using service role client
        await supabaseService
          .from('api_keys')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', keyRecord.id)

        return {
          authorized: true,
          context: {
            userId: keyRecord.user_id,
            apiKeyId: keyRecord.id,
          },
        }
      }
    }

    return { authorized: false, error: 'Invalid API key' }
  } catch (error) {
    console.error('API key verification error:', error)
    return { authorized: false, error: 'Authentication failed' }
  }
}

// Helper function to create API route handlers with API key authentication
export function withApiKeyAuth<T extends { params?: any }>(
  handler: (
    request: NextRequest,
    context: T & { auth: ApiAuthContext }
  ) => Promise<Response>
) {
  return async (request: NextRequest, handlerContext: T) => {
    const { authorized, context, error } = await verifyApiKeyAuth(request)

    if (!authorized) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      )
    }

    return handler(request, { ...handlerContext, auth: context! })
  }
}