-- Create users profile table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  source TEXT,
  customer_info TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create task_analyses table
CREATE TABLE public.task_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE UNIQUE NOT NULL,
  category TEXT CHECK (category IN ('bug', 'feature', 'improvement', 'business', 'other')),
  priority INTEGER CHECK (priority >= 1 AND priority <= 10),
  complexity TEXT CHECK (complexity IN ('easy', 'medium', 'hard')),
  estimated_hours DECIMAL(5,2),
  confidence_score INTEGER,
  implementation_spec TEXT,
  duplicate_of UUID REFERENCES public.tasks(id),
  similar_tasks JSONB,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create GTM manifests table
CREATE TABLE public.gtm_manifests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  product_name TEXT,
  product_description TEXT,
  target_audience TEXT,
  value_proposition TEXT,
  current_stage TEXT CHECK (current_stage IN ('idea', 'mvp', 'growth', 'scale')),
  tech_stack JSONB,
  business_model TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_analyses_task_id ON public.task_analyses(task_id);
CREATE INDEX idx_analyses_category ON public.task_analyses(category);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gtm_manifests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR ALL 
  USING (auth.uid() = id);

-- Create RLS policies for tasks
CREATE POLICY "Users can view own tasks" 
  ON public.tasks 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tasks" 
  ON public.tasks 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" 
  ON public.tasks 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" 
  ON public.tasks 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for task_analyses
CREATE POLICY "Users can view own analyses" 
  ON public.task_analyses 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks
      WHERE tasks.id = task_analyses.task_id
      AND tasks.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage analyses" 
  ON public.task_analyses 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Create RLS policies for gtm_manifests
CREATE POLICY "Users can view own manifest" 
  ON public.gtm_manifests 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own manifest" 
  ON public.gtm_manifests 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own manifest" 
  ON public.gtm_manifests 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own manifest" 
  ON public.gtm_manifests 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at triggers for all tables
CREATE TRIGGER handle_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_gtm_manifests_updated_at BEFORE UPDATE ON public.gtm_manifests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();