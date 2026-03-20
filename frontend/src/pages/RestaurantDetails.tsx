import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Clock,
  Star,
  ExternalLink,
  ChevronLeft,
  Plus,
  ImageIcon,
} from "lucide-react";
import { usePlaceDetails } from "@/hooks/useGooglePlaces";
import { useFeed } from "@/hooks/useFeed";
import FeedCard from "@/components/FeedCard";
import { Button } from "@/components/ui/button";

const RestaurantDetails = () => {
  const { placeId } = useParams<{ placeId: string }>();
  const { details, loading } = usePlaceDetails(placeId);
  const { posts } = useFeed();

  const restaurantPosts = useMemo(
    () => posts.filter((p) => p.restaurant.placeId === placeId),
    [posts, placeId]
  );

  const restaurant = restaurantPosts[0]?.restaurant;

  const avgRating = useMemo(() => {
    if (restaurantPosts.length === 0) return 0;
    const sum = restaurantPosts.reduce((acc, p) => acc + p.rating, 0);
    return sum / restaurantPosts.length;
  }, [restaurantPosts]);

  const galleryImages = useMemo(
    () => restaurantPosts.map((p) => ({ id: p.id, src: p.image, alt: p.title })),
    [restaurantPosts]
  );

  if (!restaurant && !details) {
    return (
      <div className="container py-16 text-center">
        <p className="text-lg font-semibold text-muted-foreground">
          Restaurant not found
        </p>
        <Link to="/" className="mt-3 inline-block text-sm text-primary hover:underline">
          Back to feed
        </Link>
      </div>
    );
  }

  const name = details?.name || restaurant?.name;
  const address = details?.formattedAddress || restaurant?.location;
  const mapsUrl =
    details?.url ||
    (restaurant ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      restaurant.name + " " + restaurant.location
    )}` : "#");
  const description =
    details?.rating ? `A highly rated location with ${details.rating} stars on Google.` : "A wonderful dining destination loved by the FoodieNet community.";
  
  // Use real hours from Google Places if available, otherwise hide
  const hours = details?.openingHours?.weekdayText || null;

  return (
    <div className="container py-6 space-y-8">
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to feed
      </Link>

      {/* ── Header ───────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl bg-card border border-border shadow-card overflow-hidden"
      >
        <div className="p-6 md:p-8 space-y-4">
          {/* Name + rating */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              {name}
            </h1>
            {avgRating > 0 && (
              <div className="flex items-center gap-1.5 rounded-full bg-star/10 px-3 py-1 w-fit">
                <Star className="h-4 w-4 text-star fill-star" />
                <span className="text-sm font-semibold text-star">
                  {avgRating.toFixed(1)}
               </span>
                <span className="text-xs text-muted-foreground">
                  ({restaurantPosts.length}{" "}
                  {restaurantPosts.length === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-sm md:text-base text-foreground/80 max-w-2xl leading-relaxed">
            {description}
          </p>

          {/* Meta chips */}
          <div className="flex flex-wrap gap-3">
            {/* Address */}
            {address && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors group"
              >
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span className={loading ? "animate-pulse" : ""}>{address}</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </a>
            )}

            {/* Hours */}
            {hours && (
              <div className="inline-flex items-start gap-2 rounded-xl bg-muted/50 px-3 py-2 text-sm text-foreground">
                <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  {hours.map((h, i) => (
                    <p key={i}>{h}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* ── Photo gallery ────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-semibold text-foreground">
            Photos
          </h2>
          <span className="text-xs text-muted-foreground">
            ({galleryImages.length})
          </span>
        </div>

        {galleryImages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {galleryImages.map((img, i) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07, duration: 0.35 }}
                className="relative aspect-square rounded-xl overflow-hidden group"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No photos yet.</p>
        )}
      </section>

      {/* ── Reviews ──────────────────────────────────────────── */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Reviews ({restaurantPosts.length})
          </h2>

          <Button asChild size="lg" className="gap-2 rounded-full shadow-soft">
            <Link to="/add-review">
              <Plus className="h-4 w-4" />
              Add Review
            </Link>
          </Button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={placeId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {restaurantPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {restaurantPosts.map((post, i) => (
                  <FeedCard key={post.id} post={post} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-2xl bg-muted/30 border border-dashed border-border">
                <p className="text-muted-foreground font-medium">
                  No reviews yet — be the first!
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
};

export default RestaurantDetails;
