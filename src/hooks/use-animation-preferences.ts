import { useEffect, useState } from 'react'

export function useAnimationPreferences() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Check if user prefers reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return { prefersReducedMotion }
}

// Hook to get animation variants based on user preference
export function useMotionVariants<T extends Record<string, any>>(
  variants: T,
  reducedMotionVariants?: Partial<T>
): T {
  const { prefersReducedMotion } = useAnimationPreferences()

  if (prefersReducedMotion && reducedMotionVariants) {
    return { ...variants, ...reducedMotionVariants }
  }

  return variants
}

// Utility to create reduced motion variants
export function createReducedMotionVariants(variants: any) {
  // Remove y animations and reduce scale animations
  const reduced: any = {}
  
  for (const key in variants) {
    if (typeof variants[key] === 'object' && !Array.isArray(variants[key])) {
      reduced[key] = { ...variants[key] }
      
      // Remove vertical movement
      if ('y' in reduced[key]) {
        delete reduced[key].y
      }
      
      // Reduce scale changes
      if ('scale' in reduced[key] && reduced[key].scale !== 1) {
        reduced[key].scale = 1 + (reduced[key].scale - 1) * 0.5
      }
      
      // Speed up transitions
      if (reduced[key].transition) {
        reduced[key].transition = {
          ...reduced[key].transition,
          duration: 0.1,
        }
      }
    }
  }
  
  return reduced
}