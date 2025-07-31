'use client'

import { useState } from 'react'
import { PrefetchLink } from '@/components/ui/prefetch-link'
import { usePathname } from 'next/navigation'
import { useSupabase } from '@/components/providers/supabase-provider'
import { AuthButton } from '@/components/auth/auth-button'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

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
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center
                            group-hover:scale-110 transition-transform duration-200">
              <span className="text-white font-semibold text-sm">T</span>
            </div>
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
                      <span className={cn(
                        "absolute -bottom-0.5 left-0 h-0.5 bg-black transition-all duration-200",
                        isActive ? "w-full" : "w-0 group-hover:w-full"
                      )} />
                    </PrefetchLink>
                  )
                })}
              </nav>
            )}
            
            {/* Auth Button / User Menu */}
            <AuthButton />
            
            {/* Mobile menu button - only show when authenticated */}
            {user && (
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden h-9 w-9 p-0"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {user && isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <nav className="container mx-auto px-6 py-4 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href === '/tasks' && pathname === '/') ||
                  (item.href === '/settings/gtm' && pathname.startsWith('/settings'))
                
                return (
                  <PrefetchLink
                    key={item.href}
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
                )
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}