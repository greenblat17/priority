import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Search, 
  ListChecks, 
  Filter,
  Plus,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  variant?: 'default' | 'search' | 'filter' | 'error'
  title: string
  description?: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const iconMap = {
  default: FileText,
  search: Search,
  filter: Filter,
  error: FileText
}

export function EmptyState({
  variant = 'default',
  title,
  description,
  icon,
  action,
  className
}: EmptyStateProps) {
  const Icon = icon ? null : iconMap[variant]

  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[400px] p-8 text-center",
      className
    )}>
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        {icon || (Icon && <Icon className="w-8 h-8 text-gray-400" />)}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-sm text-gray-600 mb-6 max-w-sm">
          {description}
        </p>
      )}
      
      {action && (
        <Button
          onClick={action.onClick}
          variant="default"
          size="sm"
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Specific empty state variants
export function NoTasksEmptyState({ onCreateTask }: { onCreateTask: () => void }) {
  return (
    <EmptyState
      icon={<ListChecks className="w-8 h-8 text-gray-400" />}
      title="No tasks yet"
      description="Get started by creating your first task. TaskPriority AI will help you prioritize and manage your work."
      action={{
        label: "Create your first task",
        onClick: onCreateTask
      }}
    />
  )
}

export function NoSearchResultsEmptyState() {
  return (
    <EmptyState
      variant="search"
      title="No results found"
      description="Try adjusting your search terms or filters"
    />
  )
}

export function NoFilterResultsEmptyState({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <EmptyState
      variant="filter"
      title="No tasks match your filters"
      description="Try adjusting your filters to see more tasks"
      action={{
        label: "Clear filters",
        onClick: onClearFilters
      }}
    />
  )
}

export function NewUserDashboardEmptyState({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <EmptyState
      icon={<Sparkles className="w-8 h-8 text-gray-400" />}
      title="Welcome to TaskPriority AI"
      description="Let's get you started with AI-powered task management designed for solo founders."
      action={{
        label: "Get started",
        onClick: onGetStarted
      }}
    />
  )
}