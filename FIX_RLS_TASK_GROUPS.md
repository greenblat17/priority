# Quick Fix for Task Groups RLS Error

## The Error
```
Failed to create task group: {
  code: '42501',
  message: 'new row violates row-level security policy for table "task_groups"'
}
```

## Quick Solution

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and run the contents of `/supabase/migrations/20240130_fix_task_groups_rls_v2.sql`

## What This Fixes

The original RLS policies had a problem:
- They required tasks to exist in the group before allowing group creation
- This created a chicken-and-egg problem

The fix:
- Allows any authenticated user to CREATE groups
- Only restricts VIEW/UPDATE/DELETE to groups containing user's tasks
- Uses proper `TO authenticated` syntax

## Verification

After running the migration, test by:
1. Creating a new task with duplicate detection
2. Click "Create and Group Together"
3. Should work without RLS errors

## Alternative: Check Current Policies

Run this query to see current policies:

```sql
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'task_groups'
ORDER BY policyname;
```

## Emergency Workaround (Dev Only)

If you need to test immediately:

```sql
-- TEMPORARY: Disable RLS (DO NOT use in production)
ALTER TABLE public.task_groups DISABLE ROW LEVEL SECURITY;

-- Re-enable after testing
ALTER TABLE public.task_groups ENABLE ROW LEVEL SECURITY;
```

## Still Having Issues?

The problem might be:
1. You're not authenticated properly
2. The migration didn't run completely
3. There's a caching issue in Supabase

Try:
1. Refresh your Supabase dashboard
2. Check the Auth section to ensure your user exists
3. Run the migration again with fresh SQL editor tab