# Fix Row Level Security for Task Analyses

## The Problem
The AI analysis is working correctly (OpenAI returns results), but Supabase is blocking the INSERT operation with error:
```
new row violates row-level security policy for table "task_analyses"
```

## The Solution
Add an INSERT policy to the `task_analyses` table in Supabase.

## Steps to Fix

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (iwpwczyxvetyfqsivths)
3. Go to **SQL Editor** (in the left sidebar)
4. Click **New Query**
5. Copy and paste this SQL:

```sql
-- Add INSERT policy for task_analyses
CREATE POLICY "Users can insert analyses for own tasks" ON public.task_analyses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks
      WHERE tasks.id = task_analyses.task_id
      AND tasks.user_id = auth.uid()
    )
  );
```

6. Click **Run** (or press Cmd+Enter)
7. You should see "Success. No rows returned"

### Option 2: Via Supabase CLI (If you have it installed)

```bash
supabase db push --include-all
```

This will apply the migration file I created at:
`/supabase/migrations/002_fix_task_analyses_rls.sql`

### Option 3: Via Table Editor UI

1. Go to Supabase Dashboard → Table Editor
2. Click on `task_analyses` table
3. Click on the **RLS** button (shield icon)
4. Click **New Policy**
5. Select **For full customization** template
6. Fill in:
   - Policy name: `Users can insert analyses for own tasks`
   - Policy command: `INSERT`
   - Target roles: `authenticated`
   - WITH CHECK expression:
   ```sql
   EXISTS (
     SELECT 1 FROM public.tasks
     WHERE tasks.id = task_analyses.task_id
     AND tasks.user_id = auth.uid()
   )
   ```
7. Click **Review** then **Save policy**

## Verify the Fix

After applying the policy:

1. Go to http://localhost:3000/test-analysis
2. Click "Analyze Pending Tasks"
3. You should see success messages
4. Check http://localhost:3000/api/debug-tasks - analyses should no longer be null

## What This Policy Does

- Allows authenticated users to INSERT analysis records
- Only for tasks they own (security check via EXISTS clause)
- Works alongside the existing SELECT policy
- Maintains security while allowing the API to save results

## Expected Result

After applying this fix, your tasks will show:
```json
{
  "analysis": {
    "category": "bug",
    "priority": 9,
    "complexity": "medium",
    "estimated_hours": 4,
    "confidence_score": 85,
    "has_spec": true
  }
}
```

Instead of `"analysis": null`