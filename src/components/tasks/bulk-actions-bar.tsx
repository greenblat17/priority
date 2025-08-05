'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  X, 
  MoreHorizontal, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  CircleDot,
  CircleCheck,
  CircleX,
  ChevronDown,
  Download
} from 'lucide-react'
import { TaskStatusType } from '@/types/task'

interface BulkActionsBarProps {
  selectedCount: number
  onClearSelection: () => void
  onUpdateStatus: (status: TaskStatusType) => void
  onDelete: () => void
  onExport?: () => void
}

export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onUpdateStatus,
  onDelete,
  onExport
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-white border shadow-lg rounded-lg px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {selectedCount} selected
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onClearSelection}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-4 w-px bg-gray-300" />

        {/* Update Status Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              Update Status
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Set status to:</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onUpdateStatus('backlog')}>
              <Circle className="h-4 w-4 mr-2 text-gray-500" />
              Backlog
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateStatus('todo')}>
              <Circle className="h-4 w-4 mr-2 text-gray-700" />
              Todo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateStatus('in_progress')}>
              <CircleDot className="h-4 w-4 mr-2 text-yellow-600" />
              In Progress
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateStatus('done')}>
              <CircleCheck className="h-4 w-4 mr-2 text-blue-600" />
              Done
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateStatus('canceled')}>
              <CircleX className="h-4 w-4 mr-2 text-gray-500" />
              Canceled
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* More Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {onExport && (
              <>
                <DropdownMenuItem onClick={onExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Selected
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem 
              onClick={onDelete}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}