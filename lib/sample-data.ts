import { BlogPost } from "@/types/blog";

export const SAMPLE_POSTS: BlogPost[] = [
  {
    id: "demo-post-1",
    title: "Building Scalable AI Agent Systems in 2026: Lessons & Architectures",
    slug: "building-scalable-ai-agent-systems-2026",
    excerpt: "An in-depth exploration of agent coordination patterns, context distillation, and production resilience strategies for autonomous agents.",
    category: "Artificial Intelligence",
    tags: ["AI", "Architecture", "Autonomous Agents", "Next.js"],
    author_name: "Aditya Sharma",
    author_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    cover_image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    reading_time: 5,
    published: true,
    created_at: "2026-10-09T10:00:00.000Z",
    updated_at: "2026-10-09T10:00:00.000Z",
    content: `## The Evolution of Agentic Engineering

In 2026, AI engineering has shifted radically from prompt engineering to **architectural workflow design**. Multi-agent swarms, verifiable tool calls, and structured context isolation are no longer experimental toys—they form the backbone of next-generation enterprise software.

### Key Pillars of Modern Agent Architecture

1. **Context Boundary Isolation**: Giving every subagent an explicit context scope prevents hallucination cascades.
2. **Deterministic Fallbacks**: Pairing stochastic LLM reasoning with deterministic code validation gates.
3. **Decoupled API Execution**: Allowing asynchronous tasks to run with reactive notification hooks rather than blocking polling loops.

\`\`\`typescript
interface AgentTask<T> {
  id: string;
  scope: 'isolated' | 'shared';
  execute: () => Promise<T>;
  verifier: (output: T) => boolean;
}
\`\`\`

> *"Intelligence is only as valuable as the guardrails that harness it."*

### Why Next.js and Supabase Shine for Autonomous Blogging

By combining Next.js App Router for server components with Supabase Postgres for real-time edge storage, we create an ultra-low latency publishing platform. Secure Bearer token authentication guarantees programmatic writes without exposing internal credentials.

---

### What's Next?

As autonomous systems continue to expand, our interfaces must adapt to provide transparent verification and seamless human-in-the-loop oversight.`
  },
  {
    id: "demo-post-2",
    title: "The Architecture of Headless Publishing: Why APIs Rule Modern Blogs",
    slug: "architecture-of-headless-publishing-apis",
    excerpt: "Why decoupling content generation from presentation empowers engineering teams, automated pipelines, and seamless syndication.",
    category: "Engineering",
    tags: ["Web Dev", "Supabase", "APIs", "Microservices"],
    author_name: "Elena Rostova",
    author_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
    cover_image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
    reading_time: 4,
    published: true,
    created_at: "2026-10-06T10:00:00.000Z",
    updated_at: "2026-10-06T10:00:00.000Z",
    content: `## Traditional CMS vs. API-Driven Headless Engines

Legacy CMS platforms bundle editing, storage, and rendering into a monolithic system. But modern developers demand flexibility:

* **Write anywhere**: Post from CI/CD bots, Obsidian, scripts, or AI workflows.
* **Store reliably**: Relational Postgres integrity powered by Supabase with Row Level Security.
* **Serve instantaneously**: Fast edge-rendered Next.js with responsive Tailwind CSS.

### Authenticating API Requests

Our blogging engine validates an incoming \`Authorization: Bearer <BLOG_API_SECRET>\` or \`x-api-key\` header against a cryptographically secure environment variable.

\`\`\`bash
curl -X POST http://localhost:3000/api/posts \\
  -H "Authorization: Bearer my-super-secret-key-12345" \\
  -H "Content-Type: application/json" \\
  -d '{"title": "Automated Deployment", "content": "..."}'
\`\`\`

This pattern turns your blog into an open, extensible programmable canvas.`
  },
  {
    id: "demo-post-3",
    title: "Mastering Postgres Row Level Security (RLS) in Production",
    slug: "mastering-postgres-row-level-security-production",
    excerpt: "How to properly lock down your database tables while maintaining high-throughput programmatic access through service roles.",
    category: "Database",
    tags: ["PostgreSQL", "Supabase", "Security", "Backend"],
    author_name: "Marcus Vance",
    author_avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
    cover_image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    reading_time: 3,
    published: true,
    created_at: "2026-10-03T10:00:00.000Z",
    updated_at: "2026-10-03T10:00:00.000Z",
    content: `## Why RLS is Non-Negotiable

Row Level Security allows you to specify declarative policies at the database layer. Even if your client code has bugs or leaks an anon key, your data cannot be altered or read without satisfying the Postgres security policy.

\`\`\`sql
-- Public can only read published posts
CREATE POLICY "Public Read Access"
  ON public.posts FOR SELECT
  USING (published = true);
\`\`\`

With Supabase, the \`service_role\` key bypasses RLS securely on the server-side Next.js API route, letting your API endpoint authenticate incoming callers with custom secret keys!`
  }
];
