import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/route'
import { createTaskGroup, addTaskToGroup, storeSimilarityScores } from '@/lib/task-grouping'
import type { CreateTaskGroupRequest } from '@/types/task-group'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'create_group': {
        const groupRequest = data as CreateTaskGroupRequest
        const group = await createTaskGroup(groupRequest)
        
        if (!group) {
          return NextResponse.json(
            { error: 'Failed to create task group', details: 'Check server logs for more information' },
            { status: 500 }
          )
        }
        
        return NextResponse.json({ group })
      }

      case 'add_to_group': {
        const { taskId, groupId, similarities } = data
        const success = await addTaskToGroup(taskId, groupId, similarities)
        
        if (!success) {
          return NextResponse.json(
            { error: 'Failed to add task to group' },
            { status: 500 }
          )
        }
        
        return NextResponse.json({ success: true })
      }

      case 'store_similarities': {
        const { similarities } = data
        const success = await storeSimilarityScores(similarities)
        
        if (!success) {
          return NextResponse.json(
            { error: 'Failed to store similarity scores' },
            { status: 500 }
          )
        }
        
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Task grouping API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}