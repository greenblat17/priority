-- Fix Row Level Security for task_analyses table
-- This migration adds an INSERT policy to allow users to create analyses for their own tasks

-- Add INSERT policy for task_analyses
CREATE POLICY "Users can insert analyses for own tasks" ON public.task_analyses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tasks
      WHERE tasks.id = task_analyses.task_id
      AND tasks.user_id = auth.uid()
    )
  );

-- Note: The existing SELECT policy already allows users to view analyses for their own tasks
-- This completes the RLS setup for the task_analyses table