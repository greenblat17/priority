'use client'

import { useState, useEffect, useCallback } from 'react'

interface FilterState {
  status: string
  category: string
  sortBy: 'priority' | 'date' | 'status'
  sortOrder: 'asc' | 'desc'
}

const STORAGE_KEY = 'taskpriority-filters'

const defaultFilters: FilterState = {
  status: 'all',
  category: 'all',
  sortBy: 'priority',
  sortOrder: 'desc'
}

export function useFilterPersistence() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load filters from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setFilters({
          ...defaultFilters,
          ...parsed
        })
      }
    } catch (error) {
      console.error('Failed to load filters from localStorage:', error)
    }
    setIsInitialized(true)
  }, [])

  // Save filters to localStorage whenever they change
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
      } catch (error) {
        console.error('Failed to save filters to localStorage:', error)
      }
    }
  }, [filters, isInitialized])

  const updateFilter = useCallback(<K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  return {
    filters,
    updateFilter,
    resetFilters,
    isInitialized
  }
}