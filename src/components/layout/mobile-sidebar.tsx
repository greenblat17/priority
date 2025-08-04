'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSupabase } from '@/components/providers/supabase-provider'
import { cn } from '@/lib/utils'
import { 
  LayoutList, 
  FileText, 
  BarChart3, 
  Settings, 
  Plus,
  Menu,
  X,
  LogOut,
  User,
  CreditCard,
  Bell,
  Keyboard
} from 'lucide-react'
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
import { QuickAddModal } from '@/components/tasks/quick-add-modal'

export function MobileSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useSupabase()
  const [isOpen, setIsOpen] = useState(false)
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  
  // Connect keyboard shortcut
  useQuickAddShortcut(() => setIsQuickAddOpen(true))
  
  const navItems = [
    { 
      id: 'tasks',
      href: '/tasks', 
      label: 'Tasks', 
      icon: LayoutList,
    },
    { 
      id: 'pages',
      href: '/pages', 
      label: 'Pages', 
      icon: FileText,
    },
    { 
      id: 'overview',
      href: '/overview', 
      label: 'Overview', 
      icon: BarChart3,
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
  
  const handleNavigation = (href: string) => {
    router.push(href)
    setIsOpen(false)
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
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">T</span>
              </div>
              <span className="font-semibold text-gray-900 text-lg">TaskPriority</span>
            </div>
          </div>
          
          <Button onClick={() => setIsQuickAddOpen(true)} size="icon" variant="ghost">
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </header>
      
      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-80 bg-white z-50 shadow-xl lg:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">T</span>
                    </div>
                    <span className="font-semibold text-gray-900 text-lg">TaskPriority</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                {/* Quick Add */}
                <div className="p-4">
                  <Button
                    onClick={() => {
                      setIsQuickAddOpen(true)
                      setIsOpen(false)
                    }}
                    className="w-full gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Task
                  </Button>
                </div>
                
                {/* Navigation */}
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
                            "w-full justify-start gap-3",
                            active && "bg-gray-100 font-medium"
                          )}
                          onClick={() => handleNavigation(item.href)}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </Button>
                      )
                    })}
                  </div>
                </nav>
                
                {/* User Section */}
                <div className="border-t border-gray-100 p-4 space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign out</span>
                  </Button>
                  
                  {/* User Info */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">{userInitials}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {user?.email?.split('@')[0]}
                      </div>
                      <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Quick Add Modal */}
      <QuickAddModal 
        isOpen={isQuickAddOpen} 
        onClose={() => setIsQuickAddOpen(false)} 
      />
    </>
  )
}