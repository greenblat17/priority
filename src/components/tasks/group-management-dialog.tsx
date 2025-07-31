'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Users, Plus, Trash2, Edit2, Save, X } from 'lucide-react'
import { TaskWithAnalysis } from '@/types/task'
import { TaskGroup } from '@/types/task-group'
import { toast } from 'sonner'

interface GroupManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groups: TaskGroup[]
  tasks: TaskWithAnalysis[]
  onCreateGroup: (name: string, taskIds: string[]) => void
  onUpdateGroup: (groupId: string, name: string) => void
  onDeleteGroup: (groupId: string) => void
}

export function GroupManagementDialog({
  open,
  onOpenChange,
  groups,
  tasks,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup
}: GroupManagementDialogProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [editingGroupName, setEditingGroupName] = useState('')

  const ungroupedTasks = tasks.filter(task => !task.group_id)

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      toast.error('Please enter a group name')
      return
    }
    
    if (selectedTaskIds.length === 0) {
      toast.error('Please select at least one task')
      return
    }

    onCreateGroup(newGroupName.trim(), selectedTaskIds)
    setNewGroupName('')
    setSelectedTaskIds([])
    setIsCreating(false)
  }

  const handleStartEdit = (group: TaskGroup) => {
    setEditingGroupId(group.id)
    setEditingGroupName(group.name || '')
  }

  const handleSaveEdit = () => {
    if (!editingGroupName.trim()) {
      toast.error('Group name cannot be empty')
      return
    }
    
    if (editingGroupId) {
      onUpdateGroup(editingGroupId, editingGroupName.trim())
      setEditingGroupId(null)
      setEditingGroupName('')
    }
  }

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Manage Task Groups</DialogTitle>
          <DialogDescription>
            Create and manage groups to organize related tasks
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Existing Groups */}
          <div>
            <h3 className="text-sm font-medium mb-2">Existing Groups</h3>
            <ScrollArea className="h-[200px] border rounded-md p-4">
              {groups.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No groups created yet
                </p>
              ) : (
                <div className="space-y-2">
                  {groups.map(group => {
                    const groupTasks = tasks.filter(t => t.group_id === group.id)
                    
                    return (
                      <div key={group.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="h-4 w-4 text-blue-600" />
                          </div>
                          
                          {editingGroupId === group.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editingGroupName}
                                onChange={(e) => setEditingGroupName(e.target.value)}
                                className="h-8 w-48"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEdit()
                                  if (e.key === 'Escape') {
                                    setEditingGroupId(null)
                                    setEditingGroupName('')
                                  }
                                }}
                              />
                              <Button size="sm" variant="ghost" onClick={handleSaveEdit}>
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => {
                                  setEditingGroupId(null)
                                  setEditingGroupName('')
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div>
                              <span className="font-medium text-sm">
                                {group.name || 'Unnamed Group'}
                              </span>
                              <p className="text-xs text-muted-foreground">
                                {groupTasks.length} task{groupTasks.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStartEdit(group)}
                            disabled={editingGroupId !== null}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onDeleteGroup(group.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Create New Group */}
          {isCreating ? (
            <div className="space-y-3 border rounded-lg p-4">
              <div className="space-y-2">
                <Label htmlFor="group-name">Group Name</Label>
                <Input
                  id="group-name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g., Authentication Tasks"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Select Tasks</Label>
                <ScrollArea className="h-[150px] border rounded-md p-2">
                  {ungroupedTasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      All tasks are already grouped
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {ungroupedTasks.map(task => (
                        <label
                          key={task.id}
                          className="flex items-center gap-2 p-2 hover:bg-muted/50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTaskIds.includes(task.id)}
                            onChange={() => toggleTaskSelection(task.id)}
                            className="rounded"
                          />
                          <span className="text-sm flex-1 truncate">
                            {task.description}
                          </span>
                          {task.analysis?.[0]?.category && (
                            <Badge variant="outline" className="text-xs">
                              {task.analysis[0].category}
                            </Badge>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCreating(false)
                    setNewGroupName('')
                    setSelectedTaskIds([])
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreateGroup}
                  disabled={!newGroupName.trim() || selectedTaskIds.length === 0}
                >
                  Create Group
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsCreating(true)}
              disabled={ungroupedTasks.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Group
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}