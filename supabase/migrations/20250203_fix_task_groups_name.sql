-- Fix task_groups table to ensure name is not null
-- This migration ensures the name column has a NOT NULL constraint with a default value

-- First, update any existing NULL names to a default value
UPDATE public.task_groups 
SET name = 'Unnamed Group' 
WHERE name IS NULL;

-- Now add the NOT NULL constraint with a default
ALTER TABLE public.task_groups 
ALTER COLUMN name SET NOT NULL,
ALTER COLUMN name SET DEFAULT 'Similar Tasks';

-- Also add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_task_groups_updated_at ON public.task_groups;
CREATE TRIGGER update_task_groups_updated_at
  BEFORE UPDATE ON public.task_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();