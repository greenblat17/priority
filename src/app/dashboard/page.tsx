import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardContent } from '@/components/dashboard/dashboard-content'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Fetch user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch task statistics
  const { count: totalTasks } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: pendingTasks } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'pending')

  console.log('Dashboard data - User ID:', user.id, 'Pending count:', pendingTasks)

  const { count: completedTasks } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed')

  // Check if user has GTM manifest
  const { data: manifest } = await supabase
    .from('gtm_manifests')
    .select('id')
    .eq('user_id', user.id)
    .single()

  // Fetch high priority tasks (priority >= 8)
  // First, get tasks with their analyses
  const { data: tasksWithAnalyses } = await supabase
    .from('tasks')
    .select(`
      id,
      description,
      status,
      source,
      created_at,
      analysis:task_analyses(
        priority,
        category,
        complexity,
        estimated_hours
      )
    `)
    .eq('user_id', user.id)
    .in('status', ['pending', 'in_progress'])
    .order('created_at', { ascending: false })

  // Filter for high priority tasks client-side
  const highPriorityTasks = (tasksWithAnalyses || [])
    .filter(task => task.analysis?.[0]?.priority >= 8)
    .sort((a, b) => (b.analysis?.[0]?.priority || 0) - (a.analysis?.[0]?.priority || 0))
    .slice(0, 5)

  // Fetch recent tasks
  const { data: recentTasks } = await supabase
    .from('tasks')
    .select(`
      id,
      description,
      status,
      source,
      created_at,
      analysis:task_analyses(
        priority,
        category,
        complexity,
        estimated_hours
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch top pending tasks specifically for the dashboard
  // First, try a simple query to ensure we get data
  const { data: pendingTasksData, error: pendingTasksError } = await supabase
    .from('tasks')
    .select(`
      id,
      description,
      status,
      source,
      created_at
    `)
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(20)

  // Log for debugging
  console.log('Pending tasks query result:', { 
    count: pendingTasksData?.length || 0, 
    error: pendingTasksError,
    data: pendingTasksData 
  })

  // Now fetch the analyses separately for the pending tasks
  let topPendingTasks = []
  if (pendingTasksData && pendingTasksData.length > 0) {
    // Get task IDs
    const taskIds = pendingTasksData.map(t => t.id)
    
    // Fetch analyses for these tasks
    const { data: analyses } = await supabase
      .from('task_analyses')
      .select('*')
      .in('task_id', taskIds)

    // Merge the data
    topPendingTasks = pendingTasksData.map(task => {
      const analysis = analyses?.find(a => a.task_id === task.id)
      return {
        ...task,
        analysis: analysis ? [analysis] : []
      }
    })
    
    // Sort by priority and take top 5
    topPendingTasks = topPendingTasks
      .sort((a, b) => {
        const aPriority = a.analysis?.[0]?.priority || 0
        const bPriority = b.analysis?.[0]?.priority || 0
        return bPriority - aPriority
      })
      .slice(0, 5)
  }

  console.log('Top pending tasks:', topPendingTasks)

  // Fetch in progress tasks
  const { count: inProgressTasks } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'in_progress')

  // Fetch blocked tasks
  const { count: blockedTasks } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'blocked')

  const userName = profile?.name || user.email?.split('@')[0] || 'User'

  return (
    <DashboardContent
      userName={userName}
      totalTasks={totalTasks || 0}
      pendingTasks={pendingTasks || 0}
      completedTasks={completedTasks || 0}
      inProgressTasks={inProgressTasks || 0}
      blockedTasks={blockedTasks || 0}
      hasGTMManifest={!!manifest}
      highPriorityTasks={highPriorityTasks || []}
      recentTasks={recentTasks || []}
      topPendingTasks={topPendingTasks || []}
    />
  )
}