'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { cardHover, springs } from '@/lib/animations'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  hover?: boolean
  delay?: number
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, hover = true, delay = 0, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ ...springs.smooth, delay }}
        whileHover={hover ? cardHover : undefined}
        className={cn(
          "bg-card rounded-xl border p-6 transition-shadow duration-200",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

AnimatedCard.displayName = 'AnimatedCard'