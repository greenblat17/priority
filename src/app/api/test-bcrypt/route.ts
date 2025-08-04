import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase/service'
import { verifyApiKey, hashApiKey } from '@/lib/api-keys'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json()
    
    if (!apiKey || !apiKey.startsWith('tp_live_')) {
      return NextResponse.json({
        error: 'Invalid API key format'
      }, { status: 400 })
    }

    // Get the key preview (last 4 characters)
    const keyPreview = apiKey.slice(-4)
    
    // First, let's create a test hash to verify bcrypt is working
    const testHash = await hashApiKey(apiKey)
    const testVerify = await verifyApiKey(apiKey, testHash)
    
    // Now check the database
    const { data: apiKeys, error } = await supabaseService
      .from('api_keys')
      .select('id, user_id, key_hash, key_preview, created_at')
      .eq('key_preview', keyPreview)
    
    if (error) {
      return NextResponse.json({
        status: 'error',
        message: 'Database query failed',
        error: error.message,
        bcryptTest: {
          testHash: testHash.substring(0, 20) + '...',
          testVerify
        }
      })
    }
    
    if (!apiKeys || apiKeys.length === 0) {
      return NextResponse.json({
        status: 'not_found',
        message: `No API key found with preview ending in '${keyPreview}'`,
        bcryptTest: {
          testHash: testHash.substring(0, 20) + '...',
          testVerify
        }
      })
    }
    
    // Test each key hash
    const results = []
    for (const keyRecord of apiKeys) {
      let hashValid = false
      let bcryptError = null
      
      try {
        // Direct bcrypt comparison
        hashValid = await bcrypt.compare(apiKey, keyRecord.key_hash)
      } catch (err) {
        bcryptError = err instanceof Error ? err.message : 'Unknown error'
      }
      
      results.push({
        id: keyRecord.id,
        preview: keyRecord.key_preview,
        created_at: keyRecord.created_at,
        hashLength: keyRecord.key_hash?.length || 0,
        hashPrefix: keyRecord.key_hash?.substring(0, 7) || 'null',
        hashValid,
        bcryptError
      })
    }
    
    return NextResponse.json({
      status: 'debug_complete',
      apiKeyLength: apiKey.length,
      keyPreview,
      foundKeys: apiKeys.length,
      bcryptTest: {
        canHashNewKey: true,
        testHash: testHash.substring(0, 20) + '...',
        testVerify
      },
      results
    })
    
  } catch (error) {
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}