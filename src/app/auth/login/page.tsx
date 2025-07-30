import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LoginForm } from '@/components/auth/login-form'

interface LoginPageProps {
  searchParams: Promise<{
    mode?: 'signin' | 'signup'
    error?: string
    next?: string
  }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient()
  
  // Check if user is already logged in
  const { data: { user } } = await supabase.auth.getUser()
  
  // Await searchParams
  const params = await searchParams
  
  if (user) {
    // Redirect to dashboard or the 'next' URL if provided
    redirect(params.next || '/dashboard')
  }

  const mode = params.mode || 'signin'

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center
                            transform hover:scale-110 transition-transform duration-200">
              <span className="text-white font-bold text-2xl">T</span>
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-black">
            TaskPriority AI
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            AI-powered task management for solo founders
          </p>
        </div>
        
        {params.error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-center text-sm text-red-600">
            Authentication error. Please try again.
          </div>
        )}
        
        <LoginForm mode={mode} />
      </div>
    </div>
  )
}