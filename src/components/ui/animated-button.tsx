'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { buttonTap, springs } from '@/lib/animations'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'
import { Button } from './button'
import { VariantProps } from 'class-variance-authority'
import { buttonVariants } from './button'

interface AnimatedButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  motionProps?: HTMLMotionProps<"button">
  disableAnimations?: boolean
  asChild?: boolean
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, children, motionProps, disableAnimations = false, ...props }, ref) => {
    if (disableAnimations) {
      return (
        <Button ref={ref} className={className} {...props}>
          {children}
        </Button>
      )
    }

    // Extract HTML props that might conflict with motion props
    const { onDrag, onDragStart, onDragEnd, ...safeProps } = props as any

    return (
      <motion.button
        ref={ref}
        whileTap={buttonTap}
        whileHover={{ scale: 1.02 }}
        transition={springs.snappy}
        className={cn(
          // Include all button styles
          "inline-flex items-center justify-center text-sm font-medium",
          "ring-offset-background transition-colors focus-visible:outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...motionProps}
        {...safeProps}
      >
        {children}
      </motion.button>
    )
  }
)

AnimatedButton.displayName = 'AnimatedButton'

// Floating Action Button with more dramatic animations
export const FloatingActionButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, children, ...props }, ref) => {
    // Extract HTML props that might conflict with motion props
    const { onDrag, onDragStart, onDragEnd, ...safeProps } = props as any
    
    return (
      <motion.button
        ref={ref}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileTap={{ scale: 0.95 }}
        whileHover={{ 
          scale: 1.1,
          boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
        }}
        transition={springs.bouncy}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full",
          "bg-black text-white shadow-lg",
          "flex items-center justify-center",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        {...safeProps}
      >
        {children}
      </motion.button>
    )
  }
)

FloatingActionButton.displayName = 'FloatingActionButton'