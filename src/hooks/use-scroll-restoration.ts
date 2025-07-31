import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

// Store scroll positions for each route
const scrollPositions = new Map<string, number>()

export function useScrollRestoration() {
  const pathname = usePathname()
  const isFirstRender = useRef(true)

  useEffect(() => {
    // Save scroll position when navigating away
    const saveScrollPosition = () => {
      scrollPositions.set(pathname, window.scrollY)
    }

    // Restore scroll position on mount (but not on first page load)
    if (!isFirstRender.current) {
      const savedPosition = scrollPositions.get(pathname)
      if (savedPosition !== undefined) {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          window.scrollTo(0, savedPosition)
        })
      }
    }
    
    isFirstRender.current = false

    // Save position before unload
    window.addEventListener('beforeunload', saveScrollPosition)
    
    // Save position when navigating within the app
    const handleRouteChange = () => {
      saveScrollPosition()
    }

    // Use MutationObserver to detect route changes
    const observer = new MutationObserver(() => {
      const currentPath = window.location.pathname
      if (currentPath !== pathname) {
        handleRouteChange()
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      saveScrollPosition()
      window.removeEventListener('beforeunload', saveScrollPosition)
      observer.disconnect()
    }
  }, [pathname])

  // Provide a manual save function for specific use cases
  const saveCurrentPosition = () => {
    scrollPositions.set(pathname, window.scrollY)
  }

  return { saveCurrentPosition }
}

// Hook to preserve scroll on specific elements
export function useElementScrollRestoration(elementId: string) {
  const pathname = usePathname()
  const scrollKey = `${pathname}:${elementId}`

  useEffect(() => {
    const element = document.getElementById(elementId)
    if (!element) return

    // Restore saved position
    const savedPosition = scrollPositions.get(scrollKey)
    if (savedPosition !== undefined) {
      element.scrollTop = savedPosition
    }

    // Save position on scroll
    const handleScroll = () => {
      scrollPositions.set(scrollKey, element.scrollTop)
    }

    element.addEventListener('scroll', handleScroll)
    return () => {
      element.removeEventListener('scroll', handleScroll)
    }
  }, [pathname, elementId, scrollKey])
}