import { Variants } from 'framer-motion'

// Spring configurations inspired by Linear
export const springs = {
  // Quick and responsive - for most interactions
  snappy: {
    type: 'spring',
    stiffness: 500,
    damping: 30,
  },
  // Smooth and natural - for larger movements
  smooth: {
    type: 'spring',
    stiffness: 400,
    damping: 40,
  },
  // Bouncy - for playful elements
  bouncy: {
    type: 'spring',
    stiffness: 600,
    damping: 20,
  },
  // Slow and dramatic - for important transitions
  dramatic: {
    type: 'spring',
    stiffness: 200,
    damping: 35,
  },
} as const

// Easing functions
export const easings = {
  easeOut: [0.16, 1, 0.3, 1], // Linear's signature easing
  easeIn: [0.42, 0, 1, 1],
  easeInOut: [0.42, 0, 0.58, 1],
  anticipate: [0.175, 0.885, 0.32, 1.275],
} as const

// Page transition variants
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: springs.smooth,
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: easings.easeIn,
    },
  },
}

// List item variants with stagger
export const listItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springs.snappy,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.15,
      ease: easings.easeIn,
    },
  },
}

// Container variants for stagger effect
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
}

// Modal/Dialog variants
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springs.smooth,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.15,
      ease: easings.easeIn,
    },
  },
}

// Backdrop variants
export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: easings.easeOut,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
      ease: easings.easeIn,
    },
  },
}

// Button tap animation
export const buttonTap = {
  scale: 0.98,
  transition: {
    duration: 0.1,
    ease: easings.easeOut,
  },
}

// Card hover animation
export const cardHover = {
  scale: 1.02,
  y: -2,
  transition: springs.snappy,
}

// Notification slide in
export const notificationVariants: Variants = {
  initial: {
    x: '100%',
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: springs.smooth,
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: easings.easeIn,
    },
  },
}

// Skeleton loading animation
export const shimmerVariants: Variants = {
  initial: {
    backgroundPosition: '-200% 0',
  },
  animate: {
    backgroundPosition: '200% 0',
    transition: {
      duration: 1.5,
      ease: 'linear',
      repeat: Infinity,
    },
  },
}

// Utility function for delayed stagger
export const createStaggerDelay = (index: number, baseDelay = 0.05) => ({
  transition: {
    delay: index * baseDelay,
    ...springs.snappy,
  },
})

// Hover lift effect
export const hoverLift = {
  y: -4,
  transition: springs.snappy,
}

// Focus scale effect
export const focusScale = {
  scale: 1.02,
  transition: springs.snappy,
}

// Utility for creating custom spring animations
export const createSpring = (
  stiffness: number = 400,
  damping: number = 30
) => ({
  type: 'spring',
  stiffness,
  damping,
})

// Gesture animations
export const gestureAnimations = {
  drag: {
    dragElastic: 0.2,
    dragTransition: { bounceStiffness: 600, bounceDamping: 20 },
  },
  whileDrag: {
    scale: 1.05,
    cursor: 'grabbing',
  },
}

// Optimistic update animation
export const optimisticUpdate = {
  initial: { opacity: 0.7, scale: 0.98 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: springs.snappy,
  },
}

// Tab switch animation
export const tabVariants: Variants = {
  inactive: {
    opacity: 0.6,
    scale: 0.98,
  },
  active: {
    opacity: 1,
    scale: 1,
    transition: springs.snappy,
  },
}