import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, ArrowRight } from "lucide-react";
import { useFeed } from "@/hooks/useFeed";

interface TrendingSectionProps {
  activeTag?: string | null;
  onTagSelect?: (tag: string) => void;
}

const TrendingSection = ({ activeTag, onTagSelect }: TrendingSectionProps) => {
  const { posts } = useFeed();

  const trendingTags = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach((post) => {
      post.tags?.forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .map(([tag, count]) => ({ tag, posts: count }))
      .sort((a, b) => b.posts - a.posts)
      .slice(0, 5); // top 5 trending
  }, [posts]);

  if (trendingTags.length === 0) return null;

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl bg-card border border-border p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="font-display text-lg font-semibold text-foreground">Trending Now</h2>
      </div>

      <div className="space-y-3">
        {trendingTags.map((item, i) => {
          const isActive = activeTag === item.tag;
          return (
            <button
              key={item.tag}
              onClick={() => onTagSelect?.(item.tag)}
              className={`flex items-center justify-between w-full group rounded-lg px-3 py-2.5 -mx-3 transition-colors ${
                isActive ? "bg-primary/10" : "hover:bg-muted"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-muted-foreground">#{i + 1}</span>
                <div className="text-left">
                  <p className={`text-sm font-semibold transition-colors ${
                    isActive ? "text-primary" : "text-foreground group-hover:text-primary"
                  }`}>
                    #{item.tag}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.posts} posts</p>
                </div>
              </div>
              <ArrowRight className={`h-4 w-4 text-muted-foreground transition-opacity ${
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`} />
            </button>
          );
        })}
      </div>
    </motion.aside>
  );
};

export default TrendingSection;
