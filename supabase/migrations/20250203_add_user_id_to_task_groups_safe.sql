-- Safe migration to add user_id column to task_groups table
-- This version handles orphaned groups by assigning them to the first user

-- Add the user_id column if it doesn't exist
ALTER TABLE public.task_groups 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- First, update groups that have associated tasks
UPDATE public.task_groups tg
SET user_id = (
  SELECT t.user_id 
  FROM public.tasks t 
  WHERE t.group_id = tg.id 
  LIMIT 1
)
WHERE tg.user_id IS NULL
  AND EXISTS (SELECT 1 FROM public.tasks t WHERE t.group_id = tg.id);

-- For groups without tasks, assign them to the first available user
-- (or you can choose to delete them instead)
UPDATE public.task_groups tg
SET user_id = (
  SELECT id FROM auth.users LIMIT 1
)
WHERE tg.user_id IS NULL;

-- If there are still NULL user_ids (no users in the system), we need to handle that
-- Option 1: Delete orphaned groups
-- DELETE FROM public.task_groups WHERE user_id IS NULL;

-- Option 2: Create a dummy user_id (not recommended for production)
-- UPDATE public.task_groups SET user_id = '00000000-0000-0000-0000-000000000000' WHERE user_id IS NULL;

-- Check if we can safely add the NOT NULL constraint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.task_groups WHERE user_id IS NULL) THEN
    ALTER TABLE public.task_groups ALTER COLUMN user_id SET NOT NULL;
  ELSE
    RAISE NOTICE 'Cannot add NOT NULL constraint: there are still NULL user_ids in task_groups';
  END IF;
END $$;

-- Create an index for performance
CREATE INDEX IF NOT EXISTS idx_task_groups_user_id ON public.task_groups(user_id);

-- Update RLS policies to use the user_id column directly
DROP POLICY IF EXISTS "Authenticated users can create task groups" ON public.task_groups;
DROP POLICY IF EXISTS "Users can view their task groups" ON public.task_groups;
DROP POLICY IF EXISTS "Users can update their task groups" ON public.task_groups;
DROP POLICY IF EXISTS "Users can delete their task groups" ON public.task_groups;

-- Create simpler RLS policies using the user_id column
CREATE POLICY "Users can create their own task groups" 
ON public.task_groups
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own task groups" 
ON public.task_groups
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own task groups" 
ON public.task_groups
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own task groups" 
ON public.task_groups
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Ensure RLS is enabled
ALTER TABLE public.task_groups ENABLE ROW LEVEL SECURITY;