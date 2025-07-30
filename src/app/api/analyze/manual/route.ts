import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/route'

// Manual trigger endpoint to analyze tasks that don't have analysis yet
// Useful for testing and recovery
export async function POST() {
  console.log('[Manual Analysis] Starting manual analysis trigger')
  
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find tasks without analysis
    const { data: tasksWithoutAnalysis, error: fetchError } = await supabase
      .from('tasks')
      .select('id, description')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('[Manual Analysis] Error fetching tasks:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }

    // Check which tasks already have analysis
    const taskIds = tasksWithoutAnalysis?.map(t => t.id) || []
    const { data: existingAnalyses } = await supabase
      .from('task_analyses')
      .select('task_id')
      .in('task_id', taskIds)

    const analyzedTaskIds = new Set(existingAnalyses?.map(a => a.task_id) || [])
    const tasksToAnalyze = tasksWithoutAnalysis?.filter(t => !analyzedTaskIds.has(t.id)) || []

    console.log(`[Manual Analysis] Found ${tasksToAnalyze.length} tasks without analysis`)

    // Trigger analysis for each task
    const results: any[] = []
    for (const task of tasksToAnalyze) {
      try {
        // For internal API calls, we need to directly call the analyze function
        // instead of making an HTTP request to avoid authentication issues
        const analyzeModule = await import('../../analyze/route')
        const mockRequest = new Request('http://localhost:3000/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId: task.id })
        })
        
        // Call the analyze endpoint directly
        const response = await analyzeModule.POST(mockRequest)

        if (response.ok) {
          const result = await response.json()
          results.push({ taskId: task.id, status: 'success', result })
          console.log(`[Manual Analysis] Successfully analyzed task ${task.id}`)
        } else {
          const error = await response.text()
          results.push({ taskId: task.id, status: 'error', error })
          console.error(`[Manual Analysis] Failed to analyze task ${task.id}:`, error)
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        results.push({ taskId: task.id, status: 'error', error: error instanceof Error ? error.message : String(error) })
        console.error(`[Manual Analysis] Exception analyzing task ${task.id}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Analyzed ${results.filter(r => r.status === 'success').length} out of ${tasksToAnalyze.length} tasks`,
      tasksAnalyzed: results.filter(r => r.status === 'success').length,
      tasksFound: tasksToAnalyze.length,
      results
    })

  } catch (error) {
    console.error('[Manual Analysis] Unexpected error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint to check status
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get task analysis statistics
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id')
      .eq('user_id', user.id)

    const { data: analyses } = await supabase
      .from('task_analyses')
      .select('task_id')
      .in('task_id', tasks?.map(t => t.id) || [])

    return NextResponse.json({
      totalTasks: tasks?.length || 0,
      analyzedTasks: analyses?.length || 0,
      pendingAnalysis: (tasks?.length || 0) - (analyses?.length || 0)
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}