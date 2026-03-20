import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Send, UtensilsCrossed, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import StarRating from "@/components/StarRating";
import PhotoUpload from "@/components/PhotoUpload";
import RestaurantSearchInput, {
  type RestaurantResult,
} from "@/components/RestaurantSearchInput";
import { useFeed } from "@/hooks/useFeed";
import { useProfile } from "@/hooks/useProfile";

const reviewSchema = z.object({
  photos: z
    .array(z.instanceof(File))
    .min(1, "Add at least one photo of your dish"),
  dishName: z.string().min(2, "Give your dish a name"),
  restaurant: z
    .object({
      name: z.string(),
      location: z.string(),
      placeId: z.string().optional(),
    })
    .nullable()
    .refine((v) => v !== null && v.name.length >= 2, {
      message: "Search and select a restaurant",
    }),
  taste: z.number().min(1, "Rate the taste"),
  service: z.number().min(1, "Rate the service"),
  atmosphere: z.number().min(1, "Rate the atmosphere"),
  price: z.number().min(1, "Rate the value for price"),
  review: z.string().min(10, "Write at least a short review (10+ chars)"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

const RATING_CATEGORIES = [
  {
    key: "taste" as const,
    label: "Taste",
    description: "How did the food taste?",
  },
  {
    key: "service" as const,
    label: "Service",
    description: "Was the staff attentive?",
  },
  {
    key: "atmosphere" as const,
    label: "Atmosphere",
    description: "How was the vibe & ambiance?",
  },
  {
    key: "price" as const,
    label: "Price",
    description: "Was it good value for money?",
  },
];

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const AddReview = () => {
  const { addPost } = useFeed();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      photos: [],
      dishName: "",
      restaurant: null,
      taste: 0,
      service: 0,
      atmosphere: 0,
      price: 0,
      review: "",
    },
  });

  const photos = watch("photos");
  const restaurant = watch("restaurant");

  const ratingAvg = (() => {
    const vals = [watch("taste"), watch("service"), watch("atmosphere"), watch("price")];
    const rated = vals.filter((v) => v > 0);
    return rated.length ? rated.reduce((a, b) => a + b, 0) / rated.length : 0;
  })();

  const onSubmit = async (data: ReviewFormValues) => {
    try {
      const avgRating =
        (data.taste + data.service + data.atmosphere + data.price) / 4;

      await addPost({
        imageFile: data.photos.length > 0 ? data.photos[0] : undefined,
        title: data.dishName,
        rating: Math.round(avgRating * 10) / 10,
        review: data.review,
        tags: data.dishName.split(/\s+/).filter((w) => w.length > 3),
        restaurant: {
          name: data.restaurant!.name,
          location: data.restaurant!.location,
          placeId: data.restaurant!.placeId,
        },
      });

      toast.success("Review posted!", {
        description: `Your review of "${data.dishName}" is now live.`,
      });
      reset();
      navigate("/");
    } catch (e) {
      // Error handled by useFeed and api
    }
  };

  return (
    <div className="container max-w-2xl py-6 pb-28">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={fadeUp} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold">
                Share a Review
              </h2>
              <p className="text-sm text-muted-foreground">
                Tell others about your dining experience
              </p>
            </div>
          </motion.div>

          {/* Photo Upload */}
          <motion.section variants={fadeUp} className="space-y-2">
            <PhotoUpload
              files={photos}
              onChange={(files) => setValue("photos", files, { shouldValidate: true })}
            />
            {errors.photos && (
              <p className="text-sm font-medium text-destructive">
                {errors.photos.message}
              </p>
            )}
          </motion.section>

          {/* Dish Name */}
          <motion.section variants={fadeUp} className="space-y-2">
            <label
              htmlFor="dishName"
              className="text-sm font-medium text-foreground"
            >
              Dish Name
            </label>
            <div className="flex items-center gap-2 rounded-xl bg-card px-4 py-3 shadow-card ring-1 ring-transparent focus-within:ring-2 focus-within:ring-primary/30 transition-shadow">
              <UtensilsCrossed className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                id="dishName"
                type="text"
                value={watch("dishName")}
                onChange={(e) =>
                  setValue("dishName", e.target.value, { shouldValidate: true })
                }
                placeholder="e.g. Truffle Mushroom Risotto"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            {errors.dishName && (
              <p className="text-sm font-medium text-destructive">
                {errors.dishName.message}
              </p>
            )}
          </motion.section>

          {/* Restaurant Search */}
          <motion.section variants={fadeUp} className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Restaurant
            </label>
            <RestaurantSearchInput
              value={restaurant as RestaurantResult | null}
              onChange={(r) =>
                setValue("restaurant", r, { shouldValidate: true })
              }
            />
            {errors.restaurant && (
              <p className="text-sm font-medium text-destructive">
                {errors.restaurant.message}
              </p>
            )}
          </motion.section>

          {/* Rating Categories */}
          <motion.section variants={fadeUp} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Ratings
              </span>
              {ratingAvg > 0 && (
                <span className="rounded-full bg-star/10 px-2.5 py-0.5 text-xs font-semibold text-star tabular-nums">
                  Avg {ratingAvg.toFixed(1)}
                </span>
              )}
            </div>
            <div className="grid gap-5 rounded-2xl bg-card p-5 shadow-card sm:grid-cols-2">
              {RATING_CATEGORIES.map((cat) => (
                <StarRating
                  key={cat.key}
                  label={cat.label}
                  description={cat.description}
                  value={watch(cat.key)}
                  onChange={(v) =>
                    setValue(cat.key, v, { shouldValidate: true })
                  }
                />
              ))}
            </div>
            {(errors.taste || errors.service || errors.atmosphere || errors.price) && (
              <p className="text-sm font-medium text-destructive">
                Please rate all four categories
              </p>
            )}
          </motion.section>

          {/* Review Text */}
          <motion.section variants={fadeUp} className="space-y-2">
            <label
              htmlFor="review"
              className="text-sm font-medium text-foreground"
            >
              Your Review
            </label>
            <textarea
              id="review"
              value={watch("review")}
              onChange={(e) =>
                setValue("review", e.target.value, { shouldValidate: true })
              }
              placeholder="What made this meal special? Share the highlights, flavors, and anything noteworthy..."
              rows={5}
              className="w-full rounded-xl bg-card px-4 py-3 text-sm shadow-card outline-none placeholder:text-muted-foreground resize-none ring-1 ring-transparent focus:ring-2 focus:ring-primary/30 transition-shadow"
            />
            {errors.review && (
              <p className="text-sm font-medium text-destructive">
                {errors.review.message}
              </p>
            )}
          </motion.section>

          {/* Submit */}
          <motion.div variants={fadeUp}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-brand py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isSubmitting ? "Posting..." : "Post Review"}
            </button>
          </motion.div>
        </motion.div>
      </form>
    </div>
  );
};

export default AddReview;
