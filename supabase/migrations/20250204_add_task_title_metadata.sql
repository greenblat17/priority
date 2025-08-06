-- Add title and metadata columns to tasks table
alter table tasks 
add column if not exists title text,
add column if not exists metadata jsonb;