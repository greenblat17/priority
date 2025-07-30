'use client'

import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

// Dynamically import the GTM form to reduce initial bundle
const GTMManifestForm = dynamic(
  () => import('@/components/gtm/gtm-manifest-form').then(mod => ({ default: mod.GTMManifestForm })),
  {
    loading: () => (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    ),
    ssr: false
  }
)

export default function GTMSetupPage() {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/onboarding">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Tell Us About Your Business
        </h1>
        <p className="text-muted-foreground">
          This information helps our AI make better prioritization decisions
        </p>
      </div>

      <Card>
        <GTMManifestForm mode="onboarding" />
      </Card>
    </div>
  )
}