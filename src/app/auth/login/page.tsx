import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LoginForm } from '@/components/auth/login-form'

interface LoginPageProps {
  searchParams: {
    mode?: 'signin' | 'signup'
    error?: string
    next?: string
  }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = createClient()
  
  // Check if user is already logged in
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    // Redirect to dashboard or the 'next' URL if provided
    redirect(searchParams.next || '/dashboard')
  }

  const mode = searchParams.mode || 'signin'

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            TaskPriority AI
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            AI-powered task management for solo founders
          </p>
        </div>
        
        {searchParams.error && (
          <div className="mx-auto max-w-md rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
            Authentication error. Please try again.
          </div>
        )}
        
        <LoginForm mode={mode} />
      </div>
    </div>
  )
}