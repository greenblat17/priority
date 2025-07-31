import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OverviewContent } from '@/components/overview/overview-content'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function OverviewPage() {
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

  // Fetch simple statistics
  const { count: totalTasks } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: completedThisWeek } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  const { count: pendingTasks } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'pending')

  // Check if user has GTM manifest
  const { data: manifest } = await supabase
    .from('gtm_manifests')
    .select('id')
    .eq('user_id', user.id)
    .single()

  const userName = profile?.name || user.email?.split('@')[0] || 'User'

  return (
    <OverviewContent
      userName={userName}
      totalTasks={totalTasks || 0}
      completedThisWeek={completedThisWeek || 0}
      pendingTasks={pendingTasks || 0}
      hasGTMManifest={!!manifest}
    />
  )
}