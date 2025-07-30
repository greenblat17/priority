import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardContent } from '@/components/dashboard/dashboard-content'

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
  const { data: highPriorityTasks } = await supabase
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
    .eq('status', 'pending')
    .gte('task_analyses.priority', 8)
    .order('task_analyses.priority', { ascending: false })
    .limit(5)

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
    />
  )
}