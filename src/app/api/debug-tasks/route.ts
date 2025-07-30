import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/route'

// Debug endpoint to view tasks with analysis
// Remove this in production!
export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch tasks with analysis
    // Note: We need to specify the foreign key because task_analyses has two relationships to tasks
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
        *,
        task_analyses!task_id (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      user_id: user.id,
      task_count: tasks?.length || 0,
      tasks: tasks?.map(task => ({
        id: task.id,
        description: task.description.substring(0, 100) + '...',
        status: task.status,
        created_at: task.created_at,
        analysis: task.task_analyses ? {
          category: task.task_analyses.category,
          priority: task.task_analyses.priority,
          complexity: task.task_analyses.complexity,
          estimated_hours: task.task_analyses.estimated_hours,
          confidence_score: task.task_analyses.confidence_score,
          has_spec: !!task.task_analyses.implementation_spec
        } : null
      }))
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}