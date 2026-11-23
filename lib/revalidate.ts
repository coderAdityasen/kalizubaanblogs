import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Refresh every cached page a post appears on, right after it is published or
 * edited through the API: the article, home, the whole /blog tree (archives,
 * categories, topic hubs), sitemap, feed, search and start-here, plus the
 * shared post-list data cache (tag "posts").
 */
export function revalidateAfterWrite(slug: string) {
  try {
    revalidateTag("posts", { expire: 0 });
    revalidatePath(`/blog/${slug}`);
    revalidatePath("/");
    revalidatePath("/blog", "layout");
    revalidatePath("/sitemap.xml");
    revalidatePath("/feed.xml");
    revalidatePath("/search");
    revalidatePath("/start-here");
    revalidatePath("/author/aditya-sen");
  } catch (revalidateError) {
    console.error("Failed to revalidate cached pages after a write", revalidateError);
  }
}
