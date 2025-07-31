'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ComponentProps, useCallback, useRef } from 'react'
import { usePrefetch } from '@/hooks/use-prefetch'

interface PrefetchLinkProps extends ComponentProps<typeof Link> {
  prefetchDelay?: number
}

export function PrefetchLink({ 
  href, 
  prefetchDelay = 100,
  onMouseEnter,
  onMouseLeave,
  onClick,
  ...props 
}: PrefetchLinkProps) {
  const router = useRouter()
  const { prefetchTasks, prefetchOverview, cancelPrefetch } = usePrefetch()
  const isPrefetchingRef = useRef(false)

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    onMouseEnter?.(e)
    
    // Don't prefetch if already prefetching
    if (isPrefetchingRef.current) return
    
    isPrefetchingRef.current = true
    
    // Prefetch based on the href
    const path = typeof href === 'string' ? href : href?.pathname
    
    if (!path) return
    
    if (path === '/tasks') {
      prefetchTasks({ delay: prefetchDelay })
    } else if (path === '/overview') {
      prefetchOverview({ delay: prefetchDelay })
    }
    
    // Also use Next.js built-in prefetch
    router.prefetch(path)
  }, [href, router, prefetchTasks, prefetchOverview, prefetchDelay, onMouseEnter])

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    onMouseLeave?.(e)
    isPrefetchingRef.current = false
    cancelPrefetch()
  }, [cancelPrefetch, onMouseLeave])

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    // Cancel any pending prefetch when clicking
    cancelPrefetch()
  }, [cancelPrefetch, onClick])

  return (
    <Link
      href={href}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      {...props}
    />
  )
}