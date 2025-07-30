-- Create task_groups table for managing grouped similar tasks
CREATE TABLE IF NOT EXISTS public.task_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add group reference to tasks table
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.task_groups(id) ON DELETE SET NULL;

-- Create index for faster group queries
CREATE INDEX IF NOT EXISTS idx_tasks_group_id ON public.tasks(group_id);

-- Create task_similarities table to track similarity relationships
CREATE TABLE IF NOT EXISTS public.task_similarities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  similar_task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  similarity_score FLOAT NOT NULL CHECK (similarity_score >= 0 AND similarity_score <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(task_id, similar_task_id),
  CHECK (task_id != similar_task_id)
);

-- Create indexes for similarity queries
CREATE INDEX IF NOT EXISTS idx_task_similarities_task_id ON public.task_similarities(task_id);
CREATE INDEX IF NOT EXISTS idx_task_similarities_similar_task_id ON public.task_similarities(similar_task_id);

-- Enable RLS
ALTER TABLE public.task_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_similarities ENABLE ROW LEVEL SECURITY;

-- RLS policies for task_groups
CREATE POLICY "Users can view their own task groups" ON public.task_groups
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.group_id = task_groups.id 
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create task groups" ON public.task_groups
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own task groups" ON public.task_groups
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.group_id = task_groups.id 
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own task groups" ON public.task_groups
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE tasks.group_id = task_groups.id 
      AND tasks.user_id = auth.uid()
    )
  );

-- RLS policies for task_similarities
CREATE POLICY "Users can view similarities for their tasks" ON public.task_similarities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE (tasks.id = task_similarities.task_id OR tasks.id = task_similarities.similar_task_id)
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create similarities for their tasks" ON public.task_similarities
  FOR INSERT
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

CREATE POLICY "Users can delete similarities for their tasks" ON public.task_similarities
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE (tasks.id = task_similarities.task_id OR tasks.id = task_similarities.similar_task_id)
      AND tasks.user_id = auth.uid()
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for task_groups updated_at
CREATE TRIGGER handle_task_groups_updated_at
  BEFORE UPDATE ON public.task_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();