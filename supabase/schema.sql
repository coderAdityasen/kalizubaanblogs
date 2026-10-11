-- ==============================================================================
-- Modern Blog Platform - Supabase Postgres Schema & RLS Setup
-- Run this script inside your Supabase project's SQL Editor (supabase.com/dashboard)
-- ==============================================================================

-- 1. Create the 'posts' table
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content text not null,
  cover_image text,
  category text default 'Engineering',
  tags text[] default '{}'::text[],
  author_name text default 'Aditya',
  author_avatar text,
  reading_time integer default 3,
  published boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Indexes for high performance reads and lookups
create index if not exists idx_posts_slug on public.posts (slug);
create index if not exists idx_posts_published on public.posts (published);
create index if not exists idx_posts_created_at on public.posts (created_at desc);

-- 3. Enable Row Level Security (RLS)
alter table public.posts enable row level security;

-- 4. RLS Policy: Anyone (public) can read published posts
drop policy if exists "Anyone can read published posts" on public.posts;
create policy "Anyone can read published posts"
  on public.posts
  for select
  using (published = true);

-- 5. RLS Policy: Allow service role to perform all operations
-- In Supabase, the service_role key automatically bypasses RLS,
-- but this policy explicitly grants full permissions for server operations.
drop policy if exists "Service role full access" on public.posts;
create policy "Service role full access"
  on public.posts
  for all
  using (true)
  with check (true);

-- 6. Insert Demo Post (Optional Seed)
insert into public.posts (
  title,
  slug,
  excerpt,
  content,
  category,
  tags,
  author_name,
  author_avatar,
  cover_image,
  reading_time,
  published
) values (
  'Building Scalable AI Agent Systems in 2026: Lessons & Architectures',
  'building-scalable-ai-agent-systems-2026',
  'An in-depth exploration of agent coordination patterns, context distillation, and production resilience strategies for autonomous agents.',
  '## The Evolution of Agentic Engineering

In 2026, AI engineering has shifted radically from prompt engineering to **architectural workflow design**. Multi-agent swarms, verifiable tool calls, and structured context isolation are no longer experimental toys—they form the backbone of next-generation enterprise software.

### Key Pillars of Modern Agent Architecture

1. **Context Boundary Isolation**: Giving every subagent an explicit context scope prevents hallucination cascades.
2. **Deterministic Fallbacks**: Pairing stochastic LLM reasoning with deterministic code validation gates.
3. **Decoupled API Execution**: Allowing asynchronous tasks to run with reactive notification hooks rather than blocking polling loops.

\`\`\`typescript
interface AgentTask<T> {
  id: string;
  scope: ''isolated'' | ''shared'';
  execute: () => Promise<T>;
  verifier: (output: T) => boolean;
}
\`\`\`

> *"Intelligence is only as valuable as the guardrails that harness it."*

### Why Next.js and Supabase Shine for Autonomous Blogging

By combining Next.js App Router for server components with Supabase Postgres for real-time edge storage, we create an ultra-low latency publishing platform. Secure Bearer token authentication guarantees programmatic writes without exposing internal credentials.',
  'Artificial Intelligence',
  array['AI', 'Architecture', 'Autonomous Agents', 'Next.js'],
  'Aditya Sharma',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  5,
  true
)
on conflict (slug) do nothing;
