-- Migration: make posts.updated_at reliable for "Last updated" and dateModified.
-- Date: 2026-10-28
--
-- OPTIONAL and safe to re-run. The production table created from schema.sql
-- already has updated_at, and PATCH /api/posts/[slug] sets it itself, so the
-- site works without this. What it adds:
--   1. the column, if an older table is missing it;
--   2. a trigger so updated_at also moves when a post is edited directly in the
--      Supabase dashboard (otherwise "Last updated" would go stale);
--   3. an index for "recently updated" queries.
-- Run it once in Supabase -> SQL Editor. It does not change any post content.

alter table public.posts
  add column if not exists updated_at timestamp with time zone
  default timezone('utc'::text, now()) not null;

create or replace function public.set_posts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row
  execute function public.set_posts_updated_at();

create index if not exists idx_posts_updated_at on public.posts (updated_at desc);
