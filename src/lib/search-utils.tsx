import { TaskWithAnalysis } from '@/types/task'
import React from 'react'

/**
 * Search tasks by matching against multiple fields
 */
export function searchTasks(tasks: TaskWithAnalysis[], searchQuery: string): TaskWithAnalysis[] {
  if (!searchQuery.trim()) {
    return tasks
  }

  const query = searchQuery.toLowerCase().trim()
  
  return tasks.filter(task => {
    // Search in task description
    if (task.description.toLowerCase().includes(query)) {
      return true
    }

    // Search in status
    if (task.status && task.status.toLowerCase().includes(query)) {
      return true
    }

    // Search in category (from analysis)
    if (task.analysis?.[0]?.category?.toLowerCase().includes(query)) {
      return true
    }

    // Search in priority (convert to string for number search)
    if (task.analysis?.[0]?.priority !== undefined) {
      const priorityStr = task.analysis[0].priority.toString()
      if (priorityStr.includes(query)) {
        return true
      }
    }

    // Search in implementation spec
    if (task.analysis?.[0]?.implementation_spec?.toLowerCase().includes(query)) {
      return true
    }

    // Search in source
    if (task.source?.toLowerCase().includes(query)) {
      return true
    }

    // Search in customer info
    if (task.customer_info?.toLowerCase().includes(query)) {
      return true
    }

    return false
  })
}

/**
 * Highlight search terms in text
 */
export function highlightSearchTerm(text: string, searchQuery: string): React.ReactNode {
  if (!searchQuery.trim() || !text) {
    return text
  }

  const query = searchQuery.trim()
  const regex = new RegExp(`(${query})`, 'gi')
  const parts = text.split(regex)

  return parts.map((part, index) => {
    if (part.toLowerCase() === query.toLowerCase()) {
      return (
        <mark key={index} className="bg-yellow-200 text-gray-900 rounded px-0.5">
          {part}
        </mark>
      )
    }
    return part
  })
}