import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Star,
  Share2,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { usePlaceDetails } from "@/hooks/useGooglePlaces";
import { useFavorites } from "@/hooks/useFavorites";
import { useFollowing } from "@/hooks/useFollowing";
import { useFeed } from "@/hooks/useFeed";
import CommentsSheet from "@/components/CommentsSheet";
import type { FeedPost } from "@/types/feed";

interface FeedCardProps {
  post: FeedPost;
  index: number;
  onTagClick?: (tag: string) => void;
}

const FeedCard = ({ post, index, onTagClick }: FeedCardProps) => {
  const { toggleLike, isLiked } = useFeed();
  const liked = isLiked(post.id);
  const { toggle, isSaved } = useFavorites();
  const saved = isSaved(post.id);
  const { toggle: toggleFollow, isFollowing } = useFollowing();
  const following = isFollowing(post.user.handle);
  const { details, loading } = usePlaceDetails(post.restaurant.placeId);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const handleLike = () => toggleLike(post.id);

  const handleShare = async () => {
    const url = `${window.location.origin}/`;
    const shareData = {
      title: post.title,
      text: `Check out "${post.title}" by ${post.user.name} on FoodieNet!`,
      url,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${shareData.text}\n${shareData.url}`
        );
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        await navigator.clipboard.writeText(
          `${shareData.text}\n${shareData.url}`
        );
        toast.success("Link copied to clipboard!");
      }
    }
  };

  const timeAgo = formatDistanceToNow(post.createdAt, { addSuffix: true });
  const address = details?.formattedAddress || post.restaurant.location;
  const mapsUrl =
    details?.url ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      post.restaurant.name + " " + post.restaurant.location
    )}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="bg-card rounded-2xl overflow-hidden shadow-card border border-border hover:shadow-soft transition-shadow duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={post.image}
          alt={post.title}
          className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-background/80 backdrop-blur-sm px-2.5 py-1">
          <Star className="h-3.5 w-3.5 text-star fill-star" />
          <span className="text-xs font-semibold text-foreground">
            {post.rating.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-gradient-brand flex items-center justify-center shrink-0 overflow-hidden">
            {post.user.avatarUrl ? (
              <img
                src={post.user.avatarUrl}
                alt={post.user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-primary-foreground text-xs font-bold">
                {post.user.avatar}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {post.user.name}
            </p>
            <p className="text-xs text-muted-foreground">{timeAgo}</p>
          </div>
          <button
            onClick={() => toggleFollow(post.user.handle)}
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
              following
                ? "bg-primary/10 text-primary"
                : "text-primary hover:bg-primary/10"
            }`}
          >
            {following ? "Following" : "Follow"}
          </button>
        </div>

        <h3 className="font-display text-lg font-semibold text-foreground mb-1">
          {post.title}
        </h3>

        <div className="flex items-center gap-1 mb-1">
          <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
          <Link
            to={post.restaurant.placeId ? `/restaurant/${post.restaurant.placeId}` : "#"}
            className="text-sm truncate text-muted-foreground hover:text-primary transition-colors"
          >
            {post.restaurant.name}
          </Link>
          <span className="text-xs hidden sm:inline text-muted-foreground">-</span>
          <span
            className={`text-xs truncate hidden sm:inline text-muted-foreground ${
              loading ? "animate-pulse" : ""
            }`}
          >
            {address}
          </span>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>

        <p className="text-sm text-foreground/80 line-clamp-2 mb-3">
          {post.review}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagClick?.(tag)}
              className="rounded-full bg-accent text-accent-foreground px-2.5 py-0.5 text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className="flex items-center gap-1.5 group"
            >
              <Heart
                className={`h-5 w-5 transition-colors ${
                  liked
                    ? "text-primary fill-primary animate-heart-pop"
                    : "text-muted-foreground group-hover:text-primary"
                }`}
              />
              <span className="text-sm text-muted-foreground">{post.likes}</span>
            </button>
            <button
              onClick={() => setCommentsOpen(true)}
              className="flex items-center gap-1.5 group"
            >
              <MessageCircle className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="text-sm text-muted-foreground">
                {post.comments}
              </span>
            </button>
            <button onClick={handleShare} className="group">
              <Share2 className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          </div>
          <button onClick={() => toggle(post.id)}>
            <Bookmark
              className={`h-5 w-5 transition-colors ${
                saved
                  ? "text-secondary fill-secondary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            />
          </button>
        </div>
      </div>

      <CommentsSheet
        post={post}
        open={commentsOpen}
        onOpenChange={setCommentsOpen}
      />
    </motion.article>
  );
};

export default FeedCard;
