import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase/service'
import { verifyApiKey } from '@/lib/api-keys'

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json()
    
    if (!apiKey || !apiKey.startsWith('tp_live_')) {
      return NextResponse.json({
        error: 'Invalid API key format',
        expectedFormat: 'tp_live_XXXXX...'
      }, { status: 400 })
    }

    // Get the key preview (last 4 characters)
    const keyPreview = apiKey.slice(-4)
    
    // Check if any API key exists with this preview
    // First, let's check if the table has any keys at all
    const { count: totalCount } = await supabaseService
      .from('api_keys')
      .select('*', { count: 'exact', head: true })
    
    // Check if any API key exists with this preview
    const { data: apiKeys, error } = await supabaseService
      .from('api_keys')
      .select('id, user_id, key_hash, key_preview, created_at')
      .eq('key_preview', keyPreview)
    
    if (error) {
      return NextResponse.json({
        error: 'Database error',
        details: error.message
      }, { status: 500 })
    }
    
    if (!apiKeys || apiKeys.length === 0) {
      return NextResponse.json({
        status: 'not_found',
        message: `No API key found with preview ending in '${keyPreview}'`,
        suggestion: 'The API key may have been deleted or never existed',
        totalKeysInDatabase: totalCount || 0
      })
    }
    
    // Check each matching key
    const results = []
    for (const keyRecord of apiKeys) {
      const isValid = await verifyApiKey(apiKey, keyRecord.key_hash)
      results.push({
        id: keyRecord.id,
        preview: keyRecord.key_preview,
        created_at: keyRecord.created_at,
        hash_matches: isValid
      })
    }
    
    return NextResponse.json({
      status: 'debug_complete',
      keyPreview,
      foundKeys: apiKeys.length,
      results
    })
    
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}