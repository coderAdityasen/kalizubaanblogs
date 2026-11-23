import type { BlogPostSummary } from "@/types/blog";
import PostCard from "@/components/blog/PostCard";
import SectionHeader from "@/components/blog/SectionHeader";

/**
 * "Keep reading" block shown at the end of an article. Gives readers a next
 * step and gives search engines crawlable links between articles.
 */
export default function RelatedPosts({ posts }: { posts: BlogPostSummary[] }) {
  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="related-heading" className="mt-4 pt-6">
      <SectionHeader id="related-heading" title="Keep reading" />
      <ul className="mt-6 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <li key={post.slug}>
            <PostCard post={post} variant="standard" />
          </li>
        ))}
      </ul>
    </section>
  );
}
