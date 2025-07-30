import { NextResponse } from 'next/server'
import openai from '@/lib/openai/client'

// Test endpoint to verify OpenAI configuration
export async function GET() {
  try {
    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key') {
      return NextResponse.json({
        configured: false,
        message: 'OpenAI API key is not configured'
      })
    }

    // Try a simple completion to test the connection
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ 
        role: 'user', 
        content: 'Reply with "OK" if you can read this.' 
      }],
      max_tokens: 10,
      temperature: 0
    })

    const response = completion.choices[0].message.content

    return NextResponse.json({
      configured: true,
      message: 'OpenAI integration is working',
      test: response,
      model: completion.model
    })
  } catch (error: any) {
    console.error('OpenAI test error:', error)
    
    return NextResponse.json({
      configured: false,
      message: 'OpenAI integration error',
      error: error.message || 'Unknown error',
      details: error.response?.data || error
    }, { status: 500 })
  }
}