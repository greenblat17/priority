import { supabaseService } from '@/lib/supabase/service'
import openai from '@/lib/openai/client'
import { buildAnalysisPrompt, validateAnalysisResponse } from '@/lib/openai/prompts'
import { withRetry } from '@/utils/retry'
import type { TaskAnalysisRecord } from '@/types/analysis'

/**
 * Analyzes a task using AI. This function is designed to be called
 * from server-side contexts where we need to bypass authentication.
 */
export async function analyzeTask(taskId: string, userId: string): Promise<void> {
  console.log(`[AI Analysis] Starting analysis for task: ${taskId}`)

  try {
    // Fetch task data using service role
    const { data: task, error: taskError } = await supabaseService
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single()

    if (taskError || !task) {
      console.error('[AI Analysis] Task fetch error:', taskError)
      throw new Error('Task not found')
    }

    // Check if analysis already exists
    const { data: existingAnalysis } = await supabaseService
      .from('task_analyses')
      .select('*')
      .eq('task_id', taskId)
      .single()

    if (existingAnalysis) {
      console.log('[AI Analysis] Analysis already exists for task')
      return
    }

    // Fetch GTM manifest for context
    const { data: manifest } = await supabaseService
      .from('gtm_manifests')
      .select('*')
      .eq('user_id', userId)
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
        model: 'gpt-4o-mini',
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

    const { error: saveError } = await supabaseService
      .from('task_analyses')
      .insert(analysisRecord)

    if (saveError) {
      console.error('[AI Analysis] Failed to save analysis:', saveError)
      throw new Error('Failed to save analysis results')
    }

    console.log('[AI Analysis] Analysis completed successfully')
  } catch (error) {
    console.error('[AI Analysis] Error during analysis:', error)
    // We're not re-throwing here because this is a background operation
    // The task creation should succeed even if analysis fails
  }
}