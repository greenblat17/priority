'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ArrowRight, Sparkles, Target, Rocket } from 'lucide-react'
import { toast } from 'sonner'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [hasExistingManifest, setHasExistingManifest] = useState(false)

  useEffect(() => {
    checkExistingManifest()
  }, [])

  async function checkExistingManifest() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: manifest } = await supabase
        .from('gtm_manifests')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (manifest) {
        setHasExistingManifest(true)
        // If they already have a manifest, redirect to dashboard
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error checking manifest:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    toast.info('You can set up your GTM context later in Settings')
    router.push('/dashboard')
  }

  const handleStart = () => {
    router.push('/onboarding/gtm-setup')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to TaskPriority AI! 🎯
        </h1>
        <p className="text-xl text-muted-foreground">
          Let's set up your business context for smarter task prioritization
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3 mb-12">
        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Know Your Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Tell us about your product and target audience to align tasks with business objectives
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-lg">AI-Powered Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Our AI uses your business context to score tasks based on real impact, not just urgency
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Rocket className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Save 10 Hours/Week</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Stop guessing what to work on. Focus on tasks that actually move your business forward
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Set Up Your GTM Context</CardTitle>
          <CardDescription className="text-base">
            Takes only 3-5 minutes and dramatically improves prioritization accuracy
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Progress value={0} className="w-24" />
            <span>0% Complete</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleStart}
              size="lg"
              className="group"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button
              onClick={handleSkip}
              variant="outline"
              size="lg"
            >
              Skip for Now
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            You can always update your GTM context later in Settings
          </p>
        </CardContent>
      </Card>
    </div>
  )
}