create table if not exists public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin','super_admin')),
  created_at timestamptz not null default now()
);

alter table public.platform_admins enable row level security;

revoke all on public.platform_admins from anon, authenticated;
