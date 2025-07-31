'use client'

import { useEffect, useState, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayedChildren, setDisplayedChildren] = useState(children)

  useEffect(() => {
    // Start transition
    setIsTransitioning(true)

    // After fade out, update content
    const timer1 = setTimeout(() => {
      setDisplayedChildren(children)
    }, 100)

    // After content update, fade in
    const timer2 = setTimeout(() => {
      setIsTransitioning(false)
    }, 150)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [pathname, children])

  return (
    <div
      className={cn(
        'transition-opacity duration-200 ease-in-out',
        isTransitioning ? 'opacity-0' : 'opacity-100',
        className
      )}
    >
      {displayedChildren}
    </div>
  )
}

// Alternative implementation using CSS animations for smoother transitions
export function SmoothPageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname()
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => {
      setIsAnimating(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <div
      className={cn(
        'transition-all duration-200 ease-out',
        isAnimating ? 'animate-page-in' : '',
        className
      )}
      style={{
        animationFillMode: 'backwards',
      }}
    >
      {children}
    </div>
  )
}