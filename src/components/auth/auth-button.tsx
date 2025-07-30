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
    <Button asChild variant="default" size="sm">
      <Link href="/auth/login">Sign In</Link>
    </Button>
  )
}