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
