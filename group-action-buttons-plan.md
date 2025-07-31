# Group Action Buttons Implementation Plan

## Overview
Add dropdown menu with bulk actions to TaskGroup component for applying changes to all tasks within a group (e.g., delete all, change status for all).

## Design Approach
- Maintain minimalistic design with subtle three-dot menu button
- Position button in the group header alongside task count
- Use existing bulk operation hooks for consistency
- Prevent event propagation to avoid conflicts with group expansion

## Implementation Steps

### 1. Update TaskGroup Component Props
```tsx
interface TaskGroupProps {
  // ... existing props
  onBulkUpdateStatus?: (taskIds: string[], status: TaskStatusType) => void
  onBulkDelete?: (taskIds: string[]) => void
}
```

### 2. Add Dropdown Menu to TaskGroup Header
```tsx
import { MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// In the group header section:
<div className="flex items-center gap-2">
  <div className="text-sm text-gray-500">
    {tasks.length} task{tasks.length !== 1 ? 's' : ''}
  </div>
  {(onBulkUpdateStatus || onBulkDelete) && (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Group Actions</DropdownMenuLabel>
        {onBulkUpdateStatus && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs">Update All Status</DropdownMenuLabel>
            {(['pending', 'in_progress', 'completed', 'blocked'] as const).map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={(e) => {
                  e.stopPropagation()
                  const taskIds = tasks.map(t => t.id)
                  onBulkUpdateStatus(taskIds, status)
                }}
              >
                Mark all as {status.replace('_', ' ')}
              </DropdownMenuItem>
            ))}
          </>
        )}
        {onBulkDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation()
                const taskIds = tasks.map(t => t.id)
                onBulkDelete(taskIds)
              }}
            >
              Delete all tasks
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )}
</div>
```

### 3. Update TaskTableGrouped Component
Pass the bulk operation callbacks to TaskGroup components:

```tsx
// In TaskTableGrouped component
const bulkUpdateStatus = useBulkUpdateTaskStatus()
const bulkDelete = useBulkDeleteTasks()

// When rendering TaskGroup:
<TaskGroup
  key={groupId}
  group={group!}
  tasks={tasks}
  renderTask={renderTaskRow}
  hasCheckboxes={!!onToggleSelection}
  onBulkUpdateStatus={(taskIds, status) => {
    bulkUpdateStatus.mutate({ taskIds, status })
  }}
  onBulkDelete={(taskIds) => {
    bulkDelete.mutate(taskIds)
  }}
/>
```

### 4. Import Required Hooks
Add imports at the top of task-table-grouped.tsx:
```tsx
import { useBulkUpdateTaskStatus, useBulkDeleteTasks } from '@/hooks/use-tasks'
```

## Key Considerations

1. **Event Propagation**: Use `stopPropagation()` on all interactive elements to prevent triggering group expansion
2. **Visual Hierarchy**: Keep the button subtle (ghost variant, small size) to maintain minimalistic design
3. **Confirmation**: Consider adding confirmation dialog for bulk delete operations
4. **Loading States**: Show loading indicator during bulk operations
5. **Error Handling**: Leverage existing error handling from bulk operation hooks

## Benefits
- Efficient bulk operations on grouped tasks
- Consistent with existing UI patterns
- Leverages existing infrastructure (hooks, mutations)
- Maintains clean, minimalistic design