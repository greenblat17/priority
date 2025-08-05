export interface DisplaySettings {
  view: 'list' | 'board'
  grouping: 'status' | 'category' | 'priority' | 'date' | 'none'
  ordering: 'priority' | 'date' | 'status' | 'manual'
  orderDirection: 'asc' | 'desc'
  showCompletedByRecency: boolean
  completedIssues: 'all' | 'hide' | 'recent'
  showEmptyGroups: boolean
}