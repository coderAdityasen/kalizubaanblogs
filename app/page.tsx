import { getPosts, checkSupabaseStatus } from "@/lib/supabase";
import BlogList from "@/components/BlogList";
import AdminSetupBanner from "@/components/AdminSetupBanner";
import Newsletter from "@/components/Newsletter";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [posts, supabaseStatus] = await Promise.all([
    getPosts(),
    checkSupabaseStatus(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/50 dark:bg-zinc-950">
      {/* Discreet Admin Setup Alert if table is missing */}
      <AdminSetupBanner status={supabaseStatus} />

      {/* Editorial Header */}
      <section className="border-b border-zinc-200/70 dark:border-zinc-800/70 bg-white dark:bg-zinc-900/40 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400 mb-2 block">
              The Digital Journal
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-zinc-900 dark:text-white leading-[1.15]">
              Perspectives on Technology, Architecture &amp; Craft.
            </h1>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
              A curated publication covering distributed systems, autonomous agents, modern engineering, and software design.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main id="latest" className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 w-full flex-1">
        <BlogList initialPosts={posts} />

        {/* Reader Newsletter Subscription */}
        <Newsletter />
      </main>
    </div>
  );
}
