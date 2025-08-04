'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
import { MobileSidebar } from './mobile-sidebar'
import { useSupabase } from '@/components/providers/supabase-provider'

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useSupabase()
  
  // Don't show sidebar on auth pages or if not logged in
  const showSidebar = user && !pathname.startsWith('/auth/')
  
  if (!showSidebar) {
    return <>{children}</>
  }
  
  return (
    <>
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <MobileSidebar />
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </div>
      
      {/* Desktop Layout */}
      <div className="hidden lg:flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </>
  )
}