import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export interface VirtualRange {
  startIndex: number
  endIndex: number
  paddingTop: number
  paddingBottom: number
}

interface UseVirtualListOptions {
  itemCount: number
  itemHeight: number // in px, fixed height per row
  overscan?: number
}

export function useVirtualList<T extends HTMLElement>(
  containerRef: React.RefObject<T>,
  { itemCount, itemHeight, overscan = 6 }: UseVirtualListOptions
): VirtualRange {
  const [range, setRange] = useState<VirtualRange>(() => ({
    startIndex: 0,
    endIndex: Math.min(itemCount - 1, overscan * 2),
    paddingTop: 0,
    paddingBottom: Math.max(
      0,
      itemCount * itemHeight - (overscan * 2 + 1) * itemHeight
    ),
  }))

  const compute = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const scrollTop = el.scrollTop
    const viewportHeight = el.clientHeight

    const firstVisibleIndex = Math.floor(scrollTop / itemHeight)
    const visibleCount = Math.ceil(viewportHeight / itemHeight)

    const startIndex = Math.max(0, firstVisibleIndex - overscan)
    const endIndex = Math.min(
      itemCount - 1,
      firstVisibleIndex + visibleCount + overscan
    )

    const paddingTop = startIndex * itemHeight
    const paddingBottom = Math.max(0, (itemCount - endIndex - 1) * itemHeight)

    setRange({ startIndex, endIndex, paddingTop, paddingBottom })
  }, [containerRef, itemCount, itemHeight, overscan])

  // Initial and on-scroll updates
  useEffect(() => {
    compute()
    const el = containerRef.current
    if (!el) return
    const handler = () => compute()
    el.addEventListener('scroll', handler, { passive: true })
    return () => el.removeEventListener('scroll', handler)
  }, [compute, containerRef])

  // Recompute on resize
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => compute())
    ro.observe(el)
    return () => ro.disconnect()
  }, [compute, containerRef])

  // React to itemCount changes
  useEffect(() => {
    compute()
  }, [itemCount, compute])

  return range
}
