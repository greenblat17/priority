'use client'

import { useState } from 'react'
import { Menu, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { PageTree } from '@/components/pages/page-tree'
import { usePages } from '@/hooks/use-pages'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { data: pages, isLoading } = usePages()
  
  // Extract current page ID from pathname
  const currentSlug = pathname.split('/pages/')[1]?.split('/')[0]
  const currentPageId = pages?.find(p => p.slug === currentSlug)?.id
  
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside
        className={cn(
          "w-64 border-r bg-muted/30 transition-all duration-300",
          !sidebarOpen && "w-0 overflow-hidden"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Pages</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/pages/new')}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Page Tree */}
          <ScrollArea className="flex-1 p-4">
            <PageTree
              pages={pages || []}
              currentPageId={currentPageId}
            />
          </ScrollArea>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Toggle Sidebar Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute left-4 top-4 z-10"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
        
        {/* Page Content */}
        <div className={cn(
          "transition-all duration-300",
          sidebarOpen ? "pl-12" : "pl-0"
        )}>
          {children}
        </div>
      </main>
    </div>
  )
}