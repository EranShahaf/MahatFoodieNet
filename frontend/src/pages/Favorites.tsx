import { useMemo } from "react";
import { Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import FeedCard from "@/components/FeedCard";
import { useFavorites } from "@/hooks/useFavorites";
import { useFeed } from "@/hooks/useFeed";

const Favorites = () => {
  const { ids } = useFavorites();
  const { posts } = useFeed();
  const navigate = useNavigate();

  const savedPosts = useMemo(
    () => posts.filter((p) => ids.has(p.id)),
    [posts, ids]
  );

  return (
    <div className="container max-w-3xl py-6 pb-28">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Your Favorites</h2>
          {savedPosts.length > 0 && (
            <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
              {savedPosts.length} saved
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {savedPosts.length > 0 ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-5"
            >
              {savedPosts.map((post, i) => (
                <FeedCard key={post.id} post={post} index={i} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-card py-20 shadow-card"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Bookmark className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="font-display text-lg font-semibold text-foreground">
                No saved posts yet
              </p>
              <p className="text-sm text-muted-foreground max-w-xs text-center">
                Tap the bookmark icon on any review to save it here for quick access later.
              </p>
              <button
                onClick={() => navigate("/")}
                className="mt-2 rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-opacity hover:opacity-90"
              >
                Browse Reviews
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Favorites;
