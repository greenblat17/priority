'use client'

import { motion } from 'framer-motion'
import { pageTransition } from '@/lib/animations'
import { cn } from '@/lib/utils'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className={cn("min-h-screen", className)}
    >
      {children}
    </motion.div>
  )
}