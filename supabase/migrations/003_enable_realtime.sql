-- Enable realtime for task_analyses and tasks tables
-- This allows real-time subscriptions to work properly

-- Drop existing publication if it exists
DROP PUBLICATION IF EXISTS supabase_realtime CASCADE;

-- Create publication for realtime
CREATE PUBLICATION supabase_realtime;

-- Add tables to the publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_analyses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_groups;

-- Grant necessary permissions for realtime
GRANT USAGE ON SCHEMA realtime TO postgres, authenticated, anon, service_role;

-- Enable realtime for specific tables via Supabase's replica identity
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.task_analyses REPLICA IDENTITY FULL;
ALTER TABLE public.task_groups REPLICA IDENTITY FULL;

-- Note: The actual enabling of realtime for these tables needs to be done
-- in the Supabase dashboard under Settings > Database > Replication
-- This migration sets up the necessary database-level configuration