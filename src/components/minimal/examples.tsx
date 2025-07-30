/**
 * Minimal Component Examples
 * These examples show how to implement components using our minimal design system
 */

import { designTokens } from '@/lib/design-tokens'

// Minimal Button Example
export function MinimalButton() {
  return (
    <>
      {/* Primary Button */}
      <button className="btn btn-primary">
        Add Task
      </button>
      
      {/* Ghost Button */}
      <button className="btn btn-ghost">
        Cancel
      </button>
      
      {/* Small Ghost Button */}
      <button className="btn btn-ghost btn-sm">
        •••
      </button>
    </>
  )
}

// Minimal Task Table Example
export function MinimalTaskTable() {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Task</th>
          <th>Category</th>
          <th>Priority</th>
          <th className="text-right">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="font-semibold">Build landing page</td>
          <td className="text-muted">Feature</td>
          <td>
            <span className="font-mono">8/10</span>
          </td>
          <td className="text-right">
            <button className="btn btn-ghost btn-sm">•••</button>
          </td>
        </tr>
        <tr>
          <td className="font-semibold">Fix login bug</td>
          <td className="text-muted">Bug</td>
          <td>
            <span className="font-mono">9/10</span>
          </td>
          <td className="text-right">
            <button className="btn btn-ghost btn-sm">•••</button>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

// Minimal Card Example
export function MinimalCard() {
  return (
    <div className="card">
      <h3 className="text-heading mb-2">Active Tasks</h3>
      <p className="text-muted">You have 12 tasks to complete today</p>
    </div>
  )
}

// Minimal Input Example
export function MinimalInput() {
  return (
    <div className="stack">
      <label className="text-small font-semibold">
        Task Description
      </label>
      <input 
        type="text" 
        className="input" 
        placeholder="Describe your task..."
      />
    </div>
  )
}

// Minimal Dialog Example
export function MinimalDialog() {
  return (
    <>
      {/* Overlay */}
      <div className="dialog-overlay" />
      
      {/* Content */}
      <div className="dialog-content max-w-md">
        <h2 className="text-heading mb-4">Add Task</h2>
        <input 
          type="text" 
          className="input mb-4" 
          placeholder="Describe your task..."
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button className="btn btn-ghost">Cancel</button>
          <button className="btn btn-primary">Add Task</button>
        </div>
      </div>
    </>
  )
}

// Minimal Dashboard Example
export function MinimalDashboard() {
  return (
    <div className="container">
      <div className="stack-lg">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading">Tasks</h1>
            <p className="text-small text-muted mt-1">
              23 active • 5 completed today
            </p>
          </div>
          <button className="btn btn-primary">
            Add Task
          </button>
        </div>
        
        {/* Task List */}
        <MinimalTaskTable />
      </div>
    </div>
  )
}

// Minimal Header Example
export function MinimalHeader() {
  return (
    <header style={{ borderBottom: `1px solid ${designTokens.colors.border}` }}>
      <div className="container">
        <div className="flex items-center justify-between" style={{ height: '56px' }}>
          <h1 className="font-semibold">TaskPriority</h1>
          <button className="btn btn-ghost btn-sm">
            Menu
          </button>
        </div>
      </div>
    </header>
  )
}

// Minimal Badge Example
export function MinimalBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="badge">
      {children}
    </span>
  )
}

// Complete Page Example
export function MinimalPageExample() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <MinimalHeader />
      
      <main style={{ flex: 1, paddingTop: designTokens.spacing[8] }}>
        <MinimalDashboard />
      </main>
    </div>
  )
}

// Using design tokens directly in styles
export function TokenExample() {
  return (
    <div 
      style={{
        padding: designTokens.spacing[4],
        border: `1px solid ${designTokens.colors.border}`,
        borderRadius: designTokens.borderRadius.sm,
        backgroundColor: designTokens.colors.background,
      }}
    >
      <h3 
        style={{
          fontSize: designTokens.typography.fontSize.lg,
          fontWeight: designTokens.typography.fontWeight.semibold,
          marginBottom: designTokens.spacing[2],
        }}
      >
        Using Design Tokens
      </h3>
      <p style={{ color: designTokens.colors.muted }}>
        This component uses design tokens directly
      </p>
    </div>
  )
}