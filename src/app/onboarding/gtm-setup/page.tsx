'use client'

import { GTMManifestForm } from '@/components/gtm/gtm-manifest-form'
import { Card } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

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