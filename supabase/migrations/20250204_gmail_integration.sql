-- Create gmail_integrations table
create table if not exists gmail_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  access_token text,
  refresh_token text,
  token_expiry timestamp with time zone,
  email_address text not null,
  is_active boolean default true,
  last_sync_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create processed_emails table
create table if not exists processed_emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  gmail_message_id text unique not null,
  gmail_thread_id text,
  from_email text not null,
  from_name text,
  subject text not null,
  content text not null,
  received_at timestamp with time zone not null,
  is_feedback boolean default false,
  feedback_type text check (feedback_type in ('bug_report', 'feature_request', 'question', 'complaint', 'praise')),
  confidence_score decimal(3,2) check (confidence_score >= 0 and confidence_score <= 1),
  ai_summary text,
  processed_at timestamp with time zone default now(),
  task_id uuid references tasks(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- Add email source columns to tasks table
alter table tasks 
add column if not exists source_type text default 'manual' check (source_type in ('manual', 'gmail', 'feedback')),
add column if not exists original_email_id uuid references processed_emails(id) on delete set null;

-- Create indexes
create index if not exists idx_gmail_integrations_user_id on gmail_integrations(user_id);
create index if not exists idx_gmail_integrations_is_active on gmail_integrations(is_active);
create index if not exists idx_processed_emails_user_id on processed_emails(user_id);
create index if not exists idx_processed_emails_gmail_message_id on processed_emails(gmail_message_id);
create index if not exists idx_processed_emails_is_feedback on processed_emails(is_feedback);
create index if not exists idx_processed_emails_task_id on processed_emails(task_id);
create index if not exists idx_tasks_source_type on tasks(source_type);
create index if not exists idx_tasks_original_email_id on tasks(original_email_id);

-- Add RLS policies
alter table gmail_integrations enable row level security;
alter table processed_emails enable row level security;

-- Gmail integrations policies
drop policy if exists "Users can view their own Gmail integrations" on gmail_integrations;
create policy "Users can view their own Gmail integrations"
  on gmail_integrations for select
  using (user_id = auth.uid());

drop policy if exists "Users can create their own Gmail integrations" on gmail_integrations;
create policy "Users can create their own Gmail integrations"
  on gmail_integrations for insert
  with check (user_id = auth.uid());

drop policy if exists "Users can update their own Gmail integrations" on gmail_integrations;
create policy "Users can update their own Gmail integrations"
  on gmail_integrations for update
  using (user_id = auth.uid());

drop policy if exists "Users can delete their own Gmail integrations" on gmail_integrations;
create policy "Users can delete their own Gmail integrations"
  on gmail_integrations for delete
  using (user_id = auth.uid());

-- Processed emails policies
drop policy if exists "Users can view their own processed emails" on processed_emails;
create policy "Users can view their own processed emails"
  on processed_emails for select
  using (user_id = auth.uid());

drop policy if exists "Users can create their own processed emails" on processed_emails;
create policy "Users can create their own processed emails"
  on processed_emails for insert
  with check (user_id = auth.uid());

drop policy if exists "Users can update their own processed emails" on processed_emails;
create policy "Users can update their own processed emails"
  on processed_emails for update
  using (user_id = auth.uid());

drop policy if exists "Users can delete their own processed emails" on processed_emails;
create policy "Users can delete their own processed emails"
  on processed_emails for delete
  using (user_id = auth.uid());

-- Add updated_at trigger for gmail_integrations
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_gmail_integrations_updated_at on gmail_integrations;
create trigger update_gmail_integrations_updated_at
  before update on gmail_integrations
  for each row
  execute function update_updated_at_column();