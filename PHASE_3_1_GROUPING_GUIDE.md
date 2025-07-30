# Phase 3.1 Enhanced - Task Grouping Testing Guide

## Overview
This guide covers testing the enhanced duplicate detection feature that now includes automatic task grouping functionality.

## Setup Instructions

### 1. Apply Database Migrations

First, you need to run the migrations to create the new tables. Go to your Supabase dashboard:

1. Navigate to the SQL Editor
2. Create a new query
3. Copy and paste the contents of `/supabase/migrations/20240130_create_task_groups.sql`
4. Run the query
5. **Important**: After running the first migration, also run `/supabase/migrations/20240130_fix_task_groups_rls.sql` to fix the RLS policies

### 2. Update TypeScript Types

After running the migration, regenerate your Supabase types:

```bash
npx supabase gen types typescript --project-id [your-project-id] > src/types/supabase.ts
```

### 3. Start the Development Server

```bash
npm run dev
```

## Testing Scenarios

### 🧪 Test 1: Basic Grouping Flow

**Setup**: Create these baseline tasks first:
1. "Fix login error when using Google OAuth"
2. "Add user profile editing feature"
3. "Improve dashboard performance for large datasets"

**Test Steps**:
1. Press `Cmd+K` to open Quick-Add Modal
2. Enter: "Fix authentication issue with Google sign-in"
3. Click "Add Task"
4. **Expected**: Duplicate dialog shows with "Fix login error..." as a match
5. Click "Create and Group Together"
6. **Verify**:
   - New task is created
   - Both tasks are now grouped
   - Group is visible in task list (once UI is updated)

### 🧪 Test 2: Selective Grouping

**Test Steps**:
1. Create a task that matches multiple existing tasks
2. Enter: "Add dark mode and user preferences settings"
3. **Expected**: Shows multiple potential duplicates
4. Use checkboxes to select only specific tasks to group
5. Click "Create and Group Together"
6. **Verify**: Only selected tasks are grouped

### 🧪 Test 3: Group Information Display

**When viewing duplicates**:
- Tasks already in a group should show a "Grouped" badge
- The badge should have a Users icon
- Hovering should show group details (when implemented)

### 🧪 Test 4: Multiple Group Conflict

**Setup**: 
1. Create two separate groups of tasks
2. Create a new task that matches tasks from both groups

**Expected Behavior**:
- Dialog shows matches from multiple groups
- Can select tasks from different groups
- System handles merging groups appropriately

## Database Verification

### Check Groups Created

```sql
-- View all task groups
SELECT * FROM task_groups ORDER BY created_at DESC;

-- View tasks with their groups
SELECT t.id, t.description, t.group_id, g.name as group_name
FROM tasks t
LEFT JOIN task_groups g ON t.group_id = g.id
WHERE t.group_id IS NOT NULL;
```

### Check Similarity Scores

```sql
-- View stored similarities
SELECT 
  t1.description as task_1,
  t2.description as task_2,
  ts.similarity_score
FROM task_similarities ts
JOIN tasks t1 ON ts.task_id = t1.id
JOIN tasks t2 ON ts.similar_task_id = t2.id
ORDER BY ts.similarity_score DESC;
```

## Current Implementation Status

### ✅ Completed
- Database schema for groups and similarities
- Task grouping service library
- Enhanced duplicate dialog with grouping option
- Task creation flow with grouping support

### 🚧 Pending
- Task list UI to show grouped tasks
- Group management (rename, ungroup)
- Visual indicators for grouped tasks
- Expand/collapse groups in task list

## Troubleshooting

### "Create and Group" button not working
1. Check browser console for errors
2. Verify both migrations were run successfully (including the RLS fix)
3. Check that task_groups table exists in Supabase
4. If you see "row-level security policy" error, run the second migration

### Tasks not showing as grouped
1. The UI component for displaying groups is still pending
2. Use SQL queries above to verify groups are created in database
3. Check task's group_id field is populated

### Similarity scores not stored
1. This is non-critical - grouping still works
2. Check task_similarities table permissions
3. Verify RLS policies are correctly set

## Next Steps

After testing the grouping creation flow:
1. Implement TaskGroup UI component
2. Update task list to display groups
3. Add group management features
4. Test performance with many groups

## Manual Test Checklist

- [ ] Database migration applied successfully
- [ ] Can create tasks without duplicates (normal flow)
- [ ] Duplicate dialog shows "Create and Group Together" button
- [ ] Can select specific tasks to group via checkboxes
- [ ] Tasks are grouped in database (verify with SQL)
- [ ] Similarity scores are stored
- [ ] No console errors during grouping
- [ ] Success toast shows after grouping
- [ ] Can still use "Create Anyway" without grouping
- [ ] Can still view existing task instead