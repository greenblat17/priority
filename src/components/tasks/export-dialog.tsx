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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Download, FileJson, FileSpreadsheet } from 'lucide-react'
import { exportTasks, ExportOptions } from '@/lib/export-utils'
import { TaskWithAnalysis } from '@/types/task'

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tasks: TaskWithAnalysis[]
  selectedTasks?: TaskWithAnalysis[]
}

const FIELD_OPTIONS = [
  { id: 'description', label: 'Description', defaultChecked: true },
  { id: 'status', label: 'Status', defaultChecked: true },
  { id: 'category', label: 'Category', defaultChecked: true },
  { id: 'priority', label: 'Priority', defaultChecked: true },
  { id: 'complexity', label: 'Complexity', defaultChecked: true },
  { id: 'estimated_hours', label: 'Estimated Hours', defaultChecked: true },
  { id: 'source', label: 'Source', defaultChecked: true },
  { id: 'customer_info', label: 'Customer Info', defaultChecked: true },
  { id: 'created_at', label: 'Created Date', defaultChecked: true },
  { id: 'implementation_spec', label: 'Implementation Spec', defaultChecked: true },
]

export function ExportDialog({ 
  open, 
  onOpenChange, 
  tasks, 
  selectedTasks 
}: ExportDialogProps) {
  const [format, setFormat] = useState<'csv' | 'json'>('csv')
  const [exportScope, setExportScope] = useState<'all' | 'selected'>('all')
  const [selectedFields, setSelectedFields] = useState<string[]>(
    FIELD_OPTIONS.filter(f => f.defaultChecked).map(f => f.id)
  )

  const tasksToExport = exportScope === 'selected' && selectedTasks ? selectedTasks : tasks

  const handleExport = () => {
    const options: ExportOptions = {
      format,
      fields: selectedFields
    }
    
    exportTasks(tasksToExport, options)
    onOpenChange(false)
  }

  const toggleField = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId)
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Export Tasks</DialogTitle>
          <DialogDescription>
            Export your tasks to CSV or JSON format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Export scope */}
          {selectedTasks && selectedTasks.length > 0 && (
            <div className="space-y-2">
              <Label>Export scope</Label>
              <Select value={exportScope} onValueChange={(value: any) => setExportScope(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tasks ({tasks.length})</SelectItem>
                  <SelectItem value="selected">Selected tasks ({selectedTasks.length})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Format selection */}
          <div className="space-y-2">
            <Label>Export format</Label>
            <Select value={format} onValueChange={(value: any) => setFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    CSV (Spreadsheet)
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <FileJson className="h-4 w-4" />
                    JSON
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Field selection */}
          <div className="space-y-2">
            <Label>Fields to export</Label>
            <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-md p-3">
              {FIELD_OPTIONS.map(field => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.id}
                    checked={selectedFields.includes(field.id)}
                    onCheckedChange={() => toggleField(field.id)}
                  />
                  <Label
                    htmlFor={field.id}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={selectedFields.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export {tasksToExport.length} tasks
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}