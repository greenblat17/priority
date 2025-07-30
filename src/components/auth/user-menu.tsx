'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { LogOut, User, Settings } from 'lucide-react'

export function UserMenu() {
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useSupabase()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      toast.success('Signed out successfully')
      router.push('/')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Error signing out')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  const userEmail = user.email || 'User'
  const userName = user.user_metadata?.name || userEmail.split('@')[0]
  const userAvatar = user.user_metadata?.avatar_url

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="relative overflow-hidden group h-9 w-9 rounded-full p-0 hover:bg-gray-100"
        >
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors duration-200">
              <span className="text-gray-700 text-sm font-medium">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push('/settings/gtm')}
          className="cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isLoading}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}