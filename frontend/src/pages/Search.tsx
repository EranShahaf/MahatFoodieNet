import {
  Search as SearchIcon,
  X,
  TrendingUp,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useRef, useEffect } from "react";
import FeedCard from "@/components/FeedCard";
import { useFeed } from "@/hooks/useFeed";
import type { FeedPost } from "@/types/feed";

const CATEGORIES = [
  "Italian",
  "Japanese",
  "Mexican",
  "Desserts",
  "Street Food",
  "Vegan",
  "Healthy",
  "Pizza",
  "Sushi",
] as const;

const TRENDING_TAGS = [
  "Ramen",
  "Sourdough",
  "Brunch spots",
  "Farm to table",
  "Matcha",
  "Tasting menu",
  "HomemadePasta",
  "Omakase",
] as const;

type SortOption = "relevance" | "rating" | "recent" | "popular";

function searchPosts(
  posts: FeedPost[],
  query: string,
  sort: SortOption
): FeedPost[] {
  const q = query.toLowerCase().trim();

  let results: FeedPost[];
  if (!q) {
    results = [...posts];
  } else {
    const terms = q.split(/\s+/);
    results = posts.filter((post) => {
      const haystack = [
        post.title,
        post.review,
        post.restaurant.name,
        post.restaurant.location,
        post.user.name,
        post.user.handle,
        ...post.tags,
      ]
        .join(" ")
        .toLowerCase();
      return terms.every((t) => haystack.includes(t));
    });
  }

  switch (sort) {
    case "rating":
      return results.sort((a, b) => b.rating - a.rating);
    case "recent":
      return results.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
    case "popular":
      return results.sort((a, b) => b.likes - a.likes);
    case "relevance":
    default:
      return results;
  }
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "rating", label: "Top Rated" },
  { value: "recent", label: "Most Recent" },
  { value: "popular", label: "Most Popular" },
];

const Search = () => {
  const { posts } = useFeed();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("relevance");
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(
    () => searchPosts(posts, query, sort),
    [posts, query, sort]
  );

  const hasQuery = query.trim().length > 0;

  const fillQuery = (text: string) => {
    setQuery(text);
    inputRef.current?.focus();
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="container max-w-3xl py-6 pb-28">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="space-y-6"
      >
        {/* Search bar */}
        <div className="flex items-center gap-3 rounded-2xl bg-card px-5 py-3 shadow-card ring-1 ring-transparent focus-within:ring-2 focus-within:ring-primary/30 transition-shadow">
          <SearchIcon className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dishes, restaurants, foodies..."
            className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
          {hasQuery && (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sort bar - visible when there's a query */}
        <AnimatePresence>
          {hasQuery && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSort(opt.value)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      sort === opt.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results or discovery content */}
        <AnimatePresence mode="wait">
          {hasQuery ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground">
                {results.length}{" "}
                {results.length === 1 ? "result" : "results"} for{" "}
                <span className="font-semibold text-foreground">
                  &ldquo;{query.trim()}&rdquo;
                </span>
              </p>

              {results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {results.map((post, i) => (
                    <FeedCard
                      key={post.id}
                      post={post}
                      index={i}
                      onTagClick={fillQuery}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                    <SearchIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="font-display text-lg font-semibold text-foreground">
                    No matches found
                  </p>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Try a different search term or browse the categories below
                  </p>
                  <button
                    onClick={() => setQuery("")}
                    className="mt-1 text-sm font-medium text-primary hover:underline"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="discover"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Categories */}
              <section className="space-y-3">
                <h2 className="font-display text-lg font-semibold">
                  Popular Categories
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => fillQuery(category)}
                      className="rounded-xl bg-card p-4 text-sm font-medium shadow-card transition-colors hover:bg-primary/10 hover:text-primary text-left"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </section>

              {/* Trending */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h2 className="font-display text-lg font-semibold">
                    Trending Searches
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TRENDING_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => fillQuery(tag)}
                      className="rounded-full bg-muted px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </section>

              {/* Top rated preview */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-star fill-star" />
                  <h2 className="font-display text-lg font-semibold">
                    Top Rated
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[...posts]
                    .sort((a, b) => b.rating - a.rating)
                    .slice(0, 4)
                    .map((post, i) => (
                      <FeedCard
                        key={post.id}
                        post={post}
                        index={i}
                        onTagClick={fillQuery}
                      />
                    ))}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Search;
