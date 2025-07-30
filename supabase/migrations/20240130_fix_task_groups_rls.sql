-- Fix RLS policies for task_groups table
-- This migration fixes the circular dependency issue in the original policies

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create task groups" ON public.task_groups;
DROP POLICY IF EXISTS "Users can view their own task groups" ON public.task_groups;
DROP POLICY IF EXISTS "Users can update their own task groups" ON public.task_groups;
DROP POLICY IF EXISTS "Users can delete their own task groups" ON public.task_groups;

-- Recreate with fixed logic
-- Allow authenticated users to create groups
CREATE POLICY "Users can create task groups" ON public.task_groups
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to view groups that contain their tasks
CREATE POLICY "Users can view their own task groups" ON public.task_groups
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT tasks.user_id 
      FROM public.tasks 
      WHERE tasks.group_id = task_groups.id
    )
  );

-- Allow users to update groups that contain their tasks
CREATE POLICY "Users can update their own task groups" ON public.task_groups
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT tasks.user_id 
      FROM public.tasks 
      WHERE tasks.group_id = task_groups.id
    )
  );

-- Allow users to delete groups that contain their tasks
CREATE POLICY "Users can delete their own task groups" ON public.task_groups
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT tasks.user_id 
      FROM public.tasks 
      WHERE tasks.group_id = task_groups.id
    )
  );