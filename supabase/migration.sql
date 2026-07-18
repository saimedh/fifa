-- ── Stadium Copilot — Supabase Schema Migration ──────────────────────────────
-- Run this once in the Supabase SQL Editor (dashboard → SQL Editor → New query).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Profiles (extends auth.users) ─────────────────────────────────────────
create table if not exists public.profiles (
  id                 uuid references auth.users on delete cascade primary key,
  username           text,
  favorite_team      text,
  favorite_player_id text,
  language           text default 'en',
  created_at         timestamptz default now()
);

-- ── 2. Chat history ───────────────────────────────────────────────────────────
create table if not exists public.chat_history (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references auth.users on delete cascade not null,
  role       text check (role in ('user', 'assistant')) not null,
  content    text not null,
  created_at timestamptz default now()
);

-- ── 3. Accessibility requests ─────────────────────────────────────────────────
create table if not exists public.accessibility_requests (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references auth.users on delete cascade,
  request_type text not null,
  description  text,
  location     text,
  status       text default 'pending'
                    check (status in ('pending', 'in_progress', 'resolved')),
  created_at   timestamptz default now()
);

-- ── 4. Row-Level Security ─────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.chat_history enable row level security;
alter table public.accessibility_requests enable row level security;

-- Profiles: users can only read/write their own row
create policy "profiles_own"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Chat history: users own their messages
create policy "chat_history_own"
  on public.chat_history for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Accessibility requests: users own theirs; null user_id rows are public inserts
create policy "a11y_requests_own"
  on public.accessibility_requests for all
  using (auth.uid() = user_id or user_id is null)
  with check (auth.uid() = user_id or user_id is null);

-- ── 5. Indexes ────────────────────────────────────────────────────────────────
create index if not exists idx_chat_user_id on public.chat_history (user_id, created_at desc);
create index if not exists idx_a11y_user_id on public.accessibility_requests (user_id, created_at desc);
