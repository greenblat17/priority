-- Performance indexes for hot query paths
-- Tasks composite indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_created_at ON public.tasks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status_created_at ON public.tasks(user_id, status, created_at DESC);

-- Optional full-text search support on tasks.description
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS search_tsv tsvector GENERATED ALWAYS AS (to_tsvector('simple', coalesce(description, ''))) STORED;
CREATE INDEX IF NOT EXISTS idx_tasks_search ON public.tasks USING GIN (search_tsv);

-- Analysis indexes used in list rendering
CREATE INDEX IF NOT EXISTS idx_analyses_priority ON public.task_analyses(priority);
CREATE INDEX IF NOT EXISTS idx_analyses_category ON public.task_analyses(category);
