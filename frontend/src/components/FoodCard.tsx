import { useState } from "react";
import { Heart, MessageCircle, Bookmark, Star, MapPin, Share2 } from "lucide-react";
import { motion } from "framer-motion";

interface FoodCardProps {
  image: string;
  title: string;
  restaurant: string;
  location: string;
  rating: number;
  likes: number;
  comments: number;
  avatar: string;
  username: string;
  description: string;
  tags: string[];
  index: number;
}

const FoodCard = ({
  image,
  title,
  restaurant,
  location,
  rating,
  likes: initialLikes,
  comments,
  avatar,
  username,
  description,
  tags,
  index,
}: FoodCardProps) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likes, setLikes] = useState(initialLikes);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="bg-card rounded-2xl overflow-hidden shadow-card border border-border hover:shadow-soft transition-shadow duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-background/80 backdrop-blur-sm px-2.5 py-1">
          <Star className="h-3.5 w-3.5 text-star fill-star" />
          <span className="text-xs font-semibold text-foreground">{rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* User row */}
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-gradient-brand flex items-center justify-center text-primary-foreground text-xs font-bold">
            {avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{username}</p>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="text-xs truncate">{location}</span>
            </div>
          </div>
        </div>

        <h3 className="font-display text-lg font-semibold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground mb-1">{restaurant}</p>
        <p className="text-sm text-foreground/80 line-clamp-2 mb-3">{description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-accent text-accent-foreground px-2.5 py-0.5 text-xs font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-4">
            <button onClick={handleLike} className="flex items-center gap-1.5 group">
              <Heart
                className={`h-5 w-5 transition-colors ${
                  liked ? "text-primary fill-primary animate-heart-pop" : "text-muted-foreground group-hover:text-primary"
                }`}
              />
              <span className="text-sm text-muted-foreground">{likes}</span>
            </button>
            <button className="flex items-center gap-1.5 group">
              <MessageCircle className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="text-sm text-muted-foreground">{comments}</span>
            </button>
            <button className="group">
              <Share2 className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          </div>
          <button onClick={() => setSaved(!saved)}>
            <Bookmark
              className={`h-5 w-5 transition-colors ${
                saved ? "text-secondary fill-secondary" : "text-muted-foreground hover:text-foreground"
              }`}
            />
          </button>
        </div>
      </div>
    </motion.article>
  );
};

export default FoodCard;
