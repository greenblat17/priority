'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GTMManifestForm } from '@/components/gtm/gtm-manifest-form'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import type { GTMManifest } from '@/types/gtm'

export default function GTMSettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [manifest, setManifest] = useState<GTMManifest | null>(null)

  useEffect(() => {
    fetchManifest()
  }, [])

  async function fetchManifest() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('gtm_manifests')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching manifest:', error)
      } else if (data) {
        setManifest(data)
      }
    } catch (error) {
      console.error('Error in fetchManifest:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <GTMManifestForm 
          mode="settings" 
          initialData={manifest || undefined}
        />
      </Card>

      {!manifest && (
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            You haven't set up your GTM context yet. This helps our AI make better prioritization decisions.
          </p>
          <Button asChild variant="outline">
            <Link href="/onboarding">
              Complete GTM Setup
            </Link>
          </Button>
        </div>
      )}
    </>
  )
}