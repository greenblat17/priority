import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/route'
import type { GTMManifest } from '@/types/gtm'

export async function GET(request: NextRequest) {
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

    // Fetch user's GTM manifest
    const { data: manifest, error } = await supabase
      .from('gtm_manifests')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching GTM manifest:', error)
      return NextResponse.json(
        { error: 'Failed to fetch GTM manifest' },
        { status: 500 }
      )
    }

    return NextResponse.json({ manifest: manifest || null })
  } catch (error) {
    console.error('GTM manifest GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
    const body = await request.json()
    const manifestData: Partial<GTMManifest> = {
      product_name: body.product_name,
      product_description: body.product_description,
      target_audience: body.target_audience,
      value_proposition: body.value_proposition,
      current_stage: body.current_stage,
      tech_stack: body.tech_stack,
      business_model: body.business_model,
    }

    // Create or update manifest (upsert)
    const { data: manifest, error } = await supabase
      .from('gtm_manifests')
      .upsert({
        user_id: user.id,
        ...manifestData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating GTM manifest:', error)
      return NextResponse.json(
        { error: 'Failed to create GTM manifest' },
        { status: 500 }
      )
    }

    return NextResponse.json({ manifest })
  } catch (error) {
    console.error('GTM manifest POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
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
    const body = await request.json()
    const manifestData: Partial<GTMManifest> = {
      product_name: body.product_name,
      product_description: body.product_description,
      target_audience: body.target_audience,
      value_proposition: body.value_proposition,
      current_stage: body.current_stage,
      tech_stack: body.tech_stack,
      business_model: body.business_model,
    }

    // Update manifest
    const { data: manifest, error } = await supabase
      .from('gtm_manifests')
      .update({
        ...manifestData,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating GTM manifest:', error)
      return NextResponse.json(
        { error: 'Failed to update GTM manifest' },
        { status: 500 }
      )
    }

    return NextResponse.json({ manifest })
  } catch (error) {
    console.error('GTM manifest PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}