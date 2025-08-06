-- Create feedback_notifications table
create table if not exists feedback_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  processed_email_id uuid references processed_emails(id) on delete cascade not null,
  
  -- Notification data
  title text not null,
  summary text not null,
  feedback_type text check (feedback_type in ('bug_report', 'feature_request', 'question', 'complaint', 'praise')),
  suggested_priority integer check (suggested_priority >= 1 and suggested_priority <= 10),
  confidence_score decimal(3,2) check (confidence_score >= 0 and confidence_score <= 1),
  
  -- Status
  status text default 'pending' check (status in ('pending', 'accepted', 'declined')),
  reviewed_at timestamp with time zone,
  
  -- Timestamps
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create indexes
create index if not exists idx_feedback_notifications_user_id on feedback_notifications(user_id);
create index if not exists idx_feedback_notifications_status on feedback_notifications(status);
create index if not exists idx_feedback_notifications_created_at on feedback_notifications(created_at desc);

-- Enable RLS
alter table feedback_notifications enable row level security;

-- RLS policies
create policy "Users can view their own notifications"
  on feedback_notifications for select
  using (user_id = auth.uid());

create policy "Users can update their own notifications"
  on feedback_notifications for update
  using (user_id = auth.uid());

-- Update processed_emails to track notification status
alter table processed_emails 
add column if not exists notification_id uuid references feedback_notifications(id) on delete set null;

-- Add trigger for updated_at
create trigger update_feedback_notifications_updated_at
  before update on feedback_notifications
  for each row
  execute function update_updated_at_column();