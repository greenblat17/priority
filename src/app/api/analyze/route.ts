import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/route'
import openai from '@/lib/openai/client'
import { buildAnalysisPrompt, validateAnalysisResponse } from '@/lib/openai/prompts'
import { withRetry } from '@/utils/retry'
import type { TaskAnalysisRequest, TaskAnalysisRecord } from '@/types/analysis'
import type { Task } from '@/types/task'
import type { GTMManifest } from '@/types/gtm'

export async function POST(request: Request) {
  console.log('[AI Analysis] Starting analysis request')
  
  try {
    // Parse request body
    const body: TaskAnalysisRequest = await request.json()
    const { taskId } = body
    
    if (!taskId) {
      console.error('[AI Analysis] Missing task ID')
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      )
    }

    console.log(`[AI Analysis] Processing task: ${taskId}`)

    // Initialize Supabase client
    const supabase = await createClient()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('[AI Analysis] Authentication error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch task data
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', user.id) // Ensure user owns the task
      .single()

    if (taskError || !task) {
      console.error('[AI Analysis] Task fetch error:', taskError)
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    // Check if analysis already exists
    const { data: existingAnalysis } = await supabase
      .from('task_analyses')
      .select('*')
      .eq('task_id', taskId)
      .single()

    if (existingAnalysis) {
      console.log('[AI Analysis] Analysis already exists for task')
      return NextResponse.json({ 
        success: true,
        message: 'Task already analyzed',
        analysis: existingAnalysis
      })
    }

    // Fetch GTM manifest for context
    const { data: manifest } = await supabase
      .from('gtm_manifests')
      .select('*')
      .eq('user_id', user.id)
      .single()

    console.log('[AI Analysis] Building prompt with context')

    // Build the analysis prompt
    const prompt = buildAnalysisPrompt({
      task: {
        description: task.description,
        source: task.source,
        customer_info: task.customer_info
      },
      manifest: manifest ? {
        product_name: manifest.product_name || undefined,
        product_description: manifest.product_description || undefined,
        target_audience: manifest.target_audience || undefined,
        value_proposition: manifest.value_proposition || undefined,
        current_stage: manifest.current_stage || undefined,
        tech_stack: manifest.tech_stack,
        business_model: manifest.business_model || undefined
      } : null
    })

    // Call OpenAI with retry logic
    console.log('[AI Analysis] Calling OpenAI API')
    const completion = await withRetry(async () => {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Use GPT-4o-mini for faster response times
        messages: [{ 
          role: 'system', 
          content: prompt 
        }],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 3000
      })
      return response
    }, {
      maxAttempts: 3,
      shouldRetry: (error) => {
        // Retry on rate limits or server errors
        return error.status === 429 || error.status >= 500
      }
    })

    // Parse and validate the response
    console.log('[AI Analysis] Parsing OpenAI response')
    const rawResponse = completion.choices[0].message.content
    if (!rawResponse) {
      throw new Error('Empty response from OpenAI')
    }

    let parsedResponse
    try {
      parsedResponse = JSON.parse(rawResponse)
    } catch (parseError) {
      console.error('[AI Analysis] Failed to parse JSON response:', rawResponse)
      throw new Error('Invalid JSON response from AI')
    }

    // Log the parsed response to debug
    console.log('[AI Analysis] Parsed response:', JSON.stringify(parsedResponse, null, 2))
    
    // Validate the response structure
    const validatedAnalysis = validateAnalysisResponse(parsedResponse)

    // Save analysis to database
    console.log('[AI Analysis] Saving analysis to database')
    const analysisRecord: TaskAnalysisRecord = {
      task_id: taskId,
      category: validatedAnalysis.category,
      priority: validatedAnalysis.priority,
      complexity: validatedAnalysis.complexity,
      estimated_hours: validatedAnalysis.estimated_hours,
      confidence_score: validatedAnalysis.confidence_score,
      implementation_spec: validatedAnalysis.implementation_spec
    }

    const { data: savedAnalysis, error: saveError } = await supabase
      .from('task_analyses')
      .insert(analysisRecord)
      .select()
      .single()

    if (saveError) {
      console.error('[AI Analysis] Failed to save analysis:', saveError)
      throw new Error('Failed to save analysis results')
    }

    console.log('[AI Analysis] Analysis completed successfully')
    return NextResponse.json({ 
      success: true,
      message: 'Analysis completed successfully',
      analysis: savedAnalysis,
      reasoning: validatedAnalysis.reasoning // Include reasoning for transparency
    })

  } catch (error) {
    console.error('[AI Analysis] Error during analysis:', error)
    
    // Determine appropriate error response
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'AI service not configured' },
          { status: 503 }
        )
      }
      
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        )
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}