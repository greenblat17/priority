import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const vitals = await request.json()
    
    // In production, you would send this to your analytics service
    // For now, we'll just log it
    console.log('Web Vitals:', {
      metric: vitals.name,
      value: vitals.value,
      rating: vitals.rating,
      timestamp: new Date().toISOString(),
    })
    
    // You could also store in a database or send to an analytics service like:
    // - Google Analytics
    // - Vercel Analytics
    // - Custom analytics endpoint
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing web vitals:', error)
    return NextResponse.json(
      { error: 'Failed to process web vitals' },
      { status: 500 }
    )
  }
}