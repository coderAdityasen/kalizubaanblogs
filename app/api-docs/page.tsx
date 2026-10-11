import { Key, ShieldCheck, Terminal, Database, Code, CheckCircle, Copy } from "lucide-react";
import ApiPlayground from "@/components/ApiPlayground";

export const metadata = {
  title: "API Documentation & Playground | Chronicle Blog",
  description: "Learn how to programmatically publish blog posts to Chronicle using REST API with a Secret Key.",
};

const SAMPLE_SQL = `-- Run this in your Supabase SQL Editor:
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

alter table public.posts enable row level security;

create policy "Anyone can read published posts"
  on public.posts for select
  using (published = true);

create policy "Service role full access"
  on public.posts for all
  using (true)
  with check (true);`;

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 mb-4">
            <Key className="w-3.5 h-3.5" />
            Developer API Reference
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
            Publish Blogs Programmatically
          </h1>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
            Publish articles straight from your scripts, GitHub Actions, microservices, or AI agents using our authenticated REST API with a Secret Key.
          </p>
        </div>

        {/* Live Interactive Tester */}
        <div>
          <ApiPlayground />
        </div>

        {/* API Specification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Authentication Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-3">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Authentication</h3>
              </div>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                All requests to <code className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono text-zinc-800 dark:text-zinc-200">POST /api/posts</code> must include your secret API key.
                Two header formats are supported:
              </p>

              <div className="mt-4 space-y-2">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-xs text-zinc-800 dark:text-zinc-200">
                  Authorization: Bearer &lt;YOUR_BLOG_API_SECRET&gt;
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-xs text-zinc-800 dark:text-zinc-200">
                  x-api-key: &lt;YOUR_BLOG_API_SECRET&gt;
                </div>
              </div>
            </div>

            <p className="mt-6 text-[11px] text-zinc-500">
              Configure your secret in <code className="font-mono">.env.local</code> via the <code className="font-mono">BLOG_API_SECRET</code> environment variable.
            </p>
          </div>

          {/* Endpoints Summary */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-3">
                <Code className="w-5 h-5" />
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">API Endpoints</h3>
              </div>

              <div className="space-y-3 mt-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                  <span className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold">
                      POST
                    </span>
                    /api/posts
                  </span>
                  <span className="text-[11px] text-zinc-500">Create / Update Post</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                  <span className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-bold">
                      GET
                    </span>
                    /api/posts
                  </span>
                  <span className="text-[11px] text-zinc-500">List Published Posts</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                  <span className="flex items-center gap-2 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-bold">
                      GET
                    </span>
                    /api/posts/[slug]
                  </span>
                  <span className="text-[11px] text-zinc-500">Fetch Single Post</span>
                </div>
              </div>
            </div>

            <p className="mt-6 text-[11px] text-zinc-500">
              Response format is always structured JSON with status codes 200, 201, 400, 401, or 500.
            </p>
          </div>
        </div>

        {/* JSON Schema Table */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <h3 className="font-bold text-xl text-zinc-900 dark:text-white mb-2">
            JSON Request Body Schema
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500 mb-6">
            Payload properties accepted when sending a <code className="font-mono">POST /api/posts</code> request:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono text-xs">
                  <th className="py-3 px-4">Field</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Required</th>
                  <th className="py-3 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-700 dark:text-zinc-300">
                <tr>
                  <td className="py-3 px-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">title</td>
                  <td className="py-3 px-4 font-mono text-xs text-zinc-500">string</td>
                  <td className="py-3 px-4 font-semibold text-emerald-600">Yes</td>
                  <td className="py-3 px-4">The main title of the article.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">content</td>
                  <td className="py-3 px-4 font-mono text-xs text-zinc-500">string</td>
                  <td className="py-3 px-4 font-semibold text-emerald-600">Yes</td>
                  <td className="py-3 px-4">Full post text in Markdown or HTML. Supports code blocks, lists, quotes.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">slug</td>
                  <td className="py-3 px-4 font-mono text-xs text-zinc-500">string</td>
                  <td className="py-3 px-4 text-zinc-400">Optional</td>
                  <td className="py-3 px-4">Unique URL path segment. Auto-generated from title if omitted.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">excerpt</td>
                  <td className="py-3 px-4 font-mono text-xs text-zinc-500">string</td>
                  <td className="py-3 px-4 text-zinc-400">Optional</td>
                  <td className="py-3 px-4">Short summary for post cards. Extracted automatically if omitted.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">category</td>
                  <td className="py-3 px-4 font-mono text-xs text-zinc-500">string</td>
                  <td className="py-3 px-4 text-zinc-400">Optional</td>
                  <td className="py-3 px-4">Category tag, e.g. &quot;Engineering&quot;, &quot;AI&quot;, &quot;Database&quot;. Defaults to &quot;General&quot;.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">tags</td>
                  <td className="py-3 px-4 font-mono text-xs text-zinc-500">string[]</td>
                  <td className="py-3 px-4 text-zinc-400">Optional</td>
                  <td className="py-3 px-4">Array of topic tags for search filtering, e.g. [&quot;Next.js&quot;, &quot;Supabase&quot;].</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">author_name</td>
                  <td className="py-3 px-4 font-mono text-xs text-zinc-500">string</td>
                  <td className="py-3 px-4 text-zinc-400">Optional</td>
                  <td className="py-3 px-4">Display name of the author. Defaults to &quot;Aditya&quot; or &quot;API Author&quot;.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">author_avatar</td>
                  <td className="py-3 px-4 font-mono text-xs text-zinc-500">string (URL)</td>
                  <td className="py-3 px-4 text-zinc-400">Optional</td>
                  <td className="py-3 px-4">URL to author avatar picture.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">cover_image</td>
                  <td className="py-3 px-4 font-mono text-xs text-zinc-500">string (URL)</td>
                  <td className="py-3 px-4 text-zinc-400">Optional</td>
                  <td className="py-3 px-4">Hero banner image for the post.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">reading_time</td>
                  <td className="py-3 px-4 font-mono text-xs text-zinc-500">number</td>
                  <td className="py-3 px-4 text-zinc-400">Optional</td>
                  <td className="py-3 px-4">Estimated reading time in minutes (calculated automatically if omitted).</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">published</td>
                  <td className="py-3 px-4 font-mono text-xs text-zinc-500">boolean</td>
                  <td className="py-3 px-4 text-zinc-400">Optional</td>
                  <td className="py-3 px-4">Set to <code className="font-mono">true</code> to publish immediately (default: <code className="font-mono">true</code>).</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Supabase Setup Guide */}
        <div id="supabase-setup" className="scroll-mt-20 p-6 sm:p-8 rounded-3xl bg-zinc-900 text-white border border-zinc-800 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-xl">Supabase Database Setup</h3>
              <p className="text-xs sm:text-sm text-zinc-400">
                Connect your real Supabase Postgres database in under 2 minutes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-800/60 border border-zinc-700/60">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold inline-flex items-center justify-center mb-2">1</span>
              <h4 className="font-semibold text-sm">Create Supabase Project</h4>
              <p className="text-xs text-zinc-400 mt-1">
                Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">supabase.com</a> and create a free project.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-800/60 border border-zinc-700/60">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold inline-flex items-center justify-center mb-2">2</span>
              <h4 className="font-semibold text-sm">Run SQL Schema</h4>
              <p className="text-xs text-zinc-400 mt-1">
                Open <strong>SQL Editor</strong> in Supabase and run the schema query below to create the table, indexes, and RLS policies.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-800/60 border border-zinc-700/60">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold inline-flex items-center justify-center mb-2">3</span>
              <h4 className="font-semibold text-sm">Add Environment Variables</h4>
              <p className="text-xs text-zinc-400 mt-1">
                Add <code className="font-mono text-xs text-indigo-300">NEXT_PUBLIC_SUPABASE_URL</code> &amp; <code className="font-mono text-xs text-indigo-300">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code className="font-mono text-xs">.env.local</code>.
              </p>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950">
            <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <span>supabase/schema.sql</span>
            </div>
            <pre className="p-4 text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed">
              {SAMPLE_SQL}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
