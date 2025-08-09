-- Task attachments table and storage policies
-- Requires a Supabase Storage bucket named 'task-attachments'

-- 1) Table
create table if not exists public.task_attachments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  content_type text,
  size_bytes bigint,
  storage_path text not null,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

alter table public.task_attachments enable row level security;

-- Indexes
create index if not exists idx_task_attachments_task_id on public.task_attachments(task_id);
create index if not exists idx_task_attachments_user_id on public.task_attachments(user_id);

-- RLS Policies: users can manage attachments for their own tasks
drop policy if exists "attachments_select_own" on public.task_attachments;
create policy "attachments_select_own" on public.task_attachments
for select using (auth.uid() = user_id);

drop policy if exists "attachments_insert_own_task" on public.task_attachments;
create policy "attachments_insert_own_task" on public.task_attachments
for insert with check (
  user_id = auth.uid() and
  exists (
    select 1 from public.tasks t
    where t.id = task_id and t.user_id = auth.uid()
  )
);

drop policy if exists "attachments_delete_own" on public.task_attachments;
create policy "attachments_delete_own" on public.task_attachments
for delete using (auth.uid() = user_id);

-- 2) Storage object policies (bucket: task-attachments)
-- Note: buckets are created via the dashboard. Ensure a bucket named 'task-attachments' exists.
-- Paths should be namespaced: {user_id}/{task_id}/{uuid}-{filename}

-- Allow authenticated users to upload into their own namespace
drop policy if exists "storage_upload_task_attachments" on storage.objects;
create policy "storage_upload_task_attachments" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'task-attachments' and
  position(auth.uid()::text in name) = 1 -- path starts with user's id
);

-- Allow read access to owners
drop policy if exists "storage_read_task_attachments" on storage.objects;
create policy "storage_read_task_attachments" on storage.objects
for select to authenticated
using (
  bucket_id = 'task-attachments' and
  position(auth.uid()::text in name) = 1
);

-- Allow delete by owners
drop policy if exists "storage_delete_task_attachments" on storage.objects;
create policy "storage_delete_task_attachments" on storage.objects
for delete to authenticated
using (
  bucket_id = 'task-attachments' and
  position(auth.uid()::text in name) = 1
);

