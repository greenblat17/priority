-- Migration: Update legacy task statuses to new Linear-style statuses
-- Old statuses: pending, completed, blocked, in_progress
-- New statuses: backlog, todo, in_progress, done, canceled, duplicate
--
-- To apply this migration:
-- 1. Using Supabase Dashboard: Go to SQL Editor and run this script
-- 2. Using CLI: npx supabase db push (after linking your project)
-- 3. Direct connection: psql $DATABASE_URL < 20250204_migrate_task_statuses.sql

BEGIN;

-- First, drop the existing constraint that's blocking our updates
ALTER TABLE tasks 
DROP CONSTRAINT IF EXISTS tasks_status_check;

-- Now update task statuses
UPDATE tasks 
SET status = 'todo',
    updated_at = NOW()
WHERE status = 'pending';

UPDATE tasks 
SET status = 'done',
    updated_at = NOW()
WHERE status = 'completed';

UPDATE tasks 
SET status = 'canceled',
    updated_at = NOW()
WHERE status = 'blocked';

-- in_progress remains the same, no update needed

-- Add the new constraint with Linear-style statuses
ALTER TABLE tasks 
ADD CONSTRAINT tasks_status_check 
CHECK (status IN ('backlog', 'todo', 'in_progress', 'done', 'canceled', 'duplicate'));

-- Create an index on status for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Update any task analysis records that reference old statuses in duplicate_of field
-- This ensures consistency across the system
UPDATE task_analyses
SET duplicate_of = NULL
WHERE duplicate_of IN (
    SELECT id FROM tasks WHERE status IN ('pending', 'completed', 'blocked')
);

COMMIT;

-- Add comment to document the status values
COMMENT ON COLUMN tasks.status IS 'Task status using Linear-style values: backlog, todo, in_progress, done, canceled, duplicate';