-- Fix RLS policies for task_groups table (Version 2)
-- This version ensures proper authentication handling

-- First, drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can create task groups" ON public.task_groups;
DROP POLICY IF EXISTS "Users can view their own task groups" ON public.task_groups;
DROP POLICY IF EXISTS "Users can update their own task groups" ON public.task_groups;
DROP POLICY IF EXISTS "Users can delete their own task groups" ON public.task_groups;
DROP POLICY IF EXISTS "Authenticated users can create task groups" ON public.task_groups;
DROP POLICY IF EXISTS "Users can view their task groups" ON public.task_groups;
DROP POLICY IF EXISTS "Users can update their task groups" ON public.task_groups;
DROP POLICY IF EXISTS "Users can delete their task groups" ON public.task_groups;

-- Create new working policies with proper authentication
-- 1. Allow any authenticated user to create groups
CREATE POLICY "Authenticated users can create task groups" 
ON public.task_groups
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 2. Allow users to view groups containing their tasks
CREATE POLICY "Users can view their task groups" 
ON public.task_groups
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.group_id = task_groups.id 
    AND tasks.user_id = auth.uid()
  )
);

-- 3. Allow users to update their groups
CREATE POLICY "Users can update their task groups" 
ON public.task_groups
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.group_id = task_groups.id 
    AND tasks.user_id = auth.uid()
  )
);

-- 4. Allow users to delete their groups
CREATE POLICY "Users can delete their task groups" 
ON public.task_groups
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.group_id = task_groups.id 
    AND tasks.user_id = auth.uid()
  )
);

-- Verify RLS is enabled
ALTER TABLE public.task_groups ENABLE ROW LEVEL SECURITY;

-- Also ensure task_similarities policies are correct
DROP POLICY IF EXISTS "Users can view similarities for their tasks" ON public.task_similarities;
DROP POLICY IF EXISTS "Users can create similarities for their tasks" ON public.task_similarities;
DROP POLICY IF EXISTS "Users can delete similarities for their tasks" ON public.task_similarities;

-- Recreate task_similarities policies
CREATE POLICY "Users can view similarities for their tasks" 
ON public.task_similarities
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE (tasks.id = task_similarities.task_id OR tasks.id = task_similarities.similar_task_id)
    AND tasks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create similarities for their tasks" 
ON public.task_similarities
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = task_similarities.task_id 
    AND tasks.user_id = auth.uid()
  )
  AND
  EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = task_similarities.similar_task_id 
    AND tasks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete similarities for their tasks" 
ON public.task_similarities
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE (tasks.id = task_similarities.task_id OR tasks.id = task_similarities.similar_task_id)
    AND tasks.user_id = auth.uid()
  )
);