-- Create page comments table
CREATE TABLE IF NOT EXISTS public.page_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_comment_id UUID REFERENCES public.page_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes
CREATE INDEX idx_page_comments_page_id ON public.page_comments(page_id);
CREATE INDEX idx_page_comments_user_id ON public.page_comments(user_id);
CREATE INDEX idx_page_comments_parent_comment_id ON public.page_comments(parent_comment_id);
CREATE INDEX idx_page_comments_created_at ON public.page_comments(created_at DESC);

-- Enable RLS
ALTER TABLE public.page_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view comments on their pages" ON public.page_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = page_comments.page_id
      AND pages.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create comments on their pages" ON public.page_comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.pages
      WHERE pages.id = page_comments.page_id
      AND pages.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own comments" ON public.page_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.page_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_page_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_page_comments_updated_at_trigger
  BEFORE UPDATE ON public.page_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_page_comments_updated_at();