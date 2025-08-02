import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/route'
import { generateApiKey, hashApiKey, getApiKeyPreview } from '@/lib/api-keys'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch user's API keys
    const { data: apiKeys, error } = await supabase
      .from('api_keys')
      .select('id, name, key_preview, last_used_at, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching API keys:', error)
      return NextResponse.json(
        { error: 'Failed to fetch API keys' },
        { status: 500 }
      )
    }

    return NextResponse.json({ apiKeys })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const { name } = await request.json()
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Check if user already has 5 API keys (limit)
    const { count } = await supabase
      .from('api_keys')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (count && count >= 5) {
      return NextResponse.json(
        { error: 'Maximum number of API keys reached (5)' },
        { status: 400 }
      )
    }

    // Generate new API key
    const apiKey = generateApiKey()
    const keyHash = await hashApiKey(apiKey)
    const keyPreview = getApiKeyPreview(apiKey)

    // Save to database
    const { data, error } = await supabase
      .from('api_keys')
      .insert({
        user_id: user.id,
        name,
        key_hash: keyHash,
        key_preview: keyPreview,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating API key:', error)
      return NextResponse.json(
        { error: 'Failed to create API key' },
        { status: 500 }
      )
    }

    // Return the API key only once (it won't be retrievable again)
    return NextResponse.json({
      apiKey: {
        id: data.id,
        name: data.name,
        key: apiKey, // Only returned on creation
        key_preview: data.key_preview,
        created_at: data.created_at,
      },
      message: 'Save this API key securely. You won\'t be able to see it again.'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}