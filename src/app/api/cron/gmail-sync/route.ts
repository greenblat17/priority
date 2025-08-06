import { NextRequest, NextResponse } from 'next/server'
import { EmailProcessor } from '@/lib/gmail/email-processor'

// This endpoint can be called by Vercel Cron or external cron services
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from a trusted source
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    // If CRON_SECRET is set, validate it
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Process emails for all active integrations
    const processor = new EmailProcessor()
    const stats = await processor.processAllActiveIntegrations()

    console.log('Cron job completed:', stats)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process emails',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Also support POST for flexibility
export async function POST(request: NextRequest) {
  return GET(request)
}