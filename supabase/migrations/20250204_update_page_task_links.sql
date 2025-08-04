-- Add user_id to page_task_links table for better RLS
ALTER TABLE public.page_task_links 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update existing records to set user_id from pages table
UPDATE public.page_task_links ptl
SET user_id = p.user_id
FROM public.pages p
WHERE ptl.page_id = p.id
AND ptl.user_id IS NULL;

-- Make user_id NOT NULL after backfilling
ALTER TABLE public.page_task_links 
ALTER COLUMN user_id SET NOT NULL;

-- Create index on user_id for performance
CREATE INDEX IF NOT EXISTS idx_page_task_links_user_id ON public.page_task_links(user_id);

-- Update RLS policies for page_task_links
DROP POLICY IF EXISTS "Users can view their own page task links" ON public.page_task_links;
DROP POLICY IF EXISTS "Users can create their own page task links" ON public.page_task_links;
DROP POLICY IF EXISTS "Users can delete their own page task links" ON public.page_task_links;

CREATE POLICY "Users can view their own page task links" ON public.page_task_links
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own page task links" ON public.page_task_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own page task links" ON public.page_task_links
  FOR DELETE USING (auth.uid() = user_id);