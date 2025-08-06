import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { EmailProcessor } from '@/lib/gmail/email-processor'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has active Gmail integration
    const { data: integration, error: integrationError } = await supabase
      .from('gmail_integrations')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (integrationError || !integration) {
      return NextResponse.json(
        { error: 'No active Gmail integration found' },
        { status: 400 }
      )
    }

    // Process emails
    const processor = new EmailProcessor()
    const stats = await processor.processUserEmails(user.id)

    // Update last sync time directly here
    const newSyncTime = new Date().toISOString()
    console.log('Updating last_sync_at directly in sync route for user:', user.id)
    console.log('New sync time:', newSyncTime)
    
    // First, let's check if the record exists
    const { data: existingRecord, error: fetchError } = await supabase
      .from('gmail_integrations')
      .select('id, last_sync_at')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()
    
    console.log('Existing record:', existingRecord)
    
    if (existingRecord) {
      // Update using the record ID directly
      const { data: updateData, error: updateError } = await supabase
        .from('gmail_integrations')
        .update({ 
          last_sync_at: newSyncTime,
          updated_at: newSyncTime // Force update this too
        })
        .eq('id', existingRecord.id)
        .select()
        .single()
      
      if (updateError) {
        console.error('Failed to update last_sync_at in sync route:', updateError)
        console.error('Error details:', JSON.stringify(updateError, null, 2))
      } else {
        console.log('Successfully updated last_sync_at in sync route')
        console.log('Updated data:', updateData)
      }
    } else {
      console.error('No active integration found to update')
    }

    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('Manual sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync emails' },
      { status: 500 }
    )
  }
}