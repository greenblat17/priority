'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSupabase } from '@/components/providers/supabase-provider'
import { cn } from '@/lib/utils'
import { 
  LayoutList, 
  Settings, 
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  CreditCard,
  Bell,
  Keyboard,
  SquarePen,
  Plug
} from 'lucide-react'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { motion, AnimatePresence } from 'framer-motion'
import { springs } from '@/lib/animations'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useQuickAddShortcut } from '@/hooks/use-keyboard-shortcuts'
import { getPlatformKey } from '@/hooks/use-hotkeys'
import { QuickAddModal } from '@/components/tasks/quick-add-modal'

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useSupabase()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Handle search
  useEffect(() => {
    if (searchQuery) {
      const timeoutId = setTimeout(() => {
        router.push(`/tasks?search=${encodeURIComponent(searchQuery)}`)
      }, 300) // Debounce for 300ms
      
      return () => clearTimeout(timeoutId)
    }
  }, [searchQuery, router])
  
  // Connect keyboard shortcut
  useQuickAddShortcut(() => setIsQuickAddOpen(true))
  
  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved === 'true') {
      setIsCollapsed(true)
    }
  }, [])
  
  // Save collapsed state
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', isCollapsed.toString())
  }, [isCollapsed])
  
  const navItems = [
    { 
      id: 'tasks',
      href: '/tasks', 
      label: 'Tasks', 
      icon: LayoutList,
    },
    { 
      id: 'notifications',
      href: '/notifications', 
      label: 'Notifications', 
      icon: Bell,
    },
    { 
      id: 'integrations',
      href: '/integrations', 
      label: 'Integrations', 
      icon: Plug,
    },
    { 
      id: 'settings',
      href: '/settings/gtm', 
      label: 'Settings', 
      icon: Settings,
    },
  ]
  
  const isActive = (href: string) => {
    if (href === '/tasks' && (pathname === '/' || pathname === '/tasks')) return true
    if (href === '/settings/gtm' && pathname.startsWith('/settings')) return true
    return pathname.startsWith(href)
  }
  
  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }
  
  // Get user initials
  const userInitials = user?.email
    ?.split('@')[0]
    ?.split('.')
    ?.map(part => part[0])
    ?.join('')
    ?.toUpperCase()
    ?.slice(0, 2) || 'U'

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="relative bg-white border-r border-gray-100 flex flex-col h-screen"
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
          <motion.button
            onClick={() => router.push('/tasks')}
            className="flex items-center gap-3 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">T</span>
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="font-semibold text-gray-900 text-lg whitespace-nowrap"
                >
                  TaskPriority
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          
          {/* Collapse Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Search with Add Button */}
        <div className="p-4">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  className="w-full h-9 pl-9 pr-10 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
                {!searchQuery && (
                  <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                    /
                  </kbd>
                )}
              </div>
              <Button
                onClick={() => setIsQuickAddOpen(true)}
                size="icon"
                className="h-9 w-9 bg-black hover:bg-gray-800 text-white"
              >
                <SquarePen className="h-4 w-4" />
              </Button>
            </div>
          )}
          {isCollapsed && (
            <div className="space-y-2">
              <Button
                onClick={() => setIsQuickAddOpen(true)}
                size="icon"
                className="w-full h-10 bg-black hover:bg-gray-800 text-white"
              >
                <SquarePen className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => router.push('/tasks?focus=search')}
                size="icon"
                variant="outline"
                className="w-full h-10"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 px-4 py-2">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <Button
                  key={item.id}
                  variant={active ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 relative group",
                    active && "bg-gray-100 font-medium",
                    isCollapsed && "justify-center px-3"
                  )}
                  onClick={() => router.push(item.href)}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="flex-1 text-left">{item.label}</span>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                      {item.label}
                    </div>
                  )}
                </Button>
              )
            })}
          </div>
        </nav>

        {/* Notification & User Section */}
        <div className="border-t border-gray-100 p-4 space-y-3">
          {/* Notification Bell */}
          <div className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : "justify-between px-2"
          )}>
            {!isCollapsed && (
              <span className="text-sm font-medium text-gray-700">Notifications</span>
            )}
            <NotificationBell />
          </div>
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 hover:bg-gray-50",
                  isCollapsed && "justify-center px-3"
                )}
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-medium text-sm">{userInitials}</span>
                </div>
                {!isCollapsed && (
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {user?.email?.split('@')[0]}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align={isCollapsed ? "start" : "end"} 
              className="w-56"
              side="right"
              sideOffset={isCollapsed ? 12 : 4}
            >
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/settings/profile')}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings/billing')}>
                <CreditCard className="mr-2 h-4 w-4" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings/notifications')}>
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Keyboard className="mr-2 h-4 w-4" />
                Keyboard shortcuts
                <span className="ml-auto text-xs text-gray-500">?</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.aside>
      
      {/* Quick Add Modal */}
      <QuickAddModal 
        isOpen={isQuickAddOpen} 
        onClose={() => setIsQuickAddOpen(false)} 
      />
    </>
  )
}