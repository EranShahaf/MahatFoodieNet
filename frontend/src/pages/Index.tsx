import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import CategoryPills from "@/components/CategoryPills";
import FeedCard from "@/components/FeedCard";
import TrendingSection from "@/components/TrendingSection";
import SuggestedUsers from "@/components/SuggestedUsers";
import { useFeed } from "@/hooks/useFeed";

function matchesTag(postTags: string[], filter: string): boolean {
  const f = filter.toLowerCase();
  return postTags.some((t) => t.toLowerCase().includes(f) || f.includes(t.toLowerCase()));
}

const Index = () => {
  const { posts } = useFeed();
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filteredPosts = useMemo(() => {
    if (!activeTag) return posts;
    return posts.filter((post) => matchesTag(post.tags, activeTag));
  }, [activeTag, posts]);

  return (
    <>
      <CategoryPills activeTag={activeTag} onTagChange={setActiveTag} />

      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {activeTag && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Filtering by <span className="font-semibold text-foreground">#{activeTag}</span>
                </span>
                <button
                  onClick={() => setActiveTag(null)}
                  className="text-xs text-primary hover:underline"
                >
                  Clear filter
                </button>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTag ?? "all"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {filteredPosts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {filteredPosts.map((post, i) => (
                      <FeedCard
                        key={post.id}
                        post={post}
                        index={i}
                        onTagClick={setActiveTag}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <p className="text-lg font-semibold text-muted-foreground">
                      No posts found for #{activeTag}
                    </p>
                    <button
                      onClick={() => setActiveTag(null)}
                      className="mt-2 text-sm text-primary hover:underline"
                    >
                      Show all posts
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <aside className="hidden lg:block space-y-6 sticky top-20 self-start">
            <TrendingSection activeTag={activeTag} onTagSelect={setActiveTag} />
            <SuggestedUsers />
          </aside>
        </div>
      </div>
    </>
  );
};

export default Index;
