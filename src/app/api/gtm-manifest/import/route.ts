import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/route'
import openai from '@/lib/openai/client'
import * as cheerio from 'cheerio'

// URL validation regex
const isValidUrl = (urlString: string) => {
  try {
    const url = new URL(urlString)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  console.log('[GTM Import] Starting landing page import')
  
  try {
    // Parse request body
    const body = await request.json()
    const { url } = body
    
    if (!url || !isValidUrl(url)) {
      console.error('[GTM Import] Invalid URL provided:', url)
      return NextResponse.json(
        { error: 'Please provide a valid URL' },
        { status: 400 }
      )
    }

    console.log(`[GTM Import] Processing URL: ${url}`)

    // Initialize Supabase client
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('[GTM Import] Authentication error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch the landing page
    console.log('[GTM Import] Fetching landing page content')
    const pageResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TaskPriorityAI/1.0)'
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })

    if (!pageResponse.ok) {
      throw new Error(`Failed to fetch page: ${pageResponse.status}`)
    }

    const html = await pageResponse.text()
    
    // Parse HTML with cheerio
    console.log('[GTM Import] Parsing HTML content')
    const $ = cheerio.load(html)
    
    // Extract basic meta information
    const title = $('title').text() || $('meta[property="og:title"]').attr('content') || ''
    const description = $('meta[name="description"]').attr('content') || 
                       $('meta[property="og:description"]').attr('content') || ''
    
    // Extract structured data if available
    const structuredData = []
    $('script[type="application/ld+json"]').each((_, elem) => {
      try {
        const data = JSON.parse($(elem).html() || '{}')
        structuredData.push(data)
      } catch (e) {
        // Ignore invalid JSON
      }
    })
    
    // Collect page content for AI analysis
    const pageContent = {
      title,
      description,
      headings: {
        h1: $('h1').map((_, el) => $(el).text().trim()).get(),
        h2: $('h2').map((_, el) => $(el).text().trim()).get().slice(0, 5), // Limit to 5
        h3: $('h3').map((_, el) => $(el).text().trim()).get().slice(0, 5), // Limit to 5
      },
      // Extract main content
      mainContent: $('main, [role="main"], article, .content, #content')
        .first()
        .text()
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 3000), // Limit to 3000 chars
      // Extract any feature lists
      features: $('ul li, .feature, .benefit')
        .map((_, el) => $(el).text().trim())
        .get()
        .filter(text => text.length > 10 && text.length < 200)
        .slice(0, 10), // Limit to 10 features
      // Tech stack hints from meta or scripts
      techHints: {
        generator: $('meta[name="generator"]').attr('content') || '',
        scripts: $('script[src]')
          .map((_, el) => $(el).attr('src'))
          .get()
          .filter(src => src && (src.includes('react') || src.includes('vue') || src.includes('angular')))
          .slice(0, 5),
      },
      structuredData,
      url
    }

    // Build AI prompt for extraction
    console.log('[GTM Import] Calling OpenAI for content analysis')
    const prompt = `You are analyzing a landing page to extract GTM (Go-To-Market) information for a product.

Landing Page Content:
- URL: ${url}
- Title: ${pageContent.title}
- Description: ${pageContent.description}
- Main Headings: ${pageContent.headings.h1.join(', ')}
- Sub Headings: ${pageContent.headings.h2.join(', ')}
- Main Content (excerpt): ${pageContent.mainContent.slice(0, 1000)}
- Features/Benefits: ${pageContent.features.join('; ')}
${structuredData.length > 0 ? `- Structured Data: ${JSON.stringify(structuredData[0])}` : ''}

Please analyze this content and extract:
1. Product Name (from title, headings, or brand mentions)
2. Product Description (concise summary of what the product does)
3. Target Audience (who is this product for?)
4. Value Proposition (what unique value does it provide?)
5. Current Stage (guess based on content: idea, mvp, growth, or scale)
6. Business Model (how does it make money?)
7. Tech Stack (any technologies mentioned or detected)

Return a JSON object with these fields:
{
  "product_name": "string",
  "product_description": "string (max 500 chars)",
  "target_audience": "string (max 500 chars)",
  "value_proposition": "string (max 500 chars)",
  "current_stage": "idea|mvp|growth|scale",
  "business_model": "string (max 500 chars)",
  "tech_stack": {
    "frontend": ["string"],
    "backend": ["string"],
    "database": ["string"],
    "infrastructure": ["string"]
  }
}

If you can't determine something with confidence, leave it as an empty string or empty array.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages: [{ 
        role: 'system', 
        content: prompt 
      }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1500
    })

    // Parse AI response
    const aiResponse = completion.choices[0].message.content
    if (!aiResponse) {
      throw new Error('Empty response from AI')
    }

    let extractedData
    try {
      extractedData = JSON.parse(aiResponse)
    } catch (parseError) {
      console.error('[GTM Import] Failed to parse AI response:', aiResponse)
      throw new Error('Failed to parse AI response')
    }

    console.log('[GTM Import] Successfully extracted GTM data')
    
    // Return the extracted manifest data
    return NextResponse.json({ 
      success: true,
      manifest: extractedData,
      source_url: url
    })

  } catch (error) {
    console.error('[GTM Import] Error during import:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'The page took too long to load. Please try again.' },
          { status: 408 }
        )
      }
      
      if (error.message.includes('fetch')) {
        return NextResponse.json(
          { error: 'Unable to access the provided URL. Please check if the URL is correct and publicly accessible.' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to import from landing page' },
      { status: 500 }
    )
  }
}