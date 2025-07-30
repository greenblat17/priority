# Troubleshooting: Supabase Relationship Error

## Problem
When accessing http://localhost:3000/api/debug-tasks, you received:
```json
{
  "error": "Could not embed because more than one relationship was found for 'tasks' and 'task_analyses'"
}
```

## Root Cause
The `task_analyses` table has TWO foreign key relationships to the `tasks` table:
1. `task_id` - The main relationship (each analysis belongs to one task)
2. `duplicate_of` - Optional reference to another task if this is a duplicate

When you query `task_analyses (*)` without specifying which relationship to use, Supabase doesn't know which foreign key to follow.

## Solution
Specify the foreign key name explicitly in the query:

**Before (ambiguous):**
```typescript
.select(`
  *,
  task_analyses (*)
`)
```

**After (explicit):**
```typescript
.select(`
  *,
  task_analyses!task_id (*)
`)
```

The `!task_id` syntax tells Supabase to use the `task_id` foreign key relationship.

## Fix Applied
Updated `/src/app/api/debug-tasks/route.ts` to use the explicit relationship.

## Testing
1. Refresh your browser
2. Visit http://localhost:3000/api/debug-tasks again
3. You should now see your tasks with their analysis data

## Example Response
```json
{
  "user_id": "your-user-id",
  "task_count": 3,
  "tasks": [
    {
      "id": "task-id",
      "description": "The login button on the homepage...",
      "status": "pending",
      "created_at": "2024-01-30T...",
      "analysis": {
        "category": "bug",
        "priority": 9,
        "complexity": "medium",
        "estimated_hours": 4,
        "confidence_score": 85,
        "has_spec": true
      }
    }
  ]
}
```

## Additional Notes
- This is a common issue when tables have multiple relationships
- Always specify the foreign key when there's ambiguity
- The duplicate detection feature (using `duplicate_of`) will be implemented in Phase 3