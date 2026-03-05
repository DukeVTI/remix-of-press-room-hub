-- Migration script to create the notifications table

create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null, -- 'like', 'comment', 'follow', 'mention', 'system'
  title text not null,
  message text not null,
  link_url text, -- optional link to the content
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS (Row Level Security)
alter table public.notifications enable row level security;

-- Policies
create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update their own notifications (e.g., mark as read)"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "System can insert notifications"
  on public.notifications for insert
  with check (true); -- In a real app, you might restrict this to service role or functions, but for simplicity allowing insert usually works for triggers.

-- Optional: Create an index for faster lookups by user and read status
create index idx_notifications_user_read on public.notifications (user_id, is_read);
