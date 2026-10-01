create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text,
  inputs jsonb,
  created_at timestamptz not null default now()
);

-- RLS on with no policies: only the service key (used by /api/lead) can write or read.
alter table public.leads enable row level security;
