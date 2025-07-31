import { TaskWithAnalysis } from '@/types/task'

export interface ExportOptions {
  format: 'csv' | 'json'
  fields?: string[]
}

const DEFAULT_CSV_FIELDS = [
  'description',
  'status',
  'category',
  'priority',
  'complexity',
  'estimated_hours',
  'source',
  'customer_info',
  'created_at',
  'implementation_spec'
]

export function exportTasks(tasks: TaskWithAnalysis[], options: ExportOptions) {
  const { format, fields = DEFAULT_CSV_FIELDS } = options

  if (format === 'json') {
    return exportToJSON(tasks, fields)
  }

  return exportToCSV(tasks, fields)
}

function exportToJSON(tasks: TaskWithAnalysis[], fields: string[]) {
  const exportData = tasks.map(task => {
    const taskData: any = {}
    
    fields.forEach(field => {
      if (field === 'category' || field === 'priority' || field === 'complexity' || field === 'estimated_hours' || field === 'implementation_spec') {
        taskData[field] = task.analysis?.[field as keyof NonNullable<typeof task.analysis>] || ''
      } else {
        taskData[field] = task[field as keyof typeof task] || ''
      }
    })
    
    return taskData
  })

  const jsonString = JSON.stringify(exportData, null, 2)
  downloadFile(jsonString, 'tasks-export.json', 'application/json')
}

function exportToCSV(tasks: TaskWithAnalysis[], fields: string[]) {
  // Create CSV header
  const header = fields.join(',')
  
  // Create CSV rows
  const rows = tasks.map(task => {
    return fields.map(field => {
      let value = ''
      
      if (field === 'category' || field === 'priority' || field === 'complexity' || field === 'estimated_hours' || field === 'implementation_spec') {
        value = task.analysis?.[field as keyof NonNullable<typeof task.analysis>]?.toString() || ''
      } else {
        value = task[field as keyof typeof task]?.toString() || ''
      }
      
      // Escape quotes and wrap in quotes if contains comma or newline
      if (value.includes(',') || value.includes('\n') || value.includes('"')) {
        value = '"' + value.replace(/"/g, '""') + '"'
      }
      
      return value
    }).join(',')
  })
  
  const csvContent = [header, ...rows].join('\n')
  downloadFile(csvContent, 'tasks-export.csv', 'text/csv')
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}