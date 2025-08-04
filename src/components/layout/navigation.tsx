'use client'

import { useState } from 'react'
import { PrefetchLink } from '@/components/ui/prefetch-link'
import { usePathname } from 'next/navigation'
import { useSupabase } from '@/components/providers/supabase-provider'
import { AuthButton } from '@/components/auth/auth-button'
import { Button } from '@/components/ui/button'
import { Menu, X, Keyboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { springs } from '@/lib/animations'
import { KeyboardShortcutsDialog } from '@/components/keyboard-shortcuts-dialog'

export function Navigation() {
  const pathname = usePathname()
  const { user } = useSupabase()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Don't show navigation on auth pages
  if (pathname.startsWith('/auth/')) {
    return null
  }

  const navItems = [
    { href: '/tasks', label: 'Tasks' },
    { href: '/pages', label: 'Pages' },
    { href: '/overview', label: 'Overview' },
    { href: '/settings/gtm', label: 'Settings' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo with smooth hover */}
          <PrefetchLink 
            href={user ? "/tasks" : "/"}
            className="flex items-center gap-2 group"
          >
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={springs.snappy}
              className="w-8 h-8 bg-black rounded-lg flex items-center justify-center"
            >
              <span className="text-white font-semibold text-sm">T</span>
            </motion.div>
            <span className="font-semibold text-black text-lg">
              TaskPriority
            </span>
          </PrefetchLink>
          
          {/* Navigation and Auth */}
          <div className="flex items-center gap-4">
            {/* Minimal nav items - only show when authenticated */}
            {user && (
              <nav className="hidden md:flex items-center gap-6">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || 
                    (item.href === '/tasks' && pathname === '/') ||
                    (item.href === '/settings/gtm' && pathname.startsWith('/settings'))
                  
                  return (
                    <PrefetchLink 
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "relative group transition-colors duration-200",
                        isActive 
                          ? "text-black font-semibold" 
                          : "text-gray-600 hover:text-black"
                      )}
                    >
                      {item.label}
                      <motion.span 
                        className="absolute -bottom-0.5 left-0 h-0.5 bg-black"
                        initial={{ width: 0 }}
                        animate={{ width: isActive ? '100%' : 0 }}
                        whileHover={{ width: '100%' }}
                        transition={springs.snappy}
                      />
                    </PrefetchLink>
                  )
                })}
              </nav>
            )}
            
            {/* Keyboard shortcuts hint */}
            {user && (
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-foreground"
                title="View keyboard shortcuts"
              >
                <Keyboard className="h-4 w-4" />
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                  ?
                </kbd>
              </Button>
            )}
            
            {/* Auth Button / User Menu */}
            <AuthButton />
            
            {/* Mobile menu button - only show when authenticated */}
            {user && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="md:hidden h-9 w-9 p-0 inline-flex items-center justify-center rounded-md hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={springs.snappy}
                    >
                      <X className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={springs.snappy}
                    >
                      <Menu className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )}
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {user && isMobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={springs.smooth}
              className="md:hidden border-t border-gray-100 bg-white overflow-hidden"
            >
              <nav className="container mx-auto px-6 py-4 space-y-2">
                {navItems.map((item, index) => {
                const isActive = pathname === item.href || 
                  (item.href === '/tasks' && pathname === '/') ||
                  (item.href === '/settings/gtm' && pathname.startsWith('/settings'))
                
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ ...springs.snappy, delay: index * 0.1 }}
                    >
                      <PrefetchLink
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "block px-3 py-2 rounded-md text-base font-semibold transition-colors duration-200",
                          isActive
                            ? "bg-gray-100 text-black"
                            : "text-gray-600 hover:bg-gray-50 hover:text-black"
                        )}
                      >
                        {item.label}
                      </PrefetchLink>
                    </motion.div>
                  )
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog />
    </header>
  )
}