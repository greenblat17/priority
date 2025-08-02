'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { containerVariants, listItemVariants } from '@/lib/animations'
import { cn } from '@/lib/utils'
import { Children, isValidElement, cloneElement } from 'react'

interface AnimatedListProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
  animate?: boolean
}

export function AnimatedList({ 
  children, 
  className,
  staggerDelay = 0.05,
  animate = true 
}: AnimatedListProps) {
  const modifiedContainerVariants = {
    ...containerVariants,
    visible: {
      ...(typeof containerVariants.visible === 'object' && 'opacity' in containerVariants.visible ? containerVariants.visible : {}),
      transition: {
        ...(typeof containerVariants.visible === 'object' && 'transition' in containerVariants.visible ? (containerVariants.visible as any).transition : {}),
        staggerChildren: staggerDelay,
      },
    },
  }

  if (!animate) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={modifiedContainerVariants}
      className={className}
    >
      <AnimatePresence mode="popLayout">
        {Children.map(children, (child, index) => {
          if (isValidElement(child)) {
            return (
              <motion.div
                key={child.key || index}
                layout
                variants={listItemVariants}
                className={cn("will-change-transform", (child as any).props?.className)}
              >
                {child}
              </motion.div>
            )
          }
          return child
        })}
      </AnimatePresence>
    </motion.div>
  )
}

// Individual list item component for more control
interface AnimatedListItemProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function AnimatedListItem({ 
  children, 
  className,
  delay = 0 
}: AnimatedListItemProps) {
  return (
    <motion.div
      layout
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={listItemVariants}
      custom={delay}
      className={cn("will-change-transform", className)}
    >
      {children}
    </motion.div>
  )
}