/**
 * Modern Minimal Component Examples
 * Beautiful, smooth, and delightful - not ugly or boring!
 */

import { designTokens } from '@/lib/design-tokens'

// Modern Button with subtle depth and smooth transitions
export function ModernButton() {
  return (
    <>
      {/* Primary Button - Vibrant and inviting */}
      <button className="
        px-6 py-2.5 
        bg-blue-500 hover:bg-blue-600 
        text-white font-medium 
        rounded-lg 
        transform transition-all duration-200 
        hover:scale-[1.02] hover:shadow-lg
        active:scale-[0.98]
      ">
        Add Task
      </button>
      
      {/* Ghost Button - Subtle but interactive */}
      <button className="
        px-6 py-2.5 
        text-gray-600 hover:text-gray-900 
        font-medium 
        rounded-lg 
        transition-all duration-200 
        hover:bg-gray-50
      ">
        Cancel
      </button>
    </>
  )
}

// Modern Task Table - Clean lines with subtle hover effects
export function ModernTaskTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
              Task
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
              Category
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
              Priority
            </th>
            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          <tr className="transition-colors hover:bg-gray-50/50 group">
            <td className="px-6 py-4">
              <span className="font-medium text-gray-900">Build landing page</span>
            </td>
            <td className="px-6 py-4">
              <span className="text-sm text-gray-600">Feature</span>
            </td>
            <td className="px-6 py-4">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                8/10
              </span>
            </td>
            <td className="px-6 py-4 text-right">
              <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path d="M10 4a2 2 0 100-4 2 2 0 000 4z" />
                  <path d="M10 20a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// Modern Card - Subtle shadow and beautiful spacing
export function ModernCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Active Tasks
      </h3>
      <p className="text-gray-600">
        You have 12 tasks to complete today
      </p>
      <div className="mt-4 flex items-center text-sm text-gray-500">
        <span className="flex items-center">
          <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 8.707 7.621a1 1 0 00-1.414 1.414l2.5 2.5a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" clipRule="evenodd" />
          </svg>
          5 completed
        </span>
        <span className="mx-2">•</span>
        <span>7 remaining</span>
      </div>
    </div>
  )
}

// Modern Input - Clean with focus ring
export function ModernInput() {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Task Description
      </label>
      <input 
        type="text" 
        className="
          w-full px-4 py-2.5 
          bg-white 
          border border-gray-300 
          rounded-lg 
          placeholder-gray-400
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          hover:border-gray-400
        " 
        placeholder="What needs to be done?"
      />
    </div>
  )
}

// Modern Dialog - Smooth animations and beautiful backdrop
export function ModernDialog() {
  return (
    <>
      {/* Backdrop with blur */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-all duration-300" />
      
      {/* Dialog with scale animation */}
      <div className="
        fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
        w-full max-w-md
        bg-white 
        rounded-2xl 
        shadow-xl 
        p-6
        transform transition-all duration-300
        scale-100 opacity-100
      ">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Add New Task
        </h2>
        
        <input 
          type="text" 
          className="
            w-full px-4 py-3 
            bg-gray-50 
            border border-gray-200 
            rounded-lg 
            placeholder-gray-400
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            focus:bg-white
          " 
          placeholder="What's your next priority?"
          autoFocus
        />
        
        <div className="flex gap-3 mt-6">
          <button className="
            flex-1 px-4 py-2.5 
            text-gray-600 
            font-medium 
            rounded-lg 
            transition-all duration-200 
            hover:bg-gray-100
          ">
            Cancel
          </button>
          <button className="
            flex-1 px-4 py-2.5 
            bg-blue-500 hover:bg-blue-600 
            text-white font-medium 
            rounded-lg 
            transform transition-all duration-200 
            hover:scale-[1.02]
            active:scale-[0.98]
          ">
            Add Task
          </button>
        </div>
      </div>
    </>
  )
}

// Modern Dashboard - Clean and inviting
export function ModernDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">
            TaskPriority
          </h1>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
            <img 
              src="/avatar.png" 
              alt="User" 
              className="w-8 h-8 rounded-full"
            />
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, Sarah
          </h2>
          <p className="text-gray-600">
            You're making great progress today!
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-2xl font-bold text-gray-900">23</div>
              <div className="text-sm text-gray-600">Active tasks</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-2xl font-bold text-green-600">12</div>
              <div className="text-sm text-gray-600">Completed today</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-2xl font-bold text-blue-600">8.2</div>
              <div className="text-sm text-gray-600">Avg priority</div>
            </div>
          </div>
        </div>
        
        {/* Add Task Button */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Your Tasks</h3>
          <button className="
            px-4 py-2 
            bg-blue-500 hover:bg-blue-600 
            text-white font-medium 
            rounded-lg 
            transform transition-all duration-200 
            hover:scale-[1.02] hover:shadow-lg
            active:scale-[0.98]
            flex items-center gap-2
          ">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </button>
        </div>
        
        {/* Task Table */}
        <ModernTaskTable />
      </main>
    </div>
  )
}

// Modern Badge - Subtle and elegant
export function ModernBadge({ children, variant = 'default' }: { 
  children: React.ReactNode, 
  variant?: 'default' | 'success' | 'warning' 
}) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-amber-50 text-amber-700',
  }
  
  return (
    <span className={`
      inline-flex items-center px-2.5 py-0.5 
      rounded-full text-xs font-medium
      ${variants[variant]}
    `}>
      {children}
    </span>
  )
}

// Priority Score with visual indicator
export function PriorityScore({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 8) return 'text-red-600 bg-red-50'
    if (score >= 6) return 'text-amber-600 bg-amber-50'
    return 'text-blue-600 bg-blue-50'
  }
  
  return (
    <span className={`
      inline-flex items-center justify-center
      w-12 h-8 
      rounded-lg 
      text-sm font-semibold
      ${getColor()}
    `}>
      {score}/10
    </span>
  )
}

// Smooth Loading State
export function ModernSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  )
}

// Empty State - Friendly and inviting
export function EmptyState() {
  return (
    <div className="text-center py-12">
      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <h3 className="mt-2 text-sm font-semibold text-gray-900">No tasks yet</h3>
      <p className="mt-1 text-sm text-gray-500">Get started by creating your first task.</p>
      <div className="mt-6">
        <button className="
          px-4 py-2 
          bg-blue-500 hover:bg-blue-600 
          text-white font-medium 
          rounded-lg 
          transform transition-all duration-200 
          hover:scale-[1.02]
          active:scale-[0.98]
        ">
          Add Your First Task
        </button>
      </div>
    </div>
  )
}