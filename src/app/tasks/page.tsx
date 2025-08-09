import { Suspense } from 'react'
import { TaskList } from '@/components/tasks/task-list'
import { TasksClientHeader } from './tasks_client_header'

export default function TasksPage() {
  return (
    <div className="h-full">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <Suspense fallback={null}>
            <TasksClientHeader />
          </Suspense>
        </div>

        <TaskList />
      </div>
    </div>
  )
}
