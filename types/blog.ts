export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  category: string;
  tags: string[];
  author_name: string;
  author_avatar?: string;
  reading_time: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * A post without its full Markdown body. Use this for lists and cards so the
 * whole article text isn't serialised into every page that only shows previews.
 */
export type BlogPostSummary = Omit<BlogPost, "content">;

export interface CreatePostInput {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  cover_image?: string;
  category?: string;
  tags?: string[];
  author_name?: string;
  author_avatar?: string;
  reading_time?: number;
  published?: boolean;
}
