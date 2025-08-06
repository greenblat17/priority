'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Globe, FileSearch, Target, Sparkles, Brain } from 'lucide-react'
import { useEffect, useState } from 'react'

interface LoadingStep {
  id: string
  label: string
  icon: React.ElementType
  duration: number // in milliseconds
}

const steps: LoadingStep[] = [
  { id: 'fetch', label: 'Fetching landing page', icon: Globe, duration: 1500 },
  { id: 'analyze', label: 'Analyzing content', icon: FileSearch, duration: 2000 },
  { id: 'extract', label: 'Extracting product details', icon: Target, duration: 2500 },
  { id: 'ai', label: 'Understanding your value proposition', icon: Brain, duration: 2000 },
  { id: 'finalize', label: 'Finalizing import', icon: Sparkles, duration: 1000 }
]

interface ImportLoadingDialogProps {
  isOpen: boolean
  onClose: () => void
  url: string
}

export function ImportLoadingDialog({ isOpen, onClose, url }: ImportLoadingDialogProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  useEffect(() => {
    if (!isOpen) {
      // Reset state when dialog closes
      setCurrentStep(0)
      setCompletedSteps([])
      return
    }

    // Progress through steps
    let totalDelay = 0
    const timeouts: NodeJS.Timeout[] = []

    steps.forEach((step, index) => {
      const timeout = setTimeout(() => {
        setCurrentStep(index)
        if (index > 0) {
          setCompletedSteps(prev => [...prev, index - 1])
        }
      }, totalDelay)
      
      timeouts.push(timeout)
      totalDelay += step.duration
    })

    // Complete the last step
    const finalTimeout = setTimeout(() => {
      setCompletedSteps(prev => [...prev, steps.length - 1])
    }, totalDelay)
    
    timeouts.push(finalTimeout)

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout))
    }
  }, [isOpen])

  const getHostname = (urlString: string) => {
    try {
      const url = new URL(urlString)
      return url.hostname
    } catch {
      return urlString
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <div className="space-y-6 py-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Importing from Landing Page</h3>
            <p className="text-sm text-muted-foreground">
              Analyzing <span className="font-medium text-foreground">{getHostname(url)}</span>
            </p>
          </div>

          {/* Progress Steps */}
          <div className="space-y-3">
            <AnimatePresence mode="sync">
              {steps.map((step, index) => {
                const StepIcon = step.icon
                const isActive = currentStep === index
                const isCompleted = completedSteps.includes(index)
                
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Icon Container */}
                      <div className="relative">
                        <motion.div
                          className={`
                            w-10 h-10 rounded-full flex items-center justify-center
                            transition-all duration-300
                            ${isCompleted 
                              ? 'bg-green-100 text-green-600' 
                              : isActive 
                                ? 'bg-primary/10 text-primary' 
                                : 'bg-gray-100 text-gray-400'
                            }
                          `}
                          animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          {isCompleted ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            >
                              <CheckCircle className="h-5 w-5" />
                            </motion.div>
                          ) : (
                            <StepIcon className="h-5 w-5" />
                          )}
                        </motion.div>
                        
                        {/* Pulse animation for active step */}
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 rounded-full bg-primary/20"
                            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          />
                        )}
                      </div>

                      {/* Label */}
                      <div className="flex-1">
                        <p className={`
                          text-sm font-medium transition-colors duration-300
                          ${isCompleted 
                            ? 'text-green-600' 
                            : isActive 
                              ? 'text-foreground' 
                              : 'text-muted-foreground'
                          }
                        `}>
                          {step.label}
                        </p>
                        
                        {/* Progress bar for active step */}
                        {isActive && (
                          <motion.div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-primary"
                              initial={{ width: '0%' }}
                              animate={{ width: '100%' }}
                              transition={{ duration: step.duration / 1000, ease: 'linear' }}
                            />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Loading dots */}
          <div className="flex justify-center gap-1 pt-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-primary/30 rounded-full"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}