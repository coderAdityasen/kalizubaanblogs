"use client";

import { useState, useMemo } from "react";
import { Search, Filter, Sparkles, BookOpen } from "lucide-react";
import { BlogPostSummary } from "@/types/blog";
import PostCard from "./PostCard";

interface BlogListProps {
  initialPosts: BlogPostSummary[];
}

export default function BlogList({ initialPosts }: BlogListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    initialPosts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["All", ...Array.from(set)];
  }, [initialPosts]);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      const matchesCategory =
        selectedCategory === "All" ||
        post.category.toLowerCase() === selectedCategory.toLowerCase();

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some((t) => t.toLowerCase().includes(query)) ||
        post.author_name.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [initialPosts, selectedCategory, searchQuery]);

  const featuredPost = filteredPosts[0];
  const regularPosts = filteredPosts.slice(1);

  return (
    <div className="space-y-10">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2 bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search articles by title, tag, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-zinc-800 rounded-xl border border-transparent dark:border-zinc-700/60 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>

        {/* Categories Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 px-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* When no posts match search */}
      {filteredPosts.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/30">
          <BookOpen className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No articles found</h3>
          <p className="text-sm text-zinc-500 max-w-sm mx-auto mt-1">
            No posts matched &quot;{searchQuery}&quot;. Try adjusting your search or category filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          {/* Featured Post (only when not searching or in 'All' category) */}
          {featuredPost && (
            <div className="mb-12">
              <PostCard post={featuredPost} featured={true} />
            </div>
          )}

          {/* Grid of Remaining Posts */}
          {regularPosts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  Latest Articles
                </h3>
                <span className="text-xs font-medium text-zinc-400">
                  Showing {filteredPosts.length} {filteredPosts.length === 1 ? "post" : "posts"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularPosts.map((post) => (
                  <PostCard key={post.id || post.slug} post={post} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
