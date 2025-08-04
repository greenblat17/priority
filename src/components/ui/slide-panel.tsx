'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { Button } from './button'
import { motion, AnimatePresence } from 'framer-motion'

interface SlidePanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  className?: string
  title?: React.ReactNode
  description?: React.ReactNode
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export function SlidePanel({
  open,
  onOpenChange,
  children,
  className,
  title,
  description,
  width = 'md',
}: SlidePanelProps) {
  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full',
  }

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onOpenChange])

  // Prevent body scroll when panel is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
              mass: 0.8,
            }}
            className={cn(
              'fixed right-0 top-0 z-50 h-full w-full bg-background shadow-xl',
              widthClasses[width],
              className
            )}
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="flex items-start justify-between border-b px-6 py-4"
              >
                <div className="flex-1">
                  {title && (
                    <motion.h2
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15, duration: 0.3 }}
                      className="text-lg font-semibold leading-none tracking-tight"
                    >
                      {title}
                    </motion.h2>
                  )}
                  {description && (
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                      className="text-sm text-muted-foreground mt-1"
                    >
                      {description}
                    </motion.p>
                  )}
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.2 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 transition-all hover:rotate-90"
                    onClick={() => onOpenChange(false)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </Button>
                </motion.div>
              </motion.div>
              
              {/* Content */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.3 }}
                className="flex-1 overflow-y-auto"
              >
                {children}
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}