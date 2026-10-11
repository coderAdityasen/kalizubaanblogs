"use client";

import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp, Database } from "lucide-react";

interface AdminSetupBannerProps {
  status: {
    connected: boolean;
    tableExists: boolean;
    message?: string;
  };
}

const SCHEMA_SQL = `create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  excerpt text,
  content text not null,
  cover_image text,
  category text default 'General',
  tags text[] default '{}'::text[],
  author_name text default 'Aditya',
  author_avatar text,
  reading_time integer default 3,
  published boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_posts_slug on public.posts (slug);
create index if not exists idx_posts_published on public.posts (published);
create index if not exists idx_posts_created_at on public.posts (created_at desc);

alter table public.posts enable row level security;

create policy "Anyone can read published posts"
  on public.posts for select
  using (published = true);

create policy "Service role full access"
  on public.posts for all
  using (true)
  with check (true);`;

export default function AdminSetupBanner({ status }: AdminSetupBannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If table already exists or user dismissed, don't show
  if (status.tableExists || dismissed) {
    return null;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs px-4 py-2.5 transition-all">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-amber-500 shrink-0" />
          
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="underline font-semibold hover:text-amber-700 dark:hover:text-amber-100 flex items-center gap-1"
          >
            {isOpen ? "Hide SQL Script" : "View SQL Script"}
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <span>•</span>
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-700/60 dark:text-amber-400/60 hover:text-amber-900 dark:hover:text-amber-200"
          >
            Dismiss
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="max-w-6xl mx-auto mt-3 p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] text-zinc-400 font-mono">
              Paste into Supabase SQL Editor (supabase.com/dashboard/project/_/sql/new)
            </span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied SQL!" : "Copy SQL"}
            </button>
          </div>
          <pre className="text-[11px] font-mono overflow-x-auto text-amber-300 leading-relaxed max-h-48">
            {SCHEMA_SQL}
          </pre>
        </div>
      )}
    </div>
  );
}
