import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCcw, WifiOff } from 'lucide-react'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  isOffline?: boolean
}

export function ErrorState({ 
  title = 'Something went wrong',
  message = 'There was an error loading this content. Please try again.',
  onRetry,
  isOffline = false
}: ErrorStateProps) {
  const Icon = isOffline ? WifiOff : AlertCircle

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-6 text-center">
      <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-red-600" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {isOffline ? 'No internet connection' : title}
      </h3>
      
      <p className="text-sm text-gray-600 mb-6 max-w-sm">
        {isOffline 
          ? 'Please check your connection and try again.'
          : message
        }
      </p>
      
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="default"
          size="sm"
          className="gap-2"
        >
          <RefreshCcw className="w-4 h-4" />
          Try again
        </Button>
      )}
    </div>
  )
}