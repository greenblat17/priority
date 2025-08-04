-- Add user_id column to task_groups table
-- This is needed for proper RLS policies and to track group ownership

-- Add the user_id column
ALTER TABLE public.task_groups 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing groups to have a user_id based on their tasks
UPDATE public.task_groups tg
SET user_id = (
  SELECT t.user_id 
  FROM public.tasks t 
  WHERE t.group_id = tg.id 
  LIMIT 1
)
WHERE tg.user_id IS NULL;

-- Delete any groups that still don't have a user_id (orphaned groups)
DELETE FROM public.task_groups 
WHERE user_id IS NULL;

-- Now make user_id NOT NULL for future inserts
ALTER TABLE public.task_groups 
ALTER COLUMN user_id SET NOT NULL;

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