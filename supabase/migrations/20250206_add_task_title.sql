-- Add optional title field to tasks
-- Safe to run multiple times

ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS title TEXT;

-- Optional: simple btree index for basic filtering (skip trigram to avoid extension requirement)
CREATE INDEX IF NOT EXISTS idx_tasks_title ON public.tasks (title);

