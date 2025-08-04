-- Enable RLS on all pages tables
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_task_links ENABLE ROW LEVEL SECURITY;

-- Pages policies
CREATE POLICY "Users can create their own pages" 
ON public.pages
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own pages" 
ON public.pages
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own pages" 
ON public.pages
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pages" 
ON public.pages
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Page versions policies
CREATE POLICY "Users can create versions for their pages" 
ON public.page_versions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pages 
    WHERE pages.id = page_versions.page_id 
    AND pages.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view versions of their pages" 
ON public.page_versions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pages 
    WHERE pages.id = page_versions.page_id 
    AND pages.user_id = auth.uid()
  )
);

-- Page tags policies
CREATE POLICY "Users can create tags for their pages" 
ON public.page_tags
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pages 
    WHERE pages.id = page_tags.page_id 
    AND pages.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view tags of their pages" 
ON public.page_tags
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pages 
    WHERE pages.id = page_tags.page_id 
    AND pages.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete tags from their pages" 
ON public.page_tags
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pages 
    WHERE pages.id = page_tags.page_id 
    AND pages.user_id = auth.uid()
  )
);

-- Page-task links policies
CREATE POLICY "Users can link pages to their tasks" 
ON public.page_task_links
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.pages 
    WHERE pages.id = page_task_links.page_id 
    AND pages.user_id = auth.uid()
  ) AND EXISTS (
    SELECT 1 FROM public.tasks 
    WHERE tasks.id = page_task_links.task_id 
    AND tasks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their page-task links" 
ON public.page_task_links
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pages 
    WHERE pages.id = page_task_links.page_id 
    AND pages.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their page-task links" 
ON public.page_task_links
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pages 
    WHERE pages.id = page_task_links.page_id 
    AND pages.user_id = auth.uid()
  )
);