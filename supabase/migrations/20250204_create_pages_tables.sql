-- Create pages table for knowledge management
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  content TEXT,
  content_type VARCHAR(50) DEFAULT 'markdown',
  is_published BOOLEAN DEFAULT true,
  is_template BOOLEAN DEFAULT false,
  template_type VARCHAR(50),
  meta_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_user_slug UNIQUE(user_id, slug)
);

-- Create page versions for history tracking
CREATE TABLE IF NOT EXISTS public.page_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  version_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_page_version UNIQUE(page_id, version_number)
);

-- Create page tags for organization
CREATE TABLE IF NOT EXISTS public.page_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE NOT NULL,
  tag_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_page_tag UNIQUE(page_id, tag_name)
);

-- Create page-task relationships
CREATE TABLE IF NOT EXISTS public.page_task_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_page_task UNIQUE(page_id, task_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pages_user_id ON public.pages(user_id);
CREATE INDEX IF NOT EXISTS idx_pages_parent_id ON public.pages(parent_id);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON public.pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_created_at ON public.pages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_versions_page_id ON public.page_versions(page_id);
CREATE INDEX IF NOT EXISTS idx_page_tags_page_id ON public.page_tags(page_id);
CREATE INDEX IF NOT EXISTS idx_page_tags_tag_name ON public.page_tags(tag_name);
CREATE INDEX IF NOT EXISTS idx_page_task_links_page_id ON public.page_task_links(page_id);
CREATE INDEX IF NOT EXISTS idx_page_task_links_task_id ON public.page_task_links(task_id);

-- Add full-text search
ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_pages_search ON public.pages USING gin(search_vector);

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_page_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update search vector
DROP TRIGGER IF EXISTS update_pages_search_vector ON public.pages;
CREATE TRIGGER update_pages_search_vector
  BEFORE INSERT OR UPDATE ON public.pages
  FOR EACH ROW
  EXECUTE FUNCTION update_page_search_vector();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS update_pages_updated_at ON public.pages;
CREATE TRIGGER update_pages_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();