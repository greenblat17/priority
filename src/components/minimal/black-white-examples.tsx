/**
 * Black & White Design Examples
 * Primary palette: Black and white with gray accents
 * Blue used sparingly for priorities and key actions only
 */

import React from 'react'

// Example: Task Table with Black & White Design
export function BlackWhiteTaskTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-6 py-4 text-left text-sm font-semibold text-black">
              Task
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-black">
              Category
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-black">
              Priority
            </th>
            <th className="px-6 py-4 text-right text-sm font-semibold text-black">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          <tr className="transition-colors hover:bg-gray-50 group">
            <td className="px-6 py-4">
              <span className="font-medium text-black">Build landing page</span>
            </td>
            <td className="px-6 py-4">
              <span className="text-sm text-gray-500">Feature</span>
            </td>
            <td className="px-6 py-4">
              {/* Blue ONLY for priority */}
              <span className="font-mono text-sm font-semibold text-blue-500">
                8/10
              </span>
            </td>
            <td className="px-6 py-4 text-right">
              <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
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

// Example: Buttons in Black & White
export function BlackWhiteButtons() {
  return (
    <div className="flex gap-4">
      {/* Primary button - BLACK */}
      <button className="
        px-6 py-2.5 
        bg-black hover:bg-gray-800 
        text-white font-medium 
        rounded-lg 
        transform transition-all duration-200 
        hover:scale-[1.02] hover:shadow-md
        active:scale-[0.98]
      ">
        Add Task
      </button>
      
      {/* Secondary button - White with black border */}
      <button className="
        px-6 py-2.5 
        bg-white hover:bg-gray-50
        text-black font-medium 
        border border-gray-300 hover:border-black
        rounded-lg 
        transition-all duration-200
      ">
        Cancel
      </button>
      
      {/* Ghost button - Minimal */}
      <button className="
        px-6 py-2.5 
        text-gray-600 hover:text-black
        font-medium 
        rounded-lg 
        transition-all duration-200 
        hover:bg-gray-50
      ">
        Skip
      </button>
      
      {/* Special CTA - Blue (used sparingly) */}
      <button className="
        px-6 py-2.5 
        bg-blue-500 hover:bg-blue-600 
        text-white font-medium 
        rounded-lg 
        transform transition-all duration-200 
        hover:scale-[1.02] hover:shadow-md
        active:scale-[0.98]
      ">
        Start Free Trial
      </button>
    </div>
  )
}

// Example: Card in Black & White
export function BlackWhiteCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-black">
            Active Tasks
          </h3>
          <p className="text-gray-500 mt-1">
            Track your ongoing work
          </p>
        </div>
        <span className="text-2xl font-bold text-black">23</span>
      </div>
      
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-gray-500">
          <span className="text-green-600 font-medium">+5</span> from yesterday
        </span>
        {/* Blue only for important metrics */}
        <span className="text-blue-500 font-medium">
          Avg: 7.8/10
        </span>
      </div>
    </div>
  )
}

// Example: Form in Black & White
export function BlackWhiteForm() {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-black mb-1.5">
          Task Name
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
            hover:border-gray-400
            focus:outline-none focus:ring-2 focus:ring-black focus:border-black
          " 
          placeholder="What needs to be done?"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-black mb-1.5">
          Priority
        </label>
        <select className="
          w-full px-4 py-2.5 
          bg-white 
          border border-gray-300 
          rounded-lg 
          text-gray-600
          transition-all duration-200
          hover:border-gray-400
          focus:outline-none focus:ring-2 focus:ring-black focus:border-black
        ">
          <option>Select priority...</option>
          <option>Low (1-3)</option>
          <option>Medium (4-7)</option>
          <option className="text-blue-500 font-medium">High (8-10)</option>
        </select>
      </div>
    </div>
  )
}

// Example: Navigation in Black & White
export function BlackWhiteNavigation() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <h1 className="text-xl font-bold text-black">
          TaskPriority
        </h1>
        
        <nav className="flex items-center gap-6">
          <a href="#" className="text-gray-600 hover:text-black transition-colors">
            Dashboard
          </a>
          <a href="#" className="text-gray-600 hover:text-black transition-colors">
            Tasks
          </a>
          <a href="#" className="text-gray-600 hover:text-black transition-colors">
            Analytics
          </a>
          
          {/* Profile button */}
          <button className="
            w-10 h-10 
            rounded-full 
            bg-gray-100 hover:bg-gray-200
            flex items-center justify-center
            transition-colors duration-200
          ">
            <span className="text-sm font-medium text-black">JD</span>
          </button>
        </nav>
      </div>
    </header>
  )
}

// Example: Priority Badge (where blue is appropriate)
export function PriorityBadge({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 8) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (score >= 5) return 'text-gray-700 bg-gray-50 border-gray-300'
    return 'text-gray-500 bg-white border-gray-200'
  }
  
  return (
    <span className={`
      inline-flex items-center justify-center
      px-2.5 py-1 
      rounded-lg 
      text-sm font-semibold
      border
      ${getColor()}
    `}>
      {score}/10
    </span>
  )
}

// Example: Complete Dashboard
export function BlackWhiteDashboard() {
  return (
    <div className="min-h-screen bg-white">
      <BlackWhiteNavigation />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-black">
            Welcome back, Sarah
          </h2>
          <p className="text-gray-500 mt-1">
            Here's what needs your attention today
          </p>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {/* Regular stats in black/gray */}
          <BlackWhiteCard />
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-sm text-gray-500">Completed</div>
            <div className="text-2xl font-bold text-black mt-1">142</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-sm text-gray-500">This Week</div>
            <div className="text-2xl font-bold text-black mt-1">28</div>
          </div>
          {/* Blue only for priority metric */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-sm text-gray-500">Avg Priority</div>
            <div className="text-2xl font-bold text-blue-500 mt-1">7.8</div>
          </div>
        </div>
        
        {/* Task Table */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-black">Your Tasks</h3>
          <button className="
            px-4 py-2 
            bg-black hover:bg-gray-800 
            text-white font-medium 
            rounded-lg 
            transform transition-all duration-200 
            hover:scale-[1.02] hover:shadow-md
            active:scale-[0.98]
          ">
            Add Task
          </button>
        </div>
        
        <BlackWhiteTaskTable />
      </main>
    </div>
  )
}