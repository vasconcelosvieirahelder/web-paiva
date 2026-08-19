create table if not exists public.suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  message text not null check (char_length(message) between 1 and 200),
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  created_at timestamptz not null default now()
);

create index if not exists suggestions_created_at_idx on public.suggestions (created_at desc);
create index if not exists suggestions_user_created_at_idx on public.suggestions (user_id, created_at desc);

alter table public.suggestions enable row level security;

create policy "Users can create their own suggestions"
on public.suggestions
for insert
with check (user_id = auth.uid());

create policy "Users can read their own suggestions and admins can read all"
on public.suggestions
for select
using (user_id = auth.uid() or public.is_admin());

create policy "Admins can update suggestions"
on public.suggestions
for update
using (public.is_admin())
with check (public.is_admin());
