'use client'

import Link from 'next/link'
import { useSupabase } from '@/components/providers/supabase-provider'
import { UserMenu } from '@/components/auth/user-menu'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function AuthButton() {
  const { user, isLoading } = useSupabase()

  if (isLoading) {
    return <Skeleton className="h-8 w-8 rounded-full" />
  }

  if (user) {
    return <UserMenu />
  }

  return (
    <Button 
      asChild 
      size="sm"
      className="bg-black hover:bg-gray-800 text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
    >
      <Link href="/auth/login">Sign In</Link>
    </Button>
  )
}